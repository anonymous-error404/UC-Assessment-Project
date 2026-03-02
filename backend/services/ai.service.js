import { GoogleGenerativeAI } from "@google/generative-ai";
import { Issue, Project, User, IssueComment } from "../models/index.js";

let genAI;
let model;

function getModel() {
    if (!model) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }
    return model;
}

// ---- Chatbot: answer questions about issues/projects ----
export const chat = async (message, context = "") => {
    const ai = getModel();

    // Fetch all issues and projects as context
    const [issues, projects] = await Promise.all([
        Issue.findAll({
            include: [
                { model: Project, attributes: ["name"] },
                { model: User, as: "creator", attributes: ["name"] },
                { model: User, as: "assignee", attributes: ["name"] },
            ],
            order: [["createdAt", "DESC"]],
        }),
        Project.findAll(),
    ]);

    const issuesSummary = issues.map(i => ({
        id: i.id,
        title: i.title,
        description: i.description,
        status: i.status,
        priority: i.priority,
        project: i.Project?.name || "None",
        assignee: i.assignee?.name || "Unassigned",
        creator: i.creator?.name || "Unknown",
        createdAt: i.createdAt,
    }));

    const projectsSummary = projects.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
    }));

    const systemPrompt = `You are an AI assistant for an Issue Tracker application. You help users understand their issues, projects, and team workload.

Here is the current data:

ISSUES (${issues.length} total):
${JSON.stringify(issuesSummary, null, 2)}

PROJECTS (${projects.length} total):
${JSON.stringify(projectsSummary, null, 2)}

${context ? `ADDITIONAL CONTEXT:\n${context}\n` : ""}

Instructions:
- Answer questions about issues, projects, team members, statuses, priorities, etc.
- Be concise and helpful.
- Use data from the above to give accurate answers.
- If asked about trends or statistics, calculate from the data.
- Format responses in plain text, keep them brief.`;

    const result = await ai.generateContent({
        contents: [
            { role: "user", parts: [{ text: systemPrompt + "\n\nUser question: " + message }] },
        ],
    });

    return result.response.text();
};

// ---- Summarize a single issue ----
export const summarizeIssue = async (issueId) => {
    const ai = getModel();

    const issue = await Issue.findByPk(issueId, {
        include: [
            { model: Project, attributes: ["name"] },
            { model: User, as: "creator", attributes: ["name"] },
            { model: User, as: "assignee", attributes: ["name"] },
            {
                model: IssueComment,
                include: [{ model: User, as: "commenter", attributes: ["name"] }],
            },
        ],
    });

    if (!issue) throw new Error("Issue not found");

    const issueData = {
        title: issue.title,
        description: issue.description,
        status: issue.status,
        priority: issue.priority,
        project: issue.Project?.name,
        assignee: issue.assignee?.name || "Unassigned",
        creator: issue.creator?.name,
        createdAt: issue.createdAt,
        commentsCount: issue.IssueComments?.length || 0,
        comments: (issue.IssueComments || []).map(c => ({
            by: c.commenter?.name || "Unknown",
            text: c.comment,
            date: c.createdAt,
        })),
    };

    const prompt = `Summarize this issue concisely in 2-3 sentences. Include the key problem, current status, who's responsible, and any important discussion points from the comments.

Issue Data:
${JSON.stringify(issueData, null, 2)}

Provide a clear, actionable summary.`;

    const result = await ai.generateContent(prompt);
    return result.response.text();
};

// ---- Summarize comments on an issue ----
export const summarizeComments = async (issueId) => {
    const ai = getModel();

    const issue = await Issue.findByPk(issueId, {
        attributes: ["title"],
        include: [
            {
                model: IssueComment,
                include: [{ model: User, as: "commenter", attributes: ["name"] }],
            },
        ],
    });

    if (!issue) throw new Error("Issue not found");

    const comments = (issue.IssueComments || []).map(c => ({
        by: c.commenter?.name || "Unknown",
        text: c.comment,
        date: c.createdAt,
    }));

    if (comments.length === 0) {
        return "No comments to summarize.";
    }

    const prompt = `Summarize the following discussion thread on the issue "${issue.title}". Highlight key points, decisions, and action items. Be concise (2-4 sentences).

Comments:
${JSON.stringify(comments, null, 2)}

Provide a clear summary of the discussion.`;

    const result = await ai.generateContent(prompt);
    return result.response.text();
};
