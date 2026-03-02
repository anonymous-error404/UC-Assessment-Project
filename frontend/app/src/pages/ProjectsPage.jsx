import { useState, useEffect, useCallback } from 'react';
import { projectsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ProjectsPage.css';

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProjectsPage() {
    const { isManager } = useAuth();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Create form
    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState({ name: '', description: '' });
    const [createLoading, setCreateLoading] = useState(false);

    // Edit form
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', description: '' });
    const [editLoading, setEditLoading] = useState(false);

    const fetchProjects = useCallback(async () => {
        try {
            const res = await projectsAPI.getAll();
            setProjects(res.data || []);
        } catch {
            setError('Failed to load projects.');
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await fetchProjects();
            setLoading(false);
        };
        load();
    }, [fetchProjects]);

    // Create
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!createForm.name.trim()) {
            setError('Project name is required.');
            return;
        }
        setCreateLoading(true);
        setError('');
        try {
            await projectsAPI.create({
                name: createForm.name.trim(),
                description: createForm.description.trim(),
            });
            setCreateForm({ name: '', description: '' });
            setShowCreate(false);
            await fetchProjects();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create project.');
        } finally {
            setCreateLoading(false);
        }
    };

    // Edit
    const startEdit = (project) => {
        setEditingId(project.id);
        setEditForm({ name: project.name, description: project.description || '' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ name: '', description: '' });
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        if (!editForm.name.trim()) {
            setError('Project name is required.');
            return;
        }
        setEditLoading(true);
        setError('');
        try {
            await projectsAPI.update(editingId, {
                name: editForm.name.trim(),
                description: editForm.description.trim(),
            });
            cancelEdit();
            await fetchProjects();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update project.');
        } finally {
            setEditLoading(false);
        }
    };

    // Delete
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project? All related issues may be affected.')) return;
        try {
            await projectsAPI.delete(id);
            await fetchProjects();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete project.');
        }
    };

    if (loading) {
        return (
            <div className="page-loader">
                <div className="spinner spinner-lg"></div>
            </div>
        );
    }

    return (
        <>
            <div className="projects-header">
                <div>
                    <h2 className="projects-header-title">Projects</h2>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                        {projects.length} project{projects.length !== 1 ? 's' : ''}
                    </p>
                </div>
                {isManager && (
                    <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
                        {showCreate ? 'Cancel' : '➕ New Project'}
                    </button>
                )}
            </div>

            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

            {/* Create Project Form */}
            {showCreate && isManager && (
                <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                    <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                        Create New Project
                    </h3>
                    <form className="project-edit-form" onSubmit={handleCreate}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="new-proj-name">Project Name *</label>
                            <input
                                id="new-proj-name"
                                type="text"
                                className="form-input"
                                placeholder="e.g. Client Portal Redesign"
                                value={createForm.name}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="new-proj-desc">Description</label>
                            <textarea
                                id="new-proj-desc"
                                className="form-textarea"
                                placeholder="Brief description of the project..."
                                value={createForm.description}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                                style={{ minHeight: 80 }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={createLoading}>
                                {createLoading ? <><div className="spinner"></div> Creating...</> : 'Create Project'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Projects Grid */}
            {projects.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📁</div>
                    <div className="empty-state-title">No projects yet</div>
                    <p>{isManager ? 'Create your first project to get started.' : 'No projects have been created yet.'}</p>
                </div>
            ) : (
                <div className="projects-grid">
                    {projects.map(project => (
                        <div className="project-card" key={project.id}>
                            {editingId === project.id ? (
                                /* Edit Mode */
                                <form className="project-edit-form" onSubmit={handleEdit}>
                                    <div className="form-group">
                                        <label className="form-label">Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-textarea"
                                            value={editForm.description}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                            style={{ minHeight: 60 }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                                        <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
                                        <button type="submit" className="btn btn-primary btn-sm" disabled={editLoading}>
                                            {editLoading ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                /* View Mode */
                                <>
                                    <div className="project-card-header">
                                        <div className="project-card-icon">📂</div>
                                        {isManager && (
                                            <div className="project-card-actions">
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => startEdit(project)}
                                                    title="Edit project"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(project.id)}
                                                    title="Delete project"
                                                >
                                                    🗑
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="project-card-title">{project.name}</div>
                                    {project.description && (
                                        <div className="project-card-desc">{project.description}</div>
                                    )}
                                    <div className="project-card-meta">
                                        <span className="project-card-meta-item">
                                            👤 {project.manager?.name || 'Unknown'}
                                        </span>
                                        <span className="project-card-meta-item">
                                            📅 {formatDate(project.createdAt)}
                                        </span>
                                        {project.Issues && (
                                            <span className="project-card-meta-item">
                                                🐛 {project.Issues.length} issue{project.Issues.length !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
