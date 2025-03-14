const express = require("express");
const Member = require("../models/Member");
const { authenticateToken, isAdmin } = require("../middleware/auth");
const router = express.Router();

// GET all members - accessible to all authenticated users
router.get("/", authenticateToken, async (req, res) => {
    try {
        console.log("Fetching all members...");
        const members = await Member.findAll({
            order: [["member_name", "ASC"]], // Sort by member_name (A-Z)
        });
        console.log("Members retrieved:", members);
        res.json(members);
    } catch (err) {
        console.error("ERROR FETCHING MEMBERS:", err);
        res.status(500).json({ error: "Failed to fetch members.", details: err.message });
    }
});

// POST new member - admin only
router.post("/", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { member_name, gender, age } = req.body;
        if (!member_name || !gender || !age) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const newMember = await Member.create({ member_name, gender, age });
        res.status(201).json(newMember);
    } catch (err) {
        console.error("Error adding member:", err);
        res.status(500).json({ error: "Failed to add member." });
    }
});

// UPDATE existing member - admin only
router.put("/:member_name", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { gender, age } = req.body;
        const member = await Member.findOne({ where: { member_name: req.params.member_name } });

        if (!member) {
            return res.status(404).json({ error: "Member not found." });
        }

        await member.update({ gender, age });
        res.json({ message: "Member updated successfully." });
    } catch (err) {
        console.error("Error updating member:", err);
        res.status(500).json({ error: "Failed to update member." });
    }
});

// DELETE member - admin only
router.delete("/:member_name", authenticateToken, isAdmin, async (req, res) => {
    try {
        const member = await Member.findOne({ where: { member_name: req.params.member_name } });

        if (!member) {
            return res.status(404).json({ error: "Member not found." });
        }

        await member.destroy();
        res.json({ message: "Member deleted successfully." });
    } catch (err) {
        console.error("Error deleting member:", err);
        res.status(500).json({ error: "Failed to delete member." });
    }
});

module.exports = router;
