const express = require("express");
const { Op, fn, col, literal } = require("sequelize");
const { WorkoutLog, Member, ProgramMembership, ProgramWorkout } = require("../models");
const { authenticateToken } = require("../middleware/auth");
const { getPeriodRange } = require("../utils/dateRange");

const router = express.Router();

const percentChange = (current, previous) => {
    if (!previous || previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return Number((((current - previous) / previous) * 100).toFixed(1));
};

const activeMembershipInclude = (programId) => ({
    model: ProgramMembership,
    attributes: [],
    required: true,
    where: {
        program_id: programId,
        status: "active"
    }
});

// Summary (v2) — uses program_memberships for total members when programId is provided
router.get("/summary", authenticateToken, async (req, res) => {
    try {
        const period = (req.query.period || "day").toLowerCase();
        const { programId } = req.query;
        const { current, previous } = getPeriodRange(period);

        const currentWhere = {
            log_date: { [Op.between]: [current.start, current.end] }
        };
        const previousWhere = {
            log_date: { [Op.between]: [previous.start, previous.end] }
        };
        if (programId) {
            currentWhere.program_id = programId;
            previousWhere.program_id = programId;
        }
        const activeInclude = programId ? [activeMembershipInclude(programId)] : [];

        const [
            totalMembers,
            currentLogs,
            previousLogs,
            currentDuration,
            previousDuration,
            activeMembers,
            topPerformers,
            topWorkoutTypes,
            timeline
        ] = await Promise.all([
            programId
                ? ProgramMembership.count({ where: { program_id: programId, status: "active" } })
                : Member.count(),
            WorkoutLog.count({ where: currentWhere, include: activeInclude }),
            WorkoutLog.count({ where: previousWhere, include: activeInclude }),
            WorkoutLog.sum("duration", { where: currentWhere, include: activeInclude }),
            WorkoutLog.sum("duration", { where: previousWhere, include: activeInclude }),
            WorkoutLog.count({
                where: currentWhere,
                distinct: true,
                col: "member_id",
                include: activeInclude
            }),
            WorkoutLog.findAll({
                where: currentWhere,
                attributes: [
                    "member_id",
                    [fn("COUNT", "*"), "workouts"],
                    [fn("SUM", col("duration")), "totalDuration"]
                ],
                include: [
                    ...activeInclude,
                    {
                        model: Member,
                        attributes: ["member_name"]
                    }
                ],
                group: ["member_id", "Member.id"],
                order: [[literal("workouts"), "DESC"]],
                limit: 5
            }),
            WorkoutLog.findAll({
                where: currentWhere,
                attributes: [
                    [col("ProgramWorkout.workout_name"), "workout_name"],
                    [fn("COUNT", "*"), "sessions"],
                    [fn("SUM", col("duration")), "duration"]
                ],
                include: [
                    ...activeInclude,
                    {
                        model: ProgramWorkout,
                        attributes: []
                    }
                ],
                group: ["ProgramWorkout.workout_name"],
                order: [[literal("sessions"), "DESC"]],
                limit: 8
            }),
            WorkoutLog.findAll({
                where: currentWhere,
                attributes: [
                    "log_date",
                    [fn("COUNT", "*"), "workouts"],
                    [fn("SUM", col("duration")), "duration"]
                ],
                include: activeInclude,
                group: ["log_date"],
                order: [["log_date", "ASC"]]
            })
        ]);

        const totalDurationCurrent = currentDuration || 0;
        const totalDurationPrevious = previousDuration || 0;
        const avgDuration = currentLogs > 0 ? Math.round(totalDurationCurrent / currentLogs) : 0;
        const avgDurationPrev = previousLogs > 0 ? Math.round(totalDurationPrevious / previousLogs) : 0;
        const atRiskMembers = Math.max(totalMembers - activeMembers, 0);

        const timelineSeries = timeline.map((row) => ({
            date: row.log_date,
            workouts: Number(row.get("workouts")),
            duration: Number(row.get("duration"))
        }));

        const distributionByDay = timelineSeries.reduce((acc, item) => {
            const day = new Date(item.date + "T00:00:00Z").toLocaleDateString("en-US", { weekday: "long" });
            if (!acc[day]) acc[day] = { workouts: 0, duration: 0 };
            acc[day].workouts += item.workouts;
            acc[day].duration += item.duration;
            return acc;
        }, {});

        const topPerformersFormatted = topPerformers.map((row) => ({
            member_id: row.member_id,
            member_name: row.Member?.member_name || "Unknown",
            workouts: Number(row.get("workouts")),
            total_duration: Number(row.get("totalDuration"))
        }));

        const topWorkoutTypesFormatted = topWorkoutTypes.map((row) => ({
            workout_name: row.get("workout_name"),
            sessions: Number(row.get("sessions")),
            total_duration: Number(row.get("duration"))
        }));

        res.json({
            period,
            totals: {
                logs: currentLogs,
                logs_change_pct: percentChange(currentLogs, previousLogs),
                duration_minutes: totalDurationCurrent,
                duration_change_pct: percentChange(totalDurationCurrent, totalDurationPrevious),
                avg_duration_minutes: avgDuration,
                avg_duration_change_pct: percentChange(avgDuration, avgDurationPrev)
            },
            members: {
                total: totalMembers,
                active: activeMembers,
                at_risk: atRiskMembers
            },
            timeline: timelineSeries,
            distribution_by_day: distributionByDay,
            top_performers: topPerformersFormatted,
            top_workout_types: topWorkoutTypesFormatted
        });
    } catch (err) {
        console.error("Error generating analytics summary (v2):", err);
        res.status(500).json({ error: "Failed to generate analytics summary." });
    }
});

// MTD participation (v2) using program_memberships for totals
router.get("/participation/mtd", authenticateToken, async (req, res) => {
    try {
        const { programId } = req.query;
        if (!programId) {
            return res.status(400).json({ error: "programId is required" });
        }
        const today = new Date();
        const currentStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

        const whereCurrent = {
            program_id: programId,
            log_date: {
                [Op.between]: [
                    currentStart.toISOString().slice(0, 10),
                    nextMonthStart.toISOString().slice(0, 10)
                ]
            }
        };

        const wherePrev = {
            program_id: programId,
            log_date: {
                [Op.between]: [
                    prevMonthStart.toISOString().slice(0, 10),
                    prevMonthEnd.toISOString().slice(0, 10)
                ]
            }
        };

        const [totalMembers, activeCurrent, activePrev] = await Promise.all([
            ProgramMembership.count({ where: { program_id: programId, status: "active" } }),
            WorkoutLog.count({
                where: whereCurrent,
                distinct: true,
                col: "member_id",
                include: [activeMembershipInclude(programId)]
            }),
            WorkoutLog.count({
                where: wherePrev,
                distinct: true,
                col: "member_id",
                include: [activeMembershipInclude(programId)]
            })
        ]);

        const currentPct = totalMembers > 0 ? Number(((activeCurrent / totalMembers) * 100).toFixed(1)) : 0;
        const prevPct = totalMembers > 0 ? Number(((activePrev / totalMembers) * 100).toFixed(1)) : 0;

        res.json({
            total_members: totalMembers,
            active_members: activeCurrent,
            participation_pct: currentPct,
            change_pct: percentChange(currentPct, prevPct)
        });
    } catch (err) {
        console.error("Error computing MTD participation (v2):", err);
        res.status(500).json({ error: "Failed to compute MTD participation." });
    }
});

// Workout types - program-to-date metrics (v2)
router.get("/workouts/types/total", authenticateToken, async (req, res) => {
    try {
        const { programId, memberId } = req.query;
        if (!programId) {
            return res.status(400).json({ error: "programId is required" });
        }

        // Use findAll with group to count distinct workout types
        // (Sequelize count with distinct on included column doesn't work reliably)
        const rows = await WorkoutLog.findAll({
            where: memberId ? { program_id: programId, member_id: memberId } : { program_id: programId },
            attributes: [
                [col("ProgramWorkout.workout_name"), "workout_name"]
            ],
            include: [
                activeMembershipInclude(programId),
                {
                    model: ProgramWorkout,
                    attributes: []
                }
            ],
            group: ["ProgramWorkout.workout_name"]
        });

        res.json({ total_types: rows.length });
    } catch (err) {
        console.error("Error computing total workout types:", err);
        res.status(500).json({ error: "Failed to compute total workout types." });
    }
});

router.get("/workouts/types/most-popular", authenticateToken, async (req, res) => {
    try {
        const { programId, memberId } = req.query;
        if (!programId) {
            return res.status(400).json({ error: "programId is required" });
        }

        const rows = await WorkoutLog.findAll({
            where: memberId ? { program_id: programId, member_id: memberId } : { program_id: programId },
            attributes: [
                [col("ProgramWorkout.workout_name"), "workout_name"],
                [fn("COUNT", "*"), "sessions"]
            ],
            include: [
                activeMembershipInclude(programId),
                {
                    model: ProgramWorkout,
                    attributes: []
                }
            ],
            group: ["ProgramWorkout.workout_name"],
            order: [[literal("sessions"), "DESC"]],
            limit: 1
        });

        const top = rows[0];
        res.json({
            workout_name: top?.get("workout_name") ?? null,
            sessions: Number(top?.get("sessions")) || 0
        });
    } catch (err) {
        console.error("Error computing most popular workout type:", err);
        res.status(500).json({ error: "Failed to compute most popular workout type." });
    }
});

router.get("/workouts/types/longest-duration", authenticateToken, async (req, res) => {
    try {
        const { programId, memberId } = req.query;
        if (!programId) {
            return res.status(400).json({ error: "programId is required" });
        }

        const rows = await WorkoutLog.findAll({
            where: memberId ? { program_id: programId, member_id: memberId } : { program_id: programId },
            attributes: [
                [col("ProgramWorkout.workout_name"), "workout_name"],
                [fn("AVG", col("duration")), "avg_duration"]
            ],
            include: [
                activeMembershipInclude(programId),
                {
                    model: ProgramWorkout,
                    attributes: []
                }
            ],
            group: ["ProgramWorkout.workout_name"],
            order: [[literal("avg_duration"), "DESC"]],
            limit: 1
        });

        const longest = rows[0];
        const longestAvg = Math.round(Number(longest?.get("avg_duration")) || 0);

        res.json({
            workout_name: longest?.get("workout_name") ?? null,
            avg_minutes: longestAvg
        });
    } catch (err) {
        console.error("Error computing longest duration workout type:", err);
        res.status(500).json({ error: "Failed to compute longest duration workout type." });
    }
});

router.get("/workouts/types/highest-participation", authenticateToken, async (req, res) => {
    try {
        const { programId, memberId } = req.query;
        if (!programId) {
            return res.status(400).json({ error: "programId is required" });
        }

        if (memberId) {
            const rows = await WorkoutLog.findAll({
                where: { program_id: programId, member_id: memberId },
                attributes: [
                    [col("ProgramWorkout.workout_name"), "workout_name"],
                    [fn("COUNT", "*"), "sessions"]
                ],
                include: [
                    activeMembershipInclude(programId),
                    {
                        model: ProgramWorkout,
                        attributes: []
                    }
                ],
                group: ["ProgramWorkout.workout_name"],
                order: [[literal("sessions"), "DESC"]],
                limit: 1
            });

            const totalWorkouts = await WorkoutLog.count({
                where: { program_id: programId, member_id: memberId },
                include: [activeMembershipInclude(programId)]
            });

            const top = rows[0];
            const sessions = Number(top?.get("sessions")) || 0;
            const participationPct = totalWorkouts > 0
                ? Number(((sessions / totalWorkouts) * 100).toFixed(1))
                : 0;

            return res.json({
                workout_name: top?.get("workout_name") ?? null,
                participants: sessions > 0 ? 1 : 0,
                participation_pct: participationPct,
                total_members: 1
            });
        }

        const [totalMembers, rows] = await Promise.all([
            ProgramMembership.count({ where: { program_id: programId, status: "active" } }),
            WorkoutLog.findAll({
                where: { program_id: programId },
                attributes: [
                    [col("ProgramWorkout.workout_name"), "workout_name"],
                    [fn("COUNT", literal('DISTINCT "WorkoutLog"."member_id"')), "participants"]
                ],
                include: [
                    activeMembershipInclude(programId),
                    {
                        model: ProgramWorkout,
                        attributes: []
                    }
                ],
                group: ["ProgramWorkout.workout_name"],
                order: [[literal("participants"), "DESC"]],
                limit: 1
            })
        ]);

        const top = rows[0];
        const participants = Number(top?.get("participants")) || 0;
        const participationPct = totalMembers > 0
            ? Number(((participants / totalMembers) * 100).toFixed(1))
            : 0;

        res.json({
            workout_name: top?.get("workout_name") ?? null,
            participants,
            participation_pct: participationPct,
            total_members: totalMembers
        });
    } catch (err) {
        console.error("Error computing highest participation workout type:", err);
        res.status(500).json({ error: "Failed to compute highest participation workout type." });
    }
});

module.exports = router;
