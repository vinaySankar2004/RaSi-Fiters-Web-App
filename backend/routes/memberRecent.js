const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { WorkoutLog } = require("../models");
const { Op } = require("sequelize");

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
    try {
        const { 
            programId, 
            memberId, 
            limit = 1000,
            startDate,
            endDate,
            sortBy = "date",
            sortDir = "desc"
        } = req.query;
        
        if (!programId || !memberId) {
            return res.status(400).json({ error: "programId and memberId are required." });
        }

        // Build where clause with date filtering
        const whereClause = {
            program_id: programId,
            member_id: memberId
        };

        // Add date range filter if provided
        if (startDate || endDate) {
            whereClause.date = {};
            if (startDate) {
                whereClause.date[Op.gte] = startDate;
            }
            if (endDate) {
                whereClause.date[Op.lte] = endDate;
            }
        }

        // Determine sort column
        let orderColumn;
        switch (sortBy) {
            case "duration":
                orderColumn = "duration";
                break;
            case "workoutType":
                orderColumn = "workout_name";
                break;
            case "date":
            default:
                orderColumn = "date";
                break;
        }

        // Determine sort direction
        const orderDirection = sortDir.toLowerCase() === "asc" ? "ASC" : "DESC";

        // Build query options
        const queryOptions = {
            where: whereClause,
            order: [[orderColumn, orderDirection]],
            attributes: ["workout_name", "date", "duration", "member_id"]
        };

        // Only apply limit if it's greater than 0
        const limitNum = Number(limit);
        if (limitNum > 0) {
            queryOptions.limit = limitNum;
        }

        const workouts = await WorkoutLog.findAll(queryOptions);

        const items = workouts.map((w, idx) => ({
            id: `${w.member_id}-${w.workout_name}-${w.date}-${idx}`,
            workoutType: w.workout_name,
            workoutDate: w.date,
            durationMinutes: Number(w.duration || 0)
        }));

        res.json({ 
            items,
            total: items.length,
            filters: {
                startDate: startDate || null,
                endDate: endDate || null,
                sortBy,
                sortDir: orderDirection.toLowerCase()
            }
        });
    } catch (err) {
        console.error("Error fetching recent workouts:", err);
        res.status(500).json({ error: "Failed to fetch recent workouts." });
    }
});

module.exports = router;












