const express = require("express");
const { Workout } = require("../models/index");
const { authenticateToken, isAdmin } = require("../middleware/auth");
const router = express.Router();

// GET all workouts - accessible to all authenticated users
router.get("/", authenticateToken, async (req, res) => {
    try {
        const workouts = await Workout.findAll({
            order: [["workout_name", "ASC"]], // Sort by workout_name (A-Z)
        });
        res.json(workouts);
    } catch (err) {
        console.error("Error fetching workouts:", err);
        res.status(500).json({ error: "Failed to fetch workouts." });
    }
});

// POST new workout - admin only
router.post("/", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { workout_name } = req.body;
        if (!workout_name) {
            return res.status(400).json({ error: "Workout name is required." });
        }

        const newWorkout = await Workout.create({ workout_name });
        res.status(201).json(newWorkout);
    } catch (err) {
        console.error("Error adding workout:", err);
        res.status(500).json({ error: "Failed to add workout." });
    }
});

// UPDATE existing workout - admin only
router.put("/:workout_name", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { workout_name } = req.body;
        const workout = await Workout.findOne({ where: { workout_name: req.params.workout_name } });

        if (!workout) {
            return res.status(404).json({ error: "Workout not found." });
        }

        await workout.update({ workout_name });
        res.json({ message: "Workout updated successfully." });
    } catch (err) {
        console.error("Error updating workout:", err);
        res.status(500).json({ error: "Failed to update workout." });
    }
});

// DELETE workout - admin only
router.delete("/:workout_name", authenticateToken, isAdmin, async (req, res) => {
    try {
        const workout = await Workout.findOne({ where: { workout_name: req.params.workout_name } });

        if (!workout) {
            return res.status(404).json({ error: "Workout not found." });
        }

        await workout.destroy();
        res.json({ message: "Workout deleted successfully." });
    } catch (err) {
        console.error("Error deleting workout:", err);
        res.status(500).json({ error: "Failed to delete workout." });
    }
});

module.exports = router;
