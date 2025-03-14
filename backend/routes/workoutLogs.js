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
        const { member_name, workout_name, date, duration } = req.body;
        
        console.log("Received log data:", { member_name, workout_name, date, duration });
        
        if (!member_name || !workout_name || !date || !duration) {
            console.log("Missing required fields:", { member_name, workout_name, date, duration });
            return res.status(400).json({ 
                error: "All fields are required."
            });
        }

        // Validate duration is a number
        if (isNaN(duration)) {
            return res.status(400).json({ error: "Duration must be a number." });
        }

        // Get user_id from the token
        const user_id = req.user.userId;
        
        // Create the workout log
        const newLog = await WorkoutLog.create({
            user_id,
            member_name,
            workout_name,
            date,
            duration: parseInt(duration, 10)
        });

        res.status(201).json(newLog);
    } catch (err) {
        console.error("Error adding workout log:", err);
        res.status(500).json({ error: "Failed to add workout log.", details: err.message });
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

// Get all workout logs for a specific member
router.get("/member/:memberName", authenticateToken, async (req, res) => {
    try {
        const { memberName } = req.params;
        
        // Check if user has permission to view these logs
        if (req.user.role !== 'admin' && req.user.member_name !== memberName) {
            return res.status(403).json({ error: "You can only view your own logs." });
        }
        
        const logs = await WorkoutLog.findAll({
            where: {
                member_name: memberName
            },
            order: [["date", "DESC"]] // Sort by date in descending order
        });
        
        res.json(logs);
    } catch (err) {
        console.error("Error fetching member workout logs:", err);
        res.status(500).json({ error: "Failed to fetch workout logs." });
    }
});

module.exports = router;
