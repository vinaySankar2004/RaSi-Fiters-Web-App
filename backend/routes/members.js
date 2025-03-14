const express = require("express");
const Member = require("../models/Member");
const WorkoutLog = require("../models/WorkoutLog");
const { sequelize } = require("../config/database");
const { authenticateToken, isAdmin } = require("../middleware/auth");
const User = require("../models/User");
const router = express.Router();

// GET all members - exclude admin users
router.get("/", authenticateToken, async (req, res) => {
    try {
        // Join with users table to filter out admin users
        const members = await Member.findAll({
            include: [{
                model: User,
                attributes: ['role'],
                where: { role: 'member' } // Only include members with 'member' role
            }],
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
        const member = await Member.findByPk(req.params.id, {
            include: [{
                model: User,
                attributes: ['username'] // Include username but not password
            }]
        });
        if (!member) {
            return res.status(404).json({ error: "Member not found." });
        }
        res.json(member);
    } catch (err) {
        console.error("Error fetching member:", err);
        res.status(500).json({ error: "Failed to fetch member." });
    }
});

// POST new member with user account
router.post("/", authenticateToken, isAdmin, async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { member_name, gender, age, password } = req.body;
        
        if (!member_name || !gender || !age || !password) {
            return res.status(400).json({ error: "All fields are required." });
        }
        
        // Generate username from member name (lowercase, no spaces)
        const username = member_name.toLowerCase().replace(/\s+/g, '');
        
        // Check if username already exists
        const existingUser = await User.findOne({ 
            where: { username },
            transaction
        });
        
        if (existingUser) {
            await transaction.rollback();
            return res.status(400).json({ error: "A user with this username already exists." });
        }
        
        // Create user
        const user = await User.create({
            username,
            password, // Will be hashed by the User model's beforeCreate hook
            role: 'member'
        }, { transaction });
        
        // Create member linked to user
        const newMember = await Member.create({ 
            user_id: user.id,
            member_name, 
            gender, 
            age 
        }, { transaction });
        
        await transaction.commit();
        
        // Return the new member with user info (excluding password)
        const memberWithUser = {
            ...newMember.toJSON(),
            User: {
                username
            }
        };
        
        res.status(201).json(memberWithUser);
    } catch (err) {
        await transaction.rollback();
        console.error("Error adding member:", err);
        res.status(500).json({ error: "Failed to add member." });
    }
});

// UPDATE existing member
router.put("/:id", authenticateToken, isAdmin, async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { member_name, gender, age, password } = req.body;
        const member = await Member.findByPk(req.params.id, { transaction });

        if (!member) {
            await transaction.rollback();
            return res.status(404).json({ error: "Member not found." });
        }

        // Check if the new name already exists (but not for this member)
        if (member_name !== member.member_name) {
            const existingMember = await Member.findOne({ 
                where: { member_name },
                transaction
            });
            
            if (existingMember && existingMember.user_id !== member.user_id) {
                await transaction.rollback();
                return res.status(400).json({ error: "A member with this name already exists." });
            }
        }

        // Update member
        await member.update({ 
            member_name, 
            gender, 
            age 
        }, { transaction });
        
        // If password is provided, update the user's password
        if (password) {
            const user = await User.findByPk(member.user_id, { transaction });
            if (user) {
                user.password = password; // Will be hashed by the User model's beforeUpdate hook
                await user.save({ transaction });
            }
        }

        await transaction.commit();
        res.json({ message: "Member updated successfully." });
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

        // Get the user_id before deleting the member
        const userId = member.user_id;
        
        // Delete the member
        await member.destroy({ transaction });
        
        // Delete the associated user
        if (userId) {
            const user = await User.findByPk(userId, { transaction });
            if (user) {
                await user.destroy({ transaction });
            }
        }

        await transaction.commit();
        res.json({ message: "Member and associated user account deleted successfully." });
    } catch (err) {
        await transaction.rollback();
        console.error("Error deleting member:", err);
        res.status(500).json({ error: "Failed to delete member." });
    }
});

module.exports = router;
