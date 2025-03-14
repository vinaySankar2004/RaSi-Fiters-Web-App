const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// Import models from index.js instead of directly
const { User, Member } = require("../models/index");

const router = express.Router();

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user with associated member
        const user = await User.findOne({ 
            where: { username },
            include: [Member]
        });

        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

        // Create token payload with role and member info if available
        const payload = { 
            userId: user.id, 
            username: user.username,
            role: user.role
        };

        // Add member_name to payload if user is a member with associated member record
        if (user.role === 'member' && user.Member) {
            payload.member_name = user.Member.member_name;
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Return token and user info
        res.json({ 
            token, 
            username: user.username, 
            role: user.role,
            member_name: user.Member?.member_name || null,
            message: "Login successful!" 
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error during login" });
    }
});

// Registration endpoint (optional - for creating new member accounts)
router.post("/register", async (req, res) => {
    const { username, password, member_name } = req.body;

    try {
        // Check if username already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        // Check if member exists
        const member = await Member.findOne({ where: { member_name } });
        if (!member) {
            return res.status(400).json({ error: "Member not found" });
        }

        // Check if member already has a user account
        if (member.user_id) {
            return res.status(400).json({ error: "Member already has an account" });
        }

        // Create new user
        const user = await User.create({
            username,
            password, // Will be hashed by the beforeCreate hook
            role: 'member'
        });

        // Link member to user
        await member.update({ user_id: user.id });

        res.status(201).json({ message: "Account created successfully" });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Server error during registration" });
    }
});

module.exports = router;
