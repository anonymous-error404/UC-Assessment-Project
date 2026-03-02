import { Issue, Project, User, IssueComment } from "../models/index.js";

//// CREATE ISSUE ////
export const createIssue = async (data, creatorId) => {

    const issue = await Issue.create({
        ...data,
        createdBy: creatorId,
    });

    return issue;
};

//// GET ALL ISSUES (FILTERS) ////
export const getIssues = async (filters = {}) => {

    const where = {};

    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.priority) where.priority = filters.priority;
    if (filters.status) where.status = filters.status;
    if (filters.assignedTo) where.assignedTo = filters.assignedTo;

    return await Issue.findAll({
        where,
        include: [
            { model: Project },
            { model: User, as: "creator", attributes: ["id", "name"] },
            { model: User, as: "assignee", attributes: ["id", "name"] },
        ],
        order: [["createdAt", "DESC"]],
    });
};

//// GET ISSUE BY ID ////
export const getIssueById = async (id) => {

    return await Issue.findByPk(id, {
        include: [
            { model: Project },
            { model: User, as: "creator", attributes: ["name"] },
            { model: User, as: "assignee", attributes: ["name"] },
            {
                model: IssueComment,
                include: [{ model: User, as: "commenter", attributes: ["name"] }]
            }
        ],
    });
};

//// UPDATE ISSUE STATUS / ASSIGNEE ////
export const updateIssue = async (id, data) => {

    const issue = await Issue.findByPk(id);
    if (!issue) throw new Error("Issue not found");

    await issue.update(data);
    return issue;
};

//// DELETE ISSUE ////
export const deleteIssue = async (id) => {

    const issue = await Issue.findByPk(id);
    if (!issue) throw new Error("Issue not found");

    await issue.destroy();
};

//// ADD COMMENT ////
export const addComment = async (issueId, userId, comment) => {

    return await IssueComment.create({
        issueId,
        employeeId: userId,
        comment,
    });
};

//// STATUS COUNTS FOR DASHBOARD ////
export const getStatusCounts = async () => {

    const result = await Issue.findAll({
        attributes: [
            "status",
            [Issue.sequelize.fn("COUNT", Issue.sequelize.col("status")), "count"],
        ],
        group: ["status"],
    });

    return result;
};