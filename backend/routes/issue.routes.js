import express from "express";
import * as controller from "../controllers/issue.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

//// CREATE ISSUE
router.post("/", allowRoles("employee", "manager"), controller.createIssue);

//// GET ISSUES (Dashboard)
router.get("/", controller.getIssues);

//// GET ISSUE DETAILS
router.get("/:id", controller.getIssueById);

//// UPDATE ISSUE
router.put("/:id", allowRoles("manager"), controller.updateIssue);

//// DELETE ISSUE
router.delete("/:id", allowRoles("manager"), controller.deleteIssue);

//// ADD COMMENT
router.post("/:id/comment", controller.addComment);

//// STATUS COUNTS
router.get("/stats/status", controller.statusCounts);

export default router;