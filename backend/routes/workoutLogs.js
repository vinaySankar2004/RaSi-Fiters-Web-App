const express = require("express");
const WorkoutLog = require("../models/WorkoutLog");
const { Op } = require("sequelize");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        let { date } = req.query;
        if (!date) {
            return res.status(400).json({ error: "Date is required." });
        }

        console.log("Fetching logs for date:", date);
        const logs = await WorkoutLog.findAll({
            where: {
                date: {
                    [Op.eq]: date,  // Ensure strict match on YYYY-MM-DD
                },
            },
        });

        res.json(logs);
    } catch (err) {
        console.error("Error fetching workout logs:", err);
        res.status(500).json({ error: "Failed to fetch workout logs." });
    }
});

// Add a new workout log
router.post("/", async (req, res) => {
    try {
        const { member_name, workout_name, date, duration } = req.body;
        
        if (!member_name || !workout_name || !date || !duration) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const existingLog = await WorkoutLog.findOne({
            where: {
                member_name,
                workout_name,
                date
            }
        });

        if (existingLog) {
            return res.status(400).json({ error: "Workout log already exists for this member, workout, and date." });
        }

        const newLog = await WorkoutLog.create({
            member_name,
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

// Update a workout log
router.put("/", async (req, res) => {
    try {
        const { member_name, workout_name, date, duration } = req.body;
        
        if (!member_name || !workout_name || !date || !duration) {
            return res.status(400).json({ error: "All fields are required." });
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

// Delete a workout log
router.delete("/", async (req, res) => {
    try {
        const { member_name, workout_name, date } = req.body;
        
        if (!member_name || !workout_name || !date) {
            return res.status(400).json({ error: "Member name, workout name, and date are required." });
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
