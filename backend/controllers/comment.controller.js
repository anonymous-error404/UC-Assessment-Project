import * as commentService from "../services/comment.service.js";
import { getIO } from "../socket.js";

//// ADD COMMENT ////
export const addComment = async (req, res) => {
    try {
        const comment = await commentService.createComment({
            issueId: req.params.issueId,
            userId: req.user.userId,
            comment: req.body.comment,
        });

        res.status(201).json(comment);
        getIO().emit("comments:changed", { issueId: req.params.issueId });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

//// GET COMMENTS ////
export const getComments = async (req, res) => {
    try {
        const comments = await commentService.getCommentsByIssue(req.params.issueId);
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//// DELETE COMMENT ////
export const deleteComment = async (req, res) => {
    try {
        await commentService.deleteComment(req.params.commentId);
        res.json({ message: "Comment deleted" });
        getIO().emit("comments:changed", { commentId: req.params.commentId });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};