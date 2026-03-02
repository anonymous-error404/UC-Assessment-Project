import express from "express";
import * as controller from "../controllers/ai.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

// Chatbot
router.post("/chat", controller.chat);

// Issue summary
router.get("/summarize-issue/:id", controller.summarizeIssue);

// Comment summary
router.get("/summarize-comments/:id", controller.summarizeComments);

export default router;
