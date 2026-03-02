import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import issueRoutes from "./routes/issue.routes.js";
import projectRoutes from "./routes/project.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import userRoutes from "./routes/user.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import { sequelize } from "./models/index.js";
import { initSocket } from "./socket.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

//// SOCKET.IO ////
initSocket(httpServer);

//// MIDDLEWARE ////
app.use(cors());
app.use(express.json());

//// ROUTES ////
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);

//// TEST ROUTE ////
app.get("/", (req, res) => {
    res.send("Issue Tracker API Running 🚀");
});

//// CONNECT DATABASE & START SERVER ////
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected successfully");

        // Sync models
        await sequelize.sync({ alter: true });
        console.log("✅ Models synced");

        const PORT = process.env.PORT || 5000;
        httpServer.listen(PORT, () =>
            console.log(`🚀 Server running on http://localhost:${PORT}`)
        );

    } catch (error) {
        console.error("❌ Unable to connect to database:", error);
        process.exit(1);
    }
};

startServer();