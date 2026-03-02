import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import { sequelize } from "./models/index.js";

dotenv.config();

const app = express();

//// MIDDLEWARE ////
app.use(cors());
app.use(express.json());

//// ROUTES ////
app.use("/api/auth", authRoutes);

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
        app.listen(PORT, () =>
            console.log(`🚀 Server running on http://localhost:${PORT}`)
        );

    } catch (error) {
        console.error("❌ Unable to connect to database:", error);
        process.exit(1);
    }
};

startServer();