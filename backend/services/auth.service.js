import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

//// REGISTER USER ////
export const registerUser = async ({ name, email, password, role }) => {

    const existing = await User.findOne({ where: { email } });
    if (existing)
        throw new Error("Email already exists");

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        passwordHash,
        role,
    });

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
};

//// LOGIN USER ////
export const loginUser = async ({ email, password }) => {

    const user = await User.findOne({ where: { email } });
    if (!user)
        throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
        throw new Error("Invalid credentials");

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: "1d" }
    );

    return {
        token,
        name: user.name,
        role: user.role,
    };
};