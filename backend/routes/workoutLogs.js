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

        date = new Date(date).toISOString().split("T")[0];

        console.log("Fetching logs for date (UTC):", date);
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

module.exports = router;
