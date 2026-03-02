import { IssueComment, Issue, User } from "../models/index.js";

//// CREATE COMMENT ////
export const createComment = async ({ issueId, userId, comment }) => {

    const issue = await Issue.findByPk(issueId);
    if (!issue) throw new Error("Issue not found");

    const newComment = await IssueComment.create({
        issueId,
        employeeId: userId,
        comment,
    });

    return newComment;
};

//// GET COMMENTS FOR ISSUE ////
export const getCommentsByIssue = async (issueId) => {

    return await IssueComment.findAll({
        where: { issueId },
        include: [
            {
                model: User,
                as: "commenter",
                attributes: ["id", "name", "email"]
            }
        ],
        order: [["createdAt", "ASC"]],
    });
};

//// DELETE COMMENT (optional manager only) ////
export const deleteComment = async (commentId) => {

    const comment = await IssueComment.findByPk(commentId);
    if (!comment) throw new Error("Comment not found");

    await comment.destroy();
};