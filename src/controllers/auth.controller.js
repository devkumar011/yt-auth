import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import sessionModel from "../models/session.model.js";

// ================= REGISTER =================
export async function register(req, res) {
    const { username, email, password } = req.body;

    try {
        const isAlreadyRegistered = await userModel.findOne({
            $or: [{ username }, { email }]
        });

        if (isAlreadyRegistered) {
            return res.status(409).json({
                message: "Username or email already exists"
            });
        }

        const hashedPassword = crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");

        const user = await userModel.create({
            username,
            email,
            password: hashedPassword
        });

        const accessToken = jwt.sign(
            { id: user._id },
            config.JWT_SECRET,
            { expiresIn: "15m" }
        );

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                username: user.username,
                email: user.email,
            },
            accessToken,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
}

// ================= GET ME =================
export async function getMe(req, res) {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Token not found"
            });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);

        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User fetched successfully",
            user: {
                username: user.username,
                email: user.email,
            }
        });

    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
}

// ================= REFRESH TOKEN =================
export async function refreshToken(req, res) {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);

        const newAccessToken = jwt.sign(
            { id: decoded.id },
            config.JWT_SECRET,
            { expiresIn: "15m" }
        );

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        });

        return res.status(200).json({
            message: "Token refreshed",
            accessToken: newAccessToken
        });

    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
}

// ================= GENERATE TOKEN FROM COOKIE =================
export async function generateAccessTokenFromCookie(req) {
    try {
        const token = req.cookies?.accessToken;

        if (!token) return null;

        const decoded = jwt.verify(token, config.JWT_SECRET);

        const accessToken = jwt.sign(
            { id: decoded.id },
            config.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { id: decoded.id },
            config.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const refreshTokenHash = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex");

        await sessionModel.create({
            userId: decoded.id,
            refreshTokenHash,
        });

        return accessToken;

    } catch (error) {
        return null;
    }
}