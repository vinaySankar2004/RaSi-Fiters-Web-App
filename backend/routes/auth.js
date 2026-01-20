const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Member, RefreshToken } = require("../models/index");

const router = express.Router();

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || "1h";

const createAccessToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });

const refreshExpiryDate = () => {
    const days = Number.parseInt(process.env.REFRESH_TOKEN_TTL_DAYS, 10);
    if (!Number.isFinite(days) || days <= 0) {
        return null;
    }
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

const hashRefreshToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const issueRefreshToken = async (memberId, clientType) => {
    const rawToken = crypto.randomBytes(64).toString("hex");
    const tokenHash = hashRefreshToken(rawToken);
    await RefreshToken.create({
        member_id: memberId,
        token_hash: tokenHash,
        client_type: clientType,
        expires_at: refreshExpiryDate()
    });
    return { rawToken, tokenHash };
};

const buildLegacyPayload = (member) => ({
    id: member.id,
    userId: member.id, // Keeping for backward compatibility
    username: member.username,
    member_name: member.member_name,
    role: member.role,
    date_joined: member.date_joined
});

const buildGlobalPayload = (member, globalRole) => ({
    id: member.id,
    username: member.username,
    member_name: member.member_name,
    global_role: globalRole,
    date_joined: member.date_joined
});

// Legacy login (kept intact for backward compatibility)
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for username: ${username}`);

    try {
        // Find member by username
        const member = await Member.findOne({
            where: { username }
        });

        if (!member) {
            console.log(`User not found: ${username}`);
            return res.status(401).json({ error: "Invalid credentials" });
        }

        console.log(`User found: ${member.username}, role: ${member.role}`);

        // Check password
        const isMatch = await member.checkPassword(password);
        if (!isMatch) {
            console.log(`Password mismatch for user: ${username}`);
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const payload = buildLegacyPayload(member);
        const token = createAccessToken(payload);
        const { rawToken: refreshToken } = await issueRefreshToken(member.id, "legacy");

        // Return token and user info
        res.json({
            token,
            refresh_token: refreshToken,
            username: member.username,
            role: member.role,
            member_name: member.member_name,
            date_joined: member.date_joined, // Include date_joined in the response
            message: "Login successful!"
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error during login" });
    }
});

// Shared handler for app (mobile-first) and global login; keeps logic in one place.
const handleAppLogin = async (req, res) => {
    const { username, password } = req.body;
    console.log(`[global login] attempt for username: ${username}`);

    try {
        const member = await Member.findOne({ where: { username } });

        if (!member) {
            console.log(`[global login] user not found: ${username}`);
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isMatch = await member.checkPassword(password);
        if (!isMatch) {
            console.log(`[global login] password mismatch for user: ${username}`);
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Default to 'standard' if not set, but the column is non-null with default in DB.
        const globalRole = member.global_role || "standard";

        const payload = buildGlobalPayload(member, globalRole);
        const token = createAccessToken(payload);
        const { rawToken: refreshToken } = await issueRefreshToken(member.id, "global");

        res.json({
            token,
            refresh_token: refreshToken,
            member_id: member.id,
            username: member.username,
            member_name: member.member_name,
            global_role: globalRole,
            message: "Login successful"
        });
    } catch (error) {
        console.error("[global login] error:", error);
        res.status(500).json({ error: "Server error during login" });
    }
};

// New mobile-first endpoint for app clients (iOS/Android) using global_role.
router.post("/login/app", handleAppLogin);

// Existing endpoint kept for backward compatibility.
router.post("/login/global", handleAppLogin);

// Refresh access token using a refresh token (rotates refresh token)
router.post("/refresh", async (req, res) => {
    const { refresh_token: refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ error: "Refresh token required" });
    }

    try {
        const tokenHash = hashRefreshToken(refreshToken);
        const storedToken = await RefreshToken.findOne({ where: { token_hash: tokenHash } });

        if (!storedToken || storedToken.revoked_at) {
            return res.status(401).json({ error: "Invalid refresh token" });
        }

        if (storedToken.expires_at && storedToken.expires_at < new Date()) {
            await storedToken.update({ revoked_at: new Date() });
            return res.status(401).json({ error: "Refresh token expired" });
        }

        const member = await Member.findByPk(storedToken.member_id);
        if (!member) {
            await storedToken.update({ revoked_at: new Date() });
            return res.status(401).json({ error: "Invalid refresh token" });
        }

        let payload;
        if (storedToken.client_type === "legacy") {
            payload = buildLegacyPayload(member);
        } else {
            const globalRole = member.global_role || "standard";
            payload = buildGlobalPayload(member, globalRole);
        }

        const token = createAccessToken(payload);
        const { rawToken: newRefreshToken, tokenHash: newTokenHash } = await issueRefreshToken(
            member.id,
            storedToken.client_type
        );

        await storedToken.update({ revoked_at: new Date(), replaced_by_hash: newTokenHash });

        return res.json({
            token,
            refresh_token: newRefreshToken,
            message: "Token refreshed"
        });
    } catch (error) {
        console.error("[refresh] error:", error);
        return res.status(500).json({ error: "Server error during refresh" });
    }
});

// Logout: revoke refresh token
router.post("/logout", async (req, res) => {
    const { refresh_token: refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ error: "Refresh token required" });
    }

    try {
        const tokenHash = hashRefreshToken(refreshToken);
        const storedToken = await RefreshToken.findOne({ where: { token_hash: tokenHash } });
        if (storedToken && !storedToken.revoked_at) {
            await storedToken.update({ revoked_at: new Date() });
        }
        return res.json({ message: "Logged out" });
    } catch (error) {
        console.error("[logout] error:", error);
        return res.status(500).json({ error: "Server error during logout" });
    }
});

// Registration endpoint
router.post("/register", async (req, res) => {
    const { username, password, member_name, gender, date_of_birth } = req.body;

    try {
        // Check if username already exists
        const existingMember = await Member.findOne({
            where: { username }
        });

        if (existingMember) {
            return res.status(400).json({ error: "Username already exists" });
        }

        // Check if member_name already exists
        const memberNameExists = await Member.findOne({
            where: { member_name }
        });

        if (memberNameExists) {
            return res.status(400).json({ error: "Member name already exists" });
        }

        // Create new member with user credentials
        const newMember = await Member.create({
            username,
            password, // Will be hashed by the model's beforeSave hook
            member_name,
            gender: gender || null,
            date_of_birth: date_of_birth || null,
            date_joined: '2025-03-01', // Set the default join date
            role: 'member'
        });

        res.status(201).json({
            message: "Account created successfully",
            member_id: newMember.id,
            date_joined: newMember.date_joined
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Server error during registration" });
    }
});

module.exports = router;
