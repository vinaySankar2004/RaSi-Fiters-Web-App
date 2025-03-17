const express = require("express");
const { Member, WorkoutLog } = require("../models/index");
const { sequelize } = require("../config/database");
const { authenticateToken, isAdmin } = require("../middleware/auth");
const router = express.Router();

// GET all members - exclude admin users
router.get("/", authenticateToken, async (req, res) => {
    try {
        // Get all members with role 'member' (exclude admins)
        const members = await Member.findAll({
            where: { role: 'member' },
            order: [["member_name", "ASC"]],
        });
        res.json(members);
    } catch (err) {
        console.error("Error fetching members:", err);
        res.status(500).json({ error: "Failed to fetch members." });
    }
});

// GET member by ID
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const member = await Member.findByPk(req.params.id);
        if (!member) {
            return res.status(404).json({ error: "Member not found." });
        }

        // Format the response - exclude password
        const memberData = {
            id: member.id,
            member_name: member.member_name,
            username: member.username,
            gender: member.gender,
            date_of_birth: member.date_of_birth,
            role: member.role,
            created_at: member.created_at,
            updated_at: member.updated_at
        };

        res.json(memberData);
    } catch (err) {
        console.error("Error fetching member:", err);
        res.status(500).json({ error: "Failed to fetch member." });
    }
});

// POST new member
router.post("/", authenticateToken, isAdmin, async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { member_name, gender, date_of_birth, age, password } = req.body;

        if (!member_name || !gender || (!date_of_birth && !age) || !password) {
            await transaction.rollback();
            return res.status(400).json({ error: "Required fields are missing." });
        }

        // Generate username from member name (lowercase, no spaces)
        const username = member_name.toLowerCase().replace(/\s+/g, '');

        // Check if username already exists
        const existingMember = await Member.findOne({
            where: { username },
            transaction
        });

        if (existingMember) {
            await transaction.rollback();
            return res.status(400).json({ error: "A user with this username already exists." });
        }

        // Create new member
        const newMember = await Member.create({
            member_name,
            username,
            password,
            gender,
            date_of_birth,
            role: 'member'
        }, { transaction });

        await transaction.commit();

        // Return the new member (excluding password)
        const memberData = {
            id: newMember.id,
            member_name: newMember.member_name,
            username: newMember.username,
            gender: newMember.gender,
            date_of_birth: newMember.date_of_birth,
            role: newMember.role
        };

        res.status(201).json(memberData);
    } catch (err) {
        await transaction.rollback();
        console.error("Error adding member:", err);
        res.status(500).json({ error: "Failed to add member." });
    }
});

// UPDATE existing member
router.put("/:id", authenticateToken, async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { date_of_birth, gender, password } = req.body;
        const member = await Member.findByPk(req.params.id, { transaction });

        if (!member) {
            await transaction.rollback();
            return res.status(404).json({ error: "Member not found." });
        }

        // Check if user has permission to update this member
        const isOwnProfile = req.user.id === member.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwnProfile && !isAdmin) {
            await transaction.rollback();
            return res.status(403).json({ error: "You can only update your own profile." });
        }

        // Create update object with fields that should be updated
        const updateData = {};
        if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth;
        if (gender !== undefined) updateData.gender = gender;
        if (password !== undefined) updateData.password = password;

        // Update member
        await member.update(updateData, { transaction });

        await transaction.commit();
        res.json({ message: "Profile updated successfully." });
    } catch (err) {
        await transaction.rollback();
        console.error("Error updating member:", err);
        res.status(500).json({ error: "Failed to update member." });
    }
});

// DELETE member
router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const member = await Member.findByPk(req.params.id, { transaction });

        if (!member) {
            await transaction.rollback();
            return res.status(404).json({ error: "Member not found." });
        }

        // Check if trying to delete admin
        if (member.role === 'admin') {
            await transaction.rollback();
            return res.status(403).json({ error: "Cannot delete admin account." });
        }

        // Delete the member
        await member.destroy({ transaction });

        await transaction.commit();
        res.json({ message: "Member deleted successfully." });
    } catch (err) {
        await transaction.rollback();
        console.error("Error deleting member:", err);
        res.status(500).json({ error: "Failed to delete member." });
    }
});

module.exports = router;
