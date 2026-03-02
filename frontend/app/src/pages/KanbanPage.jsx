import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    rectIntersection,
    useDroppable,
    useDraggable,
} from '@dnd-kit/core';
import { issuesAPI, projectsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import './KanbanPage.css';

const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ---- Droppable Column ----
function Column({ status, children }) {
    const { setNodeRef, isOver } = useDroppable({ id: status });
    const dotClass = status.toLowerCase().replace(/\s+/g, '-');

    return (
        <div ref={setNodeRef} className={`kanban-column ${isOver ? 'drag-over' : ''}`}>
            <div className="kanban-column-header">
                <span className="kanban-column-title">
                    <span className={`kanban-column-dot ${dotClass}`} />
                    {status}
                </span>
                <span className="kanban-column-count">
                    {Array.isArray(children) ? children.length : (children ? 1 : 0)}
                </span>
            </div>
            <div className="kanban-cards">
                {(!children || (Array.isArray(children) && children.length === 0)) ? (
                    <div className="kanban-empty">No issues</div>
                ) : (
                    children
                )}
            </div>
        </div>
    );
}

// ---- Draggable Card ----
function Card({ issue, canDrag, onClick }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({
        id: issue.id,
        data: { issue },
        disabled: !canDrag,
    });

    const style = {
        ...(transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : {}),
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            className={`kanban-card ${canDrag ? 'draggable' : ''}`}
            style={style}
            {...attributes}
            {...listeners}
        >
            <div
                className="kanban-card-title"
                onClick={(e) => { e.stopPropagation(); onClick(issue.id); }}
                style={{ cursor: 'pointer' }}
            >
                {issue.title}
            </div>
            <div className="kanban-card-meta">
                <span className={`badge badge-${(issue.priority || '').toLowerCase()}`}>
                    {issue.priority}
                </span>
                {issue.assignee ? (
                    <span className="kanban-card-assignee">
                        <span className="kanban-card-avatar">{getInitials(issue.assignee.name)}</span>
                        {issue.assignee.name}
                    </span>
                ) : (
                    <span className="kanban-card-assignee" style={{ fontStyle: 'italic' }}>
                        Unassigned
                    </span>
                )}
            </div>
        </div>
    );
}

// ---- Overlay shown while dragging ----
function CardOverlay({ issue }) {
    if (!issue) return null;
    return (
        <div className="kanban-card draggable" style={{ boxShadow: 'var(--shadow-lg)', borderColor: 'var(--color-primary)', cursor: 'grabbing' }}>
            <div className="kanban-card-title">{issue.title}</div>
            <div className="kanban-card-meta">
                <span className={`badge badge-${(issue.priority || '').toLowerCase()}`}>
                    {issue.priority}
                </span>
                {issue.assignee ? (
                    <span className="kanban-card-assignee">
                        <span className="kanban-card-avatar">{getInitials(issue.assignee.name)}</span>
                        {issue.assignee.name}
                    </span>
                ) : (
                    <span className="kanban-card-assignee" style={{ fontStyle: 'italic' }}>Unassigned</span>
                )}
            </div>
        </div>
    );
}

// ---- Main Page ----
export default function KanbanPage() {
    const navigate = useNavigate();
    const { isManager } = useAuth();
    const [issues, setIssues] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterProject, setFilterProject] = useState('');
    const [search, setSearch] = useState('');
    const [activeIssue, setActiveIssue] = useState(null);

    // Require a small drag distance so clicks still work
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        })
    );

    const fetchIssues = useCallback(async () => {
        try {
            const params = {};
            if (filterProject) params.projectId = filterProject;
            const res = await issuesAPI.getAll(params);
            setIssues(res.data || []);
        } catch { /* silent */ }
    }, [filterProject]);

    const fetchProjects = useCallback(async () => {
        try {
            const res = await projectsAPI.getAll();
            setProjects(res.data || []);
        } catch { /* silent */ }
    }, []);

    useEffect(() => {
        (async () => {
            setLoading(true);
            await Promise.all([fetchIssues(), fetchProjects()]);
            setLoading(false);
        })();
    }, [fetchIssues, fetchProjects]);

    // Real-time
    useSocket({ 'issues:changed': () => fetchIssues() });

    // ---- Filtering ----
    const filtered = issues.filter(i => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return i.title?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q);
    });

    // Group by status
    const columns = {};
    STATUSES.forEach(s => { columns[s] = []; });
    filtered.forEach(i => { if (columns[i.status]) columns[i.status].push(i); });

    // ---- Drag handlers ----
    function handleDragStart({ active }) {
        const issue = issues.find(i => i.id === active.id);
        setActiveIssue(issue || null);
    }

    async function handleDragEnd({ active, over }) {
        setActiveIssue(null);
        if (!over) return;

        const issueId = active.id;
        const newStatus = over.id; // droppable id = status string
        const issue = issues.find(i => i.id === issueId);
        if (!issue || issue.status === newStatus) return;
        if (!STATUSES.includes(newStatus)) return;

        // Optimistic UI update
        const oldStatus = issue.status;
        setIssues(prev => prev.map(i =>
            i.id === issueId ? { ...i, status: newStatus } : i
        ));

        try {
            await issuesAPI.update(issueId, { status: newStatus });
        } catch {
            // Revert on failure
            setIssues(prev => prev.map(i =>
                i.id === issueId ? { ...i, status: oldStatus } : i
            ));
        }
    }

    if (loading) {
        return <div className="page-loader"><div className="spinner spinner-lg" /></div>;
    }

    return (
        <>
            {/* Toolbar */}
            <div className="kanban-toolbar">
                <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search issues..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: 36 }}
                    />
                </div>
                <select
                    className="form-select"
                    value={filterProject}
                    onChange={e => setFilterProject(e.target.value)}
                >
                    <option value="">All Projects</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {!isManager && (
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        🔒 View-only (managers can drag cards)
                    </span>
                )}
            </div>

            {/* Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={rectIntersection}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={() => setActiveIssue(null)}
            >
                <div className="kanban-board">
                    {STATUSES.map(status => (
                        <Column key={status} status={status}>
                            {columns[status].map(issue => (
                                <Card
                                    key={issue.id}
                                    issue={issue}
                                    canDrag={isManager}
                                    onClick={(id) => navigate(`/issues/${id}`)}
                                />
                            ))}
                        </Column>
                    ))}
                </div>

                <DragOverlay dropAnimation={null}>
                    {activeIssue ? <CardOverlay issue={activeIssue} /> : null}
                </DragOverlay>
            </DndContext>
        </>
    );
}
