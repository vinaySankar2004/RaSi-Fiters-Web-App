const express = require("express");
const { Op } = require("sequelize");
const { authenticateToken } = require("../middleware/auth");
const { WorkoutLog, Program } = require("../models");

const router = express.Router();

const computeStreaks = (dates) => {
    if (!dates.length) return { current: 0, longest: 0 };
    const sorted = dates.map(d => new Date(`${d}T00:00:00Z`)).sort((a, b) => a - b);
    let longest = 1;
    let currentRun = 1;
    for (let i = 1; i < sorted.length; i++) {
        const diff = (sorted[i] - sorted[i - 1]) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
            currentRun += 1;
        } else if (diff === 0) {
            // same day, ignore
        } else {
            longest = Math.max(longest, currentRun);
            currentRun = 1;
        }
    }
    longest = Math.max(longest, currentRun);
    // current streak: contiguous to most recent
    let current = 1;
    for (let i = sorted.length - 1; i > 0; i--) {
        const diff = (sorted[i] - sorted[i - 1]) / (1000 * 60 * 60 * 24);
        if (diff === 1 || diff === 0) {
            current += 1;
        } else {
            break;
        }
    }
    return { current, longest };
};

const milestonesList = [3, 7, 14, 30, 60, 90];

router.get("/", authenticateToken, async (req, res) => {
    try {
        const { programId, memberId } = req.query;
        if (!programId || !memberId) {
            return res.status(400).json({ error: "programId and memberId are required." });
        }

        const program = await Program.findOne({
            where: { id: programId, is_deleted: false }
        });
        if (!program) {
            return res.status(404).json({ error: "Program not found." });
        }
        const start = new Date(`${program.start_date}T00:00:00Z`);
        const today = new Date();
        const end = today;

        const logs = await WorkoutLog.findAll({
            where: {
                program_id: programId,
                member_id: memberId,
                date: {
                    [Op.between]: [
                        start.toISOString().slice(0, 10),
                        end.toISOString().slice(0, 10)
                    ]
                }
            },
            attributes: ["date"]
        });

        const dates = Array.from(new Set(logs.map(l => l.date)));
        const { current, longest } = computeStreaks(dates);

        const milestones = milestonesList.map(m => ({
            dayValue: m,
            achieved: longest >= m || current >= m
        }));

        res.json({
            currentStreakDays: current,
            longestStreakDays: longest,
            milestones
        });
    } catch (err) {
        console.error("Error fetching member streaks:", err);
        res.status(500).json({ error: "Failed to fetch member streaks." });
    }
});

module.exports = router;












