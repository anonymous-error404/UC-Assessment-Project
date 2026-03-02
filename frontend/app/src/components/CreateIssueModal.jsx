import { useState } from 'react';
import { issuesAPI } from '../services/api';

export default function CreateIssueModal({ projects, users, isManager, onClose, onCreated }) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        projectId: '',
        priority: 'Medium',
        assignedTo: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!form.title.trim()) {
            setError('Title is required.');
            return;
        }
        if (!form.description.trim()) {
            setError('Description is required.');
            return;
        }
        if (!form.projectId) {
            setError('Please select a project.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),
                projectId: form.projectId,
                priority: form.priority,
            };
            if (isManager && form.assignedTo) {
                payload.assignedTo = form.assignedTo;
            }
            await issuesAPI.create(payload);
            onCreated();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create issue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Create New Issue</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="issue-title">Title *</label>
                        <input
                            id="issue-title"
                            type="text"
                            className="form-input"
                            placeholder="Brief summary of the issue"
                            value={form.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="issue-desc">Description *</label>
                        <textarea
                            id="issue-desc"
                            className="form-textarea"
                            placeholder="Describe the issue in detail..."
                            value={form.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="issue-project">Project *</label>
                            <select
                                id="issue-project"
                                className="form-select"
                                value={form.projectId}
                                onChange={(e) => handleChange('projectId', e.target.value)}
                            >
                                <option value="">Select project</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="issue-priority">Priority</label>
                            <select
                                id="issue-priority"
                                className="form-select"
                                value={form.priority}
                                onChange={(e) => handleChange('priority', e.target.value)}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>
                    </div>

                    {isManager && (
                        <div className="form-group">
                            <label className="form-label" htmlFor="issue-assignee">Assignee</label>
                            <select
                                id="issue-assignee"
                                className="form-select"
                                value={form.assignedTo}
                                onChange={(e) => handleChange('assignedTo', e.target.value)}
                            >
                                <option value="">Unassigned</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {error && <div className="alert alert-error">{error}</div>}

                    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? (
                                <>
                                    <div className="spinner"></div>
                                    Creating...
                                </>
                            ) : (
                                'Create Issue'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
