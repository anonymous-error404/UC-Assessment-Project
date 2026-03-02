import * as aiService from "../services/ai.service.js";

export const chat = async (req, res) => {
    try {
        const { message, context } = req.body;
        if (!message) return res.status(400).json({ message: "Message is required" });

        const reply = await aiService.chat(message, context);
        res.json({ reply });
    } catch (err) {
        console.log("AI Chat Error:", err.message);
        res.status(500).json({ message: "AI service error: " + err.message });
    }
};

export const summarizeIssue = async (req, res) => {
    try {
        const summary = await aiService.summarizeIssue(req.params.id);
        res.json({ summary });
    } catch (err) {
        console.log("AI Summarize Issue Error:", err.message);
        res.status(500).json({ message: err.message });
    }
};

export const summarizeComments = async (req, res) => {
    try {
        const summary = await aiService.summarizeComments(req.params.id);
        res.json({ summary });
    } catch (err) {
        console.log("AI Summarize Comments Error:", err.message);
        res.status(500).json({ message: err.message });
    }
};
