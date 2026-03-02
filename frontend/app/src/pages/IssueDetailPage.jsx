import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { issuesAPI, commentsAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './IssueDetailPage.css';

function getBadgeClass(value) {
    if (!value) return '';
    const v = value.toLowerCase().replace(/\s+/g, '-');
    return `badge badge-${v}`;
}

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const now = new Date();
    const d = new Date(dateStr);
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return formatDate(dateStr);
}

export default function IssueDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isManager } = useAuth();

    const [issue, setIssue] = useState(null);
    const [comments, setComments] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Comment form
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);

    // Edit fields (manager)
    const [editStatus, setEditStatus] = useState('');
    const [editAssignee, setEditAssignee] = useState('');

    const fetchIssue = useCallback(async () => {
        try {
            const res = await issuesAPI.getById(id);
            setIssue(res.data);
            setEditStatus(res.data.status || '');
            setEditAssignee(res.data.assignedTo || '');
            // Comments come included from the backend
            setComments(res.data.IssueComments || []);
        } catch (err) {
            setError('Failed to load issue.');
        }
    }, [id]);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await usersAPI.getAll();
            setUsers(res.data || []);
        } catch {
            // non-critical
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await Promise.all([fetchIssue(), fetchUsers()]);
            setLoading(false);
        };
        load();
    }, [fetchIssue, fetchUsers]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setCommentLoading(true);
        try {
            await commentsAPI.add(id, newComment.trim());
            setNewComment('');
            // Re-fetch issue to get updated comments with commenter info
            await fetchIssue();
        } catch {
            setError('Failed to add comment.');
        } finally {
            setCommentLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await commentsAPI.delete(commentId);
            await fetchIssue();
        } catch {
            setError('Failed to delete comment.');
        }
    };

    const handleStatusChange = async (newStatus) => {
        setEditStatus(newStatus);
        try {
            await issuesAPI.update(id, { status: newStatus });
            setIssue(prev => ({ ...prev, status: newStatus }));
        } catch {
            setError('Failed to update status.');
            setEditStatus(issue.status);
        }
    };

    const handleAssigneeChange = async (newAssignee) => {
        setEditAssignee(newAssignee);
        try {
            await issuesAPI.update(id, { assignedTo: newAssignee || null });
            await fetchIssue();
        } catch {
            setError('Failed to update assignee.');
            setEditAssignee(issue.assignedTo || '');
        }
    };

    if (loading) {
        return (
            <div className="page-loader">
                <div className="spinner spinner-lg"></div>
            </div>
        );
    }

    if (error && !issue) {
        return (
            <div>
                <button className="back-link" onClick={() => navigate('/')}>← Back to Dashboard</button>
                <div className="alert alert-error">{error}</div>
            </div>
        );
    }

    if (!issue) return null;

    return (
        <>
            <button className="back-link" onClick={() => navigate('/')}>
                ← Back to Dashboard
            </button>

            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

            <div className="issue-detail">
                {/* Main Content */}
                <div className="issue-main">
                    <div>
                        <div className="issue-header">
                            <h1 className="issue-title">{issue.title}</h1>
                        </div>
                        <div className="issue-meta">
                            <span className={getBadgeClass(issue.priority)}>{issue.priority}</span>
                            <span className={getBadgeClass(issue.status)}>{issue.status}</span>
                            <span className="issue-meta-item">
                                Created {formatDateTime(issue.createdAt)}
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="issue-description-card">
                        <div className="issue-description-label">Description</div>
                        <div className="issue-description-text">
                            {issue.description || 'No description provided.'}
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="comments-section">
                        <div className="comments-header">
                            <h2 className="comments-title">Comments</h2>
                            <span className="comments-count">{comments.length}</span>
                        </div>

                        {comments.length === 0 ? (
                            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                                <div className="empty-state-icon">💬</div>
                                <div className="empty-state-title">No comments yet</div>
                                <p>Be the first to comment on this issue.</p>
                            </div>
                        ) : (
                            comments.map(c => (
                                <div className="comment-card" key={c.id}>
                                    <div className="comment-header">
                                        <div className="comment-avatar">
                                            {getInitials(c.commenter?.name)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div className="comment-author">{c.commenter?.name || 'Unknown'}</div>
                                            <div className="comment-time">{timeAgo(c.createdAt)}</div>
                                        </div>
                                        {isManager && (
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDeleteComment(c.id)}
                                                title="Delete comment"
                                            >
                                                🗑
                                            </button>
                                        )}
                                    </div>
                                    <div className="comment-body">{c.comment}</div>
                                </div>
                            ))
                        )}

                        {/* Add Comment Form */}
                        <form className="add-comment-form" onSubmit={handleAddComment}>
                            <textarea
                                className="form-textarea"
                                placeholder="Write a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={commentLoading || !newComment.trim()}
                                style={{ alignSelf: 'flex-end' }}
                            >
                                {commentLoading ? (
                                    <div className="spinner"></div>
                                ) : (
                                    'Post'
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sidebar Panel */}
                <div className="issue-sidebar">
                    {/* Properties */}
                    <div className="issue-sidebar-card">
                        <h3 className="issue-sidebar-title">Properties</h3>

                        <div className="issue-property">
                            <span className="issue-property-label">Status</span>
                            {isManager ? (
                                <select
                                    className="form-select"
                                    value={editStatus}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    style={{ width: 'auto', minWidth: 130, marginTop: 0 }}
                                >
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            ) : (
                                <span className={getBadgeClass(issue.status)}>{issue.status}</span>
                            )}
                        </div>

                        <div className="issue-property">
                            <span className="issue-property-label">Priority</span>
                            <span className={getBadgeClass(issue.priority)}>{issue.priority}</span>
                        </div>

                        <div className="issue-property">
                            <span className="issue-property-label">Assignee</span>
                            {isManager ? (
                                <select
                                    className="form-select"
                                    value={editAssignee}
                                    onChange={(e) => handleAssigneeChange(e.target.value)}
                                    style={{ width: 'auto', minWidth: 130, marginTop: 0 }}
                                >
                                    <option value="">Unassigned</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <span className="issue-property-value">
                                    {issue.assignee?.name || 'Unassigned'}
                                </span>
                            )}
                        </div>

                        <div className="issue-property">
                            <span className="issue-property-label">Project</span>
                            <span className="issue-property-value">{issue.Project?.name || '—'}</span>
                        </div>
                    </div>

                    {/* People */}
                    <div className="issue-sidebar-card">
                        <h3 className="issue-sidebar-title">People</h3>

                        <div className="issue-property">
                            <span className="issue-property-label">Created by</span>
                            <span className="issue-property-value">{issue.creator?.name || '—'}</span>
                        </div>

                        <div className="issue-property">
                            <span className="issue-property-label">Assigned to</span>
                            <span className="issue-property-value">{issue.assignee?.name || 'Unassigned'}</span>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="issue-sidebar-card">
                        <h3 className="issue-sidebar-title">Dates</h3>

                        <div className="issue-property">
                            <span className="issue-property-label">Created</span>
                            <span className="issue-property-value" style={{ fontSize: 'var(--font-size-xs)' }}>
                                {formatDate(issue.createdAt)}
                            </span>
                        </div>

                        <div className="issue-property">
                            <span className="issue-property-label">Updated</span>
                            <span className="issue-property-value" style={{ fontSize: 'var(--font-size-xs)' }}>
                                {formatDate(issue.updatedAt)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
