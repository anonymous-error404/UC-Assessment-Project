import * as issueService from "../services/issue.service.js";
import { getIO } from "../socket.js";

export const createIssue = async (req, res) => {
    try {
        // Only managers can assign issues
        if (req.user.role !== "manager") {
            delete req.body.assignedTo;
        }
        const issue = await issueService.createIssue(req.body, req.user.userId);
        res.status(201).json(issue);
        getIO().emit("issues:changed");
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
        getIO().emit("issues:changed");
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteIssue = async (req, res) => {
    try {
        await issueService.deleteIssue(req.params.id);
        res.json({ message: "Issue deleted" });
        getIO().emit("issues:changed");
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
        getIO().emit("issues:changed");
        getIO().emit("comments:changed", { issueId: req.params.id });
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

export const priorityCounts = async (req, res) => {
    try {
        const data = await issueService.issuesByPriority();
        res.json(data);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
};

export const projectCounts = async (req, res) => {
    try {
        const data = await issueService.issuesByProject();
        res.json(data);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
};

export const exportCSV = async (req, res) => {
    try {
        const issues = await issueService.getIssues({});

        const headers = ["Title", "Description", "Project", "Priority", "Status", "Assignee", "Created By", "Created At"];

        const escapeCSV = (val) => {
            if (val == null) return "";
            const str = String(val);
            if (str.includes(",") || str.includes('"') || str.includes("\n")) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const rows = issues.map(issue => [
            escapeCSV(issue.title),
            escapeCSV(issue.description),
            escapeCSV(issue.Project?.name),
            escapeCSV(issue.priority),
            escapeCSV(issue.status),
            escapeCSV(issue.assignee?.name || "Unassigned"),
            escapeCSV(issue.creator?.name),
            escapeCSV(issue.createdAt ? new Date(issue.createdAt).toISOString() : ""),
        ]);

        const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=issues_export.csv");
        res.send(csv);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};