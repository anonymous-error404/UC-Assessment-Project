import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

export const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token)
        return res.status(401).json({ message: "No token" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;   // { userId, role }
        next();
    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
};