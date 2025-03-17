const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Member } = require("../models/index");

const router = express.Router();

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

        // Create token payload with all necessary information
        const payload = {
            id: member.id,
            userId: member.id, // Keeping for backward compatibility
            username: member.username,
            member_name: member.member_name,
            role: member.role
        };

        // Generate token
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Return token and user info
        res.json({
            token,
            username: member.username,
            role: member.role,
            member_name: member.member_name,
            message: "Login successful!"
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error during login" });
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
            role: 'member'
        });

        res.status(201).json({
            message: "Account created successfully",
            member_id: newMember.id
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Server error during registration" });
    }
});

module.exports = router;
