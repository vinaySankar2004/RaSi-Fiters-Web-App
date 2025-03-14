const express = require("express");
const Member = require("../models/Member");
const WorkoutLog = require("../models/WorkoutLog");
const { sequelize } = require("../config/database");
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
    const transaction = await sequelize.transaction();
    
    try {
        const { gender, age, member_name: newMemberName } = req.body;
        const oldMemberName = req.params.member_name;
        
        const member = await Member.findOne({ 
            where: { member_name: oldMemberName },
            transaction
        });

        if (!member) {
            await transaction.rollback();
            return res.status(404).json({ error: "Member not found." });
        }

        // If the name is being changed
        if (newMemberName && newMemberName !== oldMemberName) {
            // Check if the new name already exists
            const existingMember = await Member.findOne({ 
                where: { member_name: newMemberName },
                transaction
            });
            
            if (existingMember) {
                await transaction.rollback();
                return res.status(400).json({ error: "A member with this name already exists." });
            }
            
            // Update all workout logs with the new member name
            await WorkoutLog.update(
                { member_name: newMemberName },
                { 
                    where: { member_name: oldMemberName },
                    transaction
                }
            );
            
            // Update the member's name
            await member.update({ 
                member_name: newMemberName,
                gender, 
                age 
            }, { transaction });
        } else {
            // Just update gender and age
            await member.update({ gender, age }, { transaction });
        }

        await transaction.commit();
        res.json({ message: "Member updated successfully." });
    } catch (err) {
        await transaction.rollback();
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
