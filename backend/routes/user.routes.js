import express from "express";
import { User } from "../models/index.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

//// GET ALL USERS (for dropdowns)
router.get("/", async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ["id", "name", "email", "role"],
            order: [["name", "ASC"]],
        });
        res.json(users);
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: "Error getting users" });
    }
});

export default router;
