const express = require("express");
const WorkoutLog = require("../models/WorkoutLog");
const { Op } = require("sequelize");
const { authenticateToken, isAdmin, canModifyLog } = require("../middleware/auth");
const Member = require("../models/Member");
const User = require("../models/User");
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

        // Get logs directly without trying to include Member model
        const logs = await WorkoutLog.findAll({
            where: whereCondition
        });

        console.log("Found logs:", logs.length);

        // Format the response for the frontend
        const formattedLogs = logs.map(log => ({
            user_id: log.user_id,
            member_name: log.member_name, // Use the member_name directly from the log
            workout_name: log.workout_name,
            date: log.date,
            duration: log.duration,
            canEdit: req.user.role === 'admin' || log.user_id === req.user.userId
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
        const { member_id, workout_name, date, duration } = req.body;
        
        if (!member_id || !workout_name || !date || !duration) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // Check if user has permission to add this log
        if (req.user.role !== 'admin') {
            // Get the member associated with this user
            const member = await Member.findOne({ where: { user_id: req.user.userId } });
            if (!member || member.id !== member_id) {
                return res.status(403).json({ error: "You can only add logs for yourself." });
            }
        }

        const existingLog = await WorkoutLog.findOne({
            where: {
                member_id,
                workout_name,
                date
            }
        });

        if (existingLog) {
            return res.status(400).json({ error: "Workout log already exists for this member, workout, and date." });
        }

        const newLog = await WorkoutLog.create({
            member_id,
            workout_name,
            date,
            duration
        });

        res.status(201).json(newLog);
    } catch (err) {
        console.error("Error adding workout log:", err);
        res.status(500).json({ error: "Failed to add workout log." });
    }
});

// Update a workout log - check if user can modify this log
router.put("/", authenticateToken, async (req, res) => {
    try {
        const { member_name, workout_name, date, duration } = req.body;
        
        if (!member_name || !workout_name || !date || !duration) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // Check if user has permission to update this log
        if (req.user.role !== 'admin' && req.user.member_name !== member_name) {
            return res.status(403).json({ error: "You can only update your own logs." });
        }
        
        const log = await WorkoutLog.findOne({
            where: {
                member_name,
                workout_name,
                date
            }
        });

        if (!log) {
            return res.status(404).json({ error: "Workout log not found." });
        }

        log.duration = duration;
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
        const { member_name, workout_name, date } = req.body;
        
        if (!member_name || !workout_name || !date) {
            return res.status(400).json({ error: "Member name, workout name, and date are required." });
        }

        // Check if user has permission to delete this log
        if (req.user.role !== 'admin' && req.user.member_name !== member_name) {
            return res.status(403).json({ error: "You can only delete your own logs." });
        }
        
        const log = await WorkoutLog.findOne({
            where: {
                member_name,
                workout_name,
                date
            }
        });

        if (!log) {
            return res.status(404).json({ error: "Workout log not found." });
        }

        await log.destroy();

        res.json({ message: "Workout log deleted successfully." });
    } catch (err) {
        console.error("Error deleting workout log:", err);
        res.status(500).json({ error: "Failed to delete workout log." });
    }
});

module.exports = router;
