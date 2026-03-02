import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { issuesAPI, projectsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import CreateIssueModal from '../components/CreateIssueModal';
import './DashboardPage.css';

const STATUS_CONFIG = [
    { key: 'Open', icon: '🔵', label: 'Open' },
    { key: 'In Progress', icon: '🟡', label: 'In Progress' },
    { key: 'Resolved', icon: '🟢', label: 'Resolved' },
    { key: 'Closed', icon: '⚫', label: 'Closed' },
];

function getBadgeClass(type, value) {
    if (!value) return '';
    const v = value.toLowerCase().replace(/\s+/g, '-');
    return `badge badge-${v}`;
}

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { isManager } = useAuth();

    // Data
    const [issues, setIssues] = useState([]);
    const [statusCounts, setStatusCounts] = useState({});
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filters
    const [filters, setFilters] = useState({
        projectId: '',
        priority: '',
        status: '',
        assignedTo: '',
    });
    const [search, setSearch] = useState('');

    // Modal
    const showCreateModal = searchParams.get('create') === 'true';

    const fetchIssues = useCallback(async () => {
        try {
            const res = await issuesAPI.getAll(filters);
            setIssues(res.data);
        } catch (err) {
            setError('Failed to load issues.');
        }
    }, [filters]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await issuesAPI.getStatusCounts();
            const counts = {};
            (res.data || []).forEach(item => {
                counts[item.status] = parseInt(item.count, 10);
            });
            setStatusCounts(counts);
        } catch {
            // non-critical
        }
    }, []);

    const fetchDropdownData = useCallback(async () => {
        try {
            const projRes = await projectsAPI.getAll();
            setProjects(projRes.data || []);
        } catch {
            // non-critical
        }
        try {
            const userRes = await usersAPI.getAll();
            setUsers(userRes.data || []);
        } catch {
            // non-critical — /api/users may not be registered yet
        }
    }, []);

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            await Promise.all([fetchIssues(), fetchStats(), fetchDropdownData()]);
            setLoading(false);
        };
        loadAll();
    }, [fetchIssues, fetchStats, fetchDropdownData]);

    // Real-time: re-fetch when server emits changes
    useSocket({
        'issues:changed': () => {
            fetchIssues();
            fetchStats();
        },
        'projects:changed': () => {
            fetchDropdownData();
        },
    });

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this issue?')) return;
        try {
            await issuesAPI.delete(id);
            fetchIssues();
            fetchStats();
        } catch {
            setError('Failed to delete issue.');
        }
    };

    const openCreateModal = () => {
        setSearchParams({ create: 'true' });
    };

    const closeCreateModal = () => {
        setSearchParams({});
    };

    const handleIssueCreated = () => {
        closeCreateModal();
        fetchIssues();
        fetchStats();
    };

    // Client-side search filter
    const filteredIssues = issues.filter(issue => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            issue.title?.toLowerCase().includes(q) ||
            issue.description?.toLowerCase().includes(q)
        );
    });

    const totalIssues = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    if (loading) {
        return (
            <div className="page-loader">
                <div className="spinner spinner-lg"></div>
            </div>
        );
    }

    return (
        <>
            {/* Stats */}
            <div className="stats-row">
                {STATUS_CONFIG.map(({ key, icon, label }) => (
                    <div className="stat-card" key={key}>
                        <div className={`stat-icon ${key.toLowerCase().replace(/\s+/g, '-')}`}>
                            {icon}
                        </div>
                        <div className="stat-info">
                            <span className="stat-count">{statusCounts[key] || 0}</span>
                            <span className="stat-label">{label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="dashboard-toolbar">
                <div className="toolbar-filters">
                    <div className="toolbar-search">
                        <span className="toolbar-search-icon">🔍</span>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search issues..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className="form-select"
                        value={filters.projectId}
                        onChange={(e) => handleFilterChange('projectId', e.target.value)}
                    >
                        <option value="">All Projects</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>

                    <select
                        className="form-select"
                        value={filters.priority}
                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                    >
                        <option value="">All Priorities</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </select>

                    <select
                        className="form-select"
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                    </select>

                    <select
                        className="form-select"
                        value={filters.assignedTo}
                        onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                    >
                        <option value="">All Assignees</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                </div>

                <button className="btn btn-primary" onClick={openCreateModal}>
                    ➕ New Issue
                </button>
            </div>

            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

            {/* Issues Table */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Project</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Assignee</th>
                            <th>Created</th>
                            {isManager && <th style={{ width: 48 }}></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredIssues.length === 0 ? (
                            <tr>
                                <td colSpan={isManager ? 7 : 6}>
                                    <div className="empty-state">
                                        <div className="empty-state-icon">📋</div>
                                        <div className="empty-state-title">No issues found</div>
                                        <p>Try adjusting your filters or create a new issue.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredIssues.map(issue => (
                                <tr
                                    key={issue.id}
                                    className="clickable-row"
                                    onClick={() => navigate(`/issues/${issue.id}`)}
                                >
                                    <td>
                                        <div className="issue-title-cell">{issue.title}</div>
                                        {issue.description && (
                                            <div className="issue-title-desc">{issue.description}</div>
                                        )}
                                    </td>
                                    <td>{issue.Project?.name || '—'}</td>
                                    <td>
                                        <span className={getBadgeClass('priority', issue.priority)}>
                                            {issue.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={getBadgeClass('status', issue.status)}>
                                            {issue.status}
                                        </span>
                                    </td>
                                    <td>
                                        {issue.assignee ? (
                                            <div className="issue-assignee">
                                                <div className="issue-assignee-avatar">
                                                    {getInitials(issue.assignee.name)}
                                                </div>
                                                {issue.assignee.name}
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--color-text-muted)' }}>Unassigned</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className="issue-date">{formatDate(issue.createdAt)}</span>
                                    </td>
                                    {isManager && (
                                        <td>
                                            <button
                                                className="delete-btn"
                                                onClick={(e) => handleDelete(e, issue.id)}
                                                title="Delete issue"
                                            >
                                                🗑
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: 12, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                Showing {filteredIssues.length} of {totalIssues} total issues
            </div>

            {/* Create Issue Modal */}
            {showCreateModal && (
                <CreateIssueModal
                    projects={projects}
                    users={users}
                    onClose={closeCreateModal}
                    onCreated={handleIssueCreated}
                />
            )}
        </>
    );
}
