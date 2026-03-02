import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Redirect on 401
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

// ---- Auth ----
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
};

// ---- Issues ----
export const issuesAPI = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, val]) => {
            if (val) params.set(key, val);
        });
        return api.get(`/issues?${params.toString()}`);
    },
    getById: (id) => api.get(`/issues/${id}`),
    create: (data) => api.post('/issues', data),
    update: (id, data) => api.put(`/issues/${id}`, data),
    delete: (id) => api.delete(`/issues/${id}`),
    getStatusCounts: () => api.get('/issues/stats/status'),
    getPriorityCounts: () => api.get('/issues/stats/priority'),
    getProjectCounts: () => api.get('/issues/stats/project'),
};

// ---- Comments ----
export const commentsAPI = {
    add: (issueId, comment) => api.post(`/comments/${issueId}`, { comment }),
    getByIssue: (issueId) => api.get(`/comments/${issueId}`),
    delete: (commentId) => api.delete(`/comments/delete/${commentId}`),
};

// ---- Projects ----
export const projectsAPI = {
    getAll: () => api.get('/projects'),
    getById: (id) => api.get(`/projects/${id}`),
    create: (data) => api.post('/projects', data),
    update: (id, data) => api.put(`/projects/${id}`, data),
    delete: (id) => api.delete(`/projects/${id}`),
};

// ---- Users ----
export const usersAPI = {
    getAll: () => api.get('/users'),
};

export default api;
