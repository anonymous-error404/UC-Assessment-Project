import express from "express";
import * as controller from "../controllers/comment.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

//// ADD COMMENT
router.post(
  "/:issueId",
  allowRoles("employee", "manager"),
  controller.addComment
);

//// GET COMMENTS FOR ISSUE
router.get("/:issueId", controller.getComments);

//// DELETE COMMENT (manager only)
router.delete(
  "/delete/:commentId",
  allowRoles("manager"),
  controller.deleteComment
);

export default router;