import express from "express";
import * as controller from "../controllers/project.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(authMiddleware);

//// CREATE PROJECT (Manager only)
router.post("/", allowRoles("manager"), controller.createProject);

//// GET PROJECTS (All users)
router.get("/", controller.getProjects);

//// GET PROJECT DETAILS
router.get("/:id", controller.getProjectById);

//// UPDATE PROJECT (Manager only)
router.put("/:id", allowRoles("manager"), controller.updateProject);

//// DELETE PROJECT (Manager only)
router.delete("/:id", allowRoles("manager"), controller.deleteProject);

export default router;