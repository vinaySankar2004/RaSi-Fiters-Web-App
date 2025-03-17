const express = require("express");
const { WorkoutLog, Member } = require("../models/index");
const { Op } = require("sequelize");
const { authenticateToken, isAdmin, canModifyLog } = require("../middleware/auth");
const router = express.Router();

// Get workout logs
router.get("/", authenticateToken, async (req, res) => {
    try {
        let { date } = req.query;
        if (!date) {
            return res.status(400).json({ error: "Date is required." });
        }

        console.log("Fetching logs for date:", date);

        // Build query conditions
        const whereCondition = {
            date: date
        };

        // Get logs with member information using the association
        const logs = await WorkoutLog.findAll({
            where: whereCondition,
            include: [{
                model: Member,
                attributes: ['member_name'] // Only include member_name
            }]
        });

        console.log("Found logs:", logs.length);

        // Format the response for the frontend
        const formattedLogs = logs.map(log => ({
            member_id: log.member_id,
            member_name: log.Member ? log.Member.member_name : null, // Get member_name from the included Member model
            workout_name: log.workout_name,
            date: log.date,
            duration: log.duration,
            canEdit: req.user.role === 'admin' || log.member_id === req.user.id
        }));

        res.json(formattedLogs);
    } catch (err) {
        console.error("Error fetching workout logs:", err);
        res.status(500).json({ error: "Failed to fetch workout logs." });
    }
});

// Add a new workout log
router.post("/", authenticateToken, async (req, res) => {
    try {
        const { member_name, workout_name, date, duration } = req.body;

        console.log("Received log data:", { member_name, workout_name, date, duration });

        if (!workout_name || !date || !duration) {
            console.log("Missing required fields:", { workout_name, date, duration });
            return res.status(400).json({
                error: "All fields are required."
            });
        }

        // Validate duration is a number
        if (isNaN(duration)) {
            return res.status(400).json({ error: "Duration must be a number." });
        }

        // Get member_id - either from the authenticated user or by looking up the member_name
        let member_id = req.user.id; // Default to the authenticated user

        // If adding a log for a different member (admin functionality)
        if (member_name && member_name !== req.user.member_name && req.user.role === 'admin') {
            const member = await Member.findOne({
                where: { member_name }
            });

            if (!member) {
                return res.status(404).json({ error: "Member not found." });
            }

            member_id = member.id;
        }

        // Create the workout log
        const newLog = await WorkoutLog.create({
            member_id,
            workout_name,
            date,
            duration: parseInt(duration, 10)
        });

        // Get the member info to include in response
        const member = await Member.findByPk(member_id);

        res.status(201).json({
            ...newLog.toJSON(),
            member_name: member ? member.member_name : null
        });
    } catch (err) {
        console.error("Error adding workout log:", err);
        res.status(500).json({ error: "Failed to add workout log.", details: err.message });
    }
});

// Update a workout log - check if user can modify this log
router.put("/", authenticateToken, async (req, res) => {
    try {
        const { member_name, workout_name, date, duration } = req.body;

        if (!workout_name || !date || !duration) {
            return res.status(400).json({ error: "Workout name, date, and duration are required." });
        }

        // Get member_id from member_name if provided
        let member_id = req.user.id;

        if (member_name && member_name !== req.user.member_name) {
            // Only admins can update other members' logs
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: "You can only update your own logs." });
            }

            const member = await Member.findOne({
                where: { member_name }
            });

            if (!member) {
                return res.status(404).json({ error: "Member not found." });
            }

            member_id = member.id;
        }

        // Find the log
        const log = await WorkoutLog.findOne({
            where: {
                member_id,
                workout_name,
                date
            }
        });

        if (!log) {
            return res.status(404).json({ error: "Workout log not found." });
        }

        // Update duration
        log.duration = parseInt(duration, 10);
        await log.save();

        res.json(log);
    } catch (err) {
        console.error("Error updating workout log:", err);
        res.status(500).json({ error: "Failed to update workout log." });
    }
});

// Delete a workout log - check if user can modify this log
router.delete("/", authenticateToken, async (req, res) => {
    try {
        const { member_id, member_name, workout_name, date } = req.body;

        console.log("Delete request received:", { member_id, member_name, workout_name, date });

        if (!workout_name || !date) {
            return res.status(400).json({ error: "Workout name and date are required." });
        }

        // Build the where condition
        const whereCondition = {
            workout_name,
            date
        };

        // If member_id is provided directly, use it
        if (member_id) {
            whereCondition.member_id = member_id;
        }
        // Otherwise try to find the member by name
        else if (member_name) {
            // Only admins can delete other members' logs by name
            if (req.user.role !== 'admin' && req.user.member_name !== member_name) {
                return res.status(403).json({ error: "You can only delete your own logs." });
            }

            const member = await Member.findOne({
                where: { member_name }
            });

            if (!member) {
                return res.status(404).json({ error: "Member not found." });
            }

            whereCondition.member_id = member.id;
        }
        // If neither is provided, use the current user's ID
        else {
            whereCondition.member_id = req.user.id;
        }

        console.log("Final where condition:", whereCondition);

        // Find the log
        const log = await WorkoutLog.findOne({
            where: whereCondition
        });

        if (!log) {
            return res.status(404).json({ error: "Workout log not found." });
        }

        // Check if user has permission to delete this log
        if (req.user.role !== 'admin' && log.member_id !== req.user.id) {
            return res.status(403).json({ error: "You can only delete your own logs." });
        }

        // Delete the log
        await log.destroy();

        res.json({ message: "Workout log deleted successfully." });
    } catch (err) {
        console.error("Error deleting workout log:", err);
        res.status(500).json({ error: "Failed to delete workout log." });
    }
});

// Get all workout logs for a specific member
router.get("/member/:memberName", authenticateToken, async (req, res) => {
    try {
        const { memberName } = req.params;

        // Get member ID from member name
        const member = await Member.findOne({
            where: { member_name: memberName }
        });

        if (!member) {
            return res.status(404).json({ error: "Member not found." });
        }

        // Check if user has permission to view these logs
        if (req.user.role !== 'admin' && req.user.id !== member.id) {
            return res.status(403).json({ error: "You can only view your own logs." });
        }

        // Get all logs for this member
        const logs = await WorkoutLog.findAll({
            where: {
                member_id: member.id
            },
            order: [["date", "DESC"]] // Sort by date in descending order
        });

        // Format logs to include member_name for consistency with frontend
        const formattedLogs = logs.map(log => ({
            ...log.toJSON(),
            member_name: memberName
        }));

        res.json(formattedLogs);
    } catch (err) {
        console.error("Error fetching member workout logs:", err);
        res.status(500).json({ error: "Failed to fetch workout logs." });
    }
});

module.exports = router;
