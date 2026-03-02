import * as issueService from "../services/issue.service.js";

export const createIssue = async (req, res) => {
    try {
        const issue = await issueService.createIssue(req.body, req.user.userId);
        res.status(201).json(issue);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const getIssues = async (req, res) => {
    try {
        const issues = await issueService.getIssues(req.query);
        res.json(issues);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getIssueById = async (req, res) => {
    try {
        const issue = await issueService.getIssueById(req.params.id);
        res.json(issue);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

export const updateIssue = async (req, res) => {
    try {
        const issue = await issueService.updateIssue(req.params.id, req.body);
        res.json(issue);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteIssue = async (req, res) => {
    try {
        await issueService.deleteIssue(req.params.id);
        res.json({ message: "Issue deleted" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const addComment = async (req, res) => {
    try {
        const comment = await issueService.addComment(
            req.params.id,
            req.user.userId,
            req.body.comment
        );
        res.status(201).json(comment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const statusCounts = async (req, res) => {
    try {
        const data = await issueService.getStatusCounts();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};