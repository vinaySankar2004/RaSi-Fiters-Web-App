const express = require("express");
const { Op, fn, col, literal } = require("sequelize");
const { DailyHealthLog, WorkoutLog, Member, Program } = require("../models/index");
const { authenticateToken } = require("../middleware/auth");
const { getPeriodRange } = require("../utils/dateRange");

const router = express.Router();

const percentChange = (current, previous) => {
    if (!previous || previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return Number((((current - previous) / previous) * 100).toFixed(1));
};

router.get("/summary", authenticateToken, async (req, res) => {
    try {
        const period = (req.query.period || "day").toLowerCase();
        const { programId } = req.query;
        const { current, previous, label } = getPeriodRange(period);

        const currentWhere = {
            date: { [Op.between]: [current.start, current.end] }
        };
        const previousWhere = {
            date: { [Op.between]: [previous.start, previous.end] }
        };
        if (programId) {
            currentWhere.program_id = programId;
            previousWhere.program_id = programId;
        }

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
            Member.count(),
            WorkoutLog.count({ where: currentWhere }),
            WorkoutLog.count({ where: previousWhere }),
            WorkoutLog.sum("duration", { where: currentWhere }),
            WorkoutLog.sum("duration", { where: previousWhere }),
            WorkoutLog.count({
                where: currentWhere,
                distinct: true,
                col: "member_id"
            }),
            WorkoutLog.findAll({
                where: currentWhere,
                attributes: [
                    "member_id",
                    [fn("COUNT", "*"), "workouts"],
                    [fn("SUM", col("duration")), "totalDuration"]
                ],
                include: [
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
                    "workout_name",
                    [fn("COUNT", "*"), "sessions"],
                    [fn("SUM", col("duration")), "duration"]
                ],
                group: ["workout_name"],
                order: [[literal("sessions"), "DESC"]],
                limit: 8
            }),
            WorkoutLog.findAll({
                where: currentWhere,
                attributes: [
                    "date",
                    [fn("COUNT", "*"), "workouts"],
                    [fn("SUM", col("duration")), "duration"]
                ],
                group: ["date"],
                order: [["date", "ASC"]]
            })
        ]);

        const totalDurationCurrent = currentDuration || 0;
        const totalDurationPrevious = previousDuration || 0;
        const avgDuration = currentLogs > 0 ? Math.round(totalDurationCurrent / currentLogs) : 0;
        const avgDurationPrev = previousLogs > 0 ? Math.round(totalDurationPrevious / previousLogs) : 0;
        const atRiskMembers = Math.max(totalMembers - activeMembers, 0);

        const timelineSeries = timeline.map((row) => ({
            date: row.date,
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
            workout_name: row.workout_name,
            sessions: Number(row.get("sessions")),
            duration: Number(row.get("duration"))
        }));

        res.json({
            period: label,
            range: {
                current,
                previous
            },
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
        console.error("Error generating analytics summary:", err);
        res.status(500).json({ error: "Failed to generate analytics summary." });
    }
});

module.exports = router;

// MTD participation (active members in current month vs total; change vs prior month)
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
        const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0); // last day prev month

        const whereCurrent = {
            date: {
                [Op.between]: [
                    currentStart.toISOString().slice(0, 10),
                    nextMonthStart.toISOString().slice(0, 10)
                ]
            }
        };

        const wherePrev = {
            date: {
                [Op.between]: [
                    prevMonthStart.toISOString().slice(0, 10),
                    prevMonthEnd.toISOString().slice(0, 10)
                ]
            }
        };

        whereCurrent.program_id = programId;
        wherePrev.program_id = programId;

        const [totalMembers, activeCurrent, activePrev] = await Promise.all([
            Member.count(),
            WorkoutLog.count({ where: whereCurrent, distinct: true, col: "member_id" }),
            WorkoutLog.count({ where: wherePrev, distinct: true, col: "member_id" })
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
        console.error("Error computing MTD participation:", err);
        res.status(500).json({ error: "Failed to compute MTD participation." });
    }
});

// Total workouts MTD (count + percent change vs prior month) filtered by program
router.get("/workouts/total", authenticateToken, async (req, res) => {
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
            date: {
                [Op.between]: [
                    currentStart.toISOString().slice(0, 10),
                    nextMonthStart.toISOString().slice(0, 10)
                ]
            }
        };

        const wherePrev = {
            program_id: programId,
            date: {
                [Op.between]: [
                    prevMonthStart.toISOString().slice(0, 10),
                    prevMonthEnd.toISOString().slice(0, 10)
                ]
            }
        };

        const [currentCount, previousCount] = await Promise.all([
            WorkoutLog.count({ where: whereCurrent }),
            WorkoutLog.count({ where: wherePrev })
        ]);

        res.json({
            total_workouts: currentCount,
            change_pct: percentChange(currentCount, previousCount)
        });
    } catch (err) {
        console.error("Error computing total workouts:", err);
        res.status(500).json({ error: "Failed to compute total workouts." });
    }
});

// Total duration MTD (minutes -> hours) with percent change vs prior month, filtered by program
router.get("/duration/total", authenticateToken, async (req, res) => {
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
            date: {
                [Op.between]: [
                    currentStart.toISOString().slice(0, 10),
                    nextMonthStart.toISOString().slice(0, 10)
                ]
            }
        };

        const wherePrev = {
            program_id: programId,
            date: {
                [Op.between]: [
                    prevMonthStart.toISOString().slice(0, 10),
                    prevMonthEnd.toISOString().slice(0, 10)
                ]
            }
        };

        const [currentMinutes, prevMinutes] = await Promise.all([
            WorkoutLog.sum("duration", { where: whereCurrent }),
            WorkoutLog.sum("duration", { where: wherePrev })
        ]);

        const currentTotal = Number(currentMinutes || 0);
        const prevTotal = Number(prevMinutes || 0);

        res.json({
            total_minutes: currentTotal,
            change_pct: percentChange(currentTotal, prevTotal)
        });
    } catch (err) {
        console.error("Error computing total duration:", err);
        res.status(500).json({ error: "Failed to compute total duration." });
    }
});

// Workout activity timeline for W/M/Y/P (program) aggregations per program
router.get("/timeline", authenticateToken, async (req, res) => {
    try {
        const period = (req.query.period || "week").toLowerCase(); // week, month, year, program
        const { programId } = req.query;
        if (!programId) {
            return res.status(400).json({ error: "programId is required" });
        }

        const { windowStart, windowEnd, bucketGranularity, label, labelMode } = await resolveTimelineWindow(period, programId);

        const logs = await WorkoutLog.findAll({
            where: {
                program_id: programId,
                date: {
                    [Op.between]: [windowStart, windowEnd]
                }
            },
            attributes: ["date", "member_id"]
        });

        const buckets = buildBuckets(windowStart, windowEnd, bucketGranularity, labelMode);

        for (const log of logs) {
            const key = bucketKey(new Date(log.date + "T00:00:00Z"), bucketGranularity);
            if (!buckets.has(key)) continue;
            const bucket = buckets.get(key);
            bucket.workouts += 1;
            bucket.members.add(String(log.member_id));
        }

        const points = Array.from(buckets.values()).map((bucket) => ({
            date: bucket.date,
            label: bucket.label,
            workouts: bucket.workouts,
            active_members: bucket.members.size
        }));

        const totalWorkouts = points.reduce((sum, p) => sum + p.workouts, 0);
        const totalDays = Math.max(1, dayDiff(windowStart, windowEnd) + 1);
        const dailyAverage = Number((totalWorkouts / totalDays).toFixed(1));

        res.json({
            mode: period,
            label,
            daily_average: dailyAverage,
            buckets: points
        });
    } catch (err) {
        console.error("Error computing activity timeline:", err);
        res.status(500).json({ error: "Failed to compute activity timeline." });
    }
});

// Daily health timeline for sleep + food quality (program or member)
router.get("/health/timeline", authenticateToken, async (req, res) => {
    try {
        const period = (req.query.period || "week").toLowerCase(); // week, month, year, program
        const { programId, memberId } = req.query;
        if (!programId) {
            return res.status(400).json({ error: "programId is required" });
        }

        const { windowStart, windowEnd, bucketGranularity, label, labelMode } = await resolveTimelineWindow(period, programId);

        const whereClause = {
            program_id: programId,
            log_date: {
                [Op.between]: [windowStart, windowEnd]
            }
        };
        if (memberId) {
            whereClause.member_id = memberId;
        }

        const logs = await DailyHealthLog.findAll({
            where: whereClause,
            attributes: ["log_date", "sleep_hours", "food_quality"]
        });

        const buckets = buildBuckets(windowStart, windowEnd, bucketGranularity, labelMode);
        for (const bucket of buckets.values()) {
            bucket.sleep_sum = 0;
            bucket.sleep_count = 0;
            bucket.food_sum = 0;
            bucket.food_count = 0;
        }

        for (const log of logs) {
            const key = bucketKey(new Date(log.log_date + "T00:00:00Z"), bucketGranularity);
            if (!buckets.has(key)) continue;
            const bucket = buckets.get(key);
            if (log.sleep_hours !== null && log.sleep_hours !== undefined) {
                const sleepValue = Number(log.sleep_hours);
                if (Number.isFinite(sleepValue)) {
                    bucket.sleep_sum += sleepValue;
                    bucket.sleep_count += 1;
                }
            }
            if (log.food_quality !== null && log.food_quality !== undefined) {
                const foodValue = Number(log.food_quality);
                if (Number.isFinite(foodValue)) {
                    bucket.food_sum += foodValue;
                    bucket.food_count += 1;
                }
            }
        }

        let sleepAvgSum = 0;
        let sleepAvgDays = 0;
        let foodAvgSum = 0;
        let foodAvgDays = 0;
        const round1 = (value) => Number(value.toFixed(1));

        const points = Array.from(buckets.values()).map((bucket) => {
            const sleepAvg = bucket.sleep_count > 0 ? round1(bucket.sleep_sum / bucket.sleep_count) : 0;
            const foodAvg = bucket.food_count > 0 ? round1(bucket.food_sum / bucket.food_count) : 0;
            if (bucket.sleep_count > 0) {
                sleepAvgSum += sleepAvg;
                sleepAvgDays += 1;
            }
            if (bucket.food_count > 0) {
                foodAvgSum += foodAvg;
                foodAvgDays += 1;
            }
            return {
                date: bucket.date,
                label: bucket.label,
                sleep_hours: sleepAvg,
                food_quality: foodAvg
            };
        });

        const dailyAverageSleep = sleepAvgDays > 0 ? round1(sleepAvgSum / sleepAvgDays) : 0;
        const dailyAverageFood = foodAvgDays > 0 ? round1(foodAvgSum / foodAvgDays) : 0;

        res.json({
            mode: period,
            label,
            daily_average_sleep: dailyAverageSleep,
            daily_average_food: dailyAverageFood,
            buckets: points,
            start: windowStart,
            end: windowEnd
        });
    } catch (err) {
        console.error("Error computing health timeline:", err);
        res.status(500).json({ error: "Failed to compute health timeline." });
    }
});

// Workout distribution by weekday for a program (all time)
router.get("/distribution/day", authenticateToken, async (req, res) => {
    try {
        const { programId } = req.query;
        if (!programId) {
            return res.status(400).json({ error: "programId is required" });
        }

        // Group by date first, then roll up to weekday in JS to stay portable across DBs.
        const rows = await WorkoutLog.findAll({
            where: { program_id: programId },
            attributes: [
                "date",
                [fn("COUNT", "*"), "workouts"]
            ],
            group: ["date"],
            order: [["date", "ASC"]]
        });

        const byDay = {
            Sunday: 0,
            Monday: 0,
            Tuesday: 0,
            Wednesday: 0,
            Thursday: 0,
            Friday: 0,
            Saturday: 0
        };

        for (const row of rows) {
            const date = row.date;
            const count = Number(row.get("workouts")) || 0;
            const day = new Date(date + "T00:00:00Z").toLocaleDateString("en-US", { weekday: "long" });
            if (byDay[day] !== undefined) {
                byDay[day] += count;
            }
        }

        res.json(byDay);
    } catch (err) {
        console.error("Error computing distribution by day:", err);
        res.status(500).json({ error: "Failed to compute distribution by day." });
    }
});

// Top workout types (program-to-date) aggregated counts + avg duration
router.get("/workouts/types", authenticateToken, async (req, res) => {
    try {
        const { programId, memberId, limit = 50 } = req.query;
        if (!programId) {
            return res.status(400).json({ error: "programId is required" });
        }

        const rows = await WorkoutLog.findAll({
            where: memberId ? { program_id: programId, member_id: memberId } : { program_id: programId },
            attributes: [
                "workout_name",
                [fn("COUNT", "*"), "sessions"],
                [fn("SUM", col("duration")), "duration"]
            ],
            group: ["workout_name"],
            order: [[literal("sessions"), "DESC"]],
            limit: Number(limit)
        });

        const formatted = rows.map((row) => {
            const sessions = Number(row.get("sessions")) || 0;
            const totalDuration = Number(row.get("duration")) || 0;
            const avgMinutes = sessions > 0 ? Math.round(totalDuration / sessions) : 0;
            return {
                workout_name: row.workout_name,
                sessions,
                total_duration: totalDuration,
                avg_duration_minutes: avgMinutes
            };
        });

        res.json(formatted);
    } catch (err) {
        console.error("Error computing top workout types:", err);
        res.status(500).json({ error: "Failed to compute top workout types." });
    }
});

// Helpers
const dayDiff = (startISO, endISO) => {
    const s = new Date(startISO + "T00:00:00Z");
    const e = new Date(endISO + "T00:00:00Z");
    return Math.floor((e - s) / 86400000);
};

const resolveTimelineWindow = async (period, programId) => {
    const today = new Date();
    let start = new Date(today);
    let end = new Date(today);
    let granularity = "day";
    let label = "";
    let labelMode = "weekday";

    if (period === "week") {
        // last 7 days including today
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setUTCDate(today.getUTCDate() - 6);
        start = sevenDaysAgo;
        end = today;
        granularity = "day";
        labelMode = "weekday";
        label = "Last 7 Days";
    } else if (period === "month") {
        const first = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
        const last = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0));
        start = first;
        end = last;
        granularity = "day";
        labelMode = "monthday";
        label = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(first);
    } else if (period === "year") {
        const first = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
        const last = new Date(Date.UTC(today.getUTCFullYear(), 11, 31));
        start = first;
        end = last;
        granularity = "month";
        labelMode = "month";
        label = String(today.getUTCFullYear());
    } else if (period === "program") {
        const program = await Program.findOne({
            where: { id: programId, is_deleted: false }
        });
        if (!program || !program.start_date || !program.end_date) {
            throw new Error("Program has no start/end date");
        }
        const startDate = new Date(program.start_date + "T00:00:00Z");
        const endDate = new Date(program.end_date + "T00:00:00Z");
        start = startDate;
        end = endDate;
        granularity = "month";
        labelMode = "month";
        label = `${new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(start)} – ${new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(end)}`;
    } else {
        throw new Error("Invalid period. Use week|month|year|program.");
    }

    return {
        windowStart: toISODate(start),
        windowEnd: toISODate(end),
        bucketGranularity: granularity,
        label,
        labelMode
    };
};

const toISODate = (d) => d.toISOString().slice(0, 10);

const bucketKey = (date, granularity) => {
    if (granularity === "day") {
        return toISODate(date);
    }
    // month
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
};

const bucketLabel = (key, granularity, labelMode = "weekday") => {
    if (granularity === "day") {
        const d = new Date(key + "T00:00:00Z");
        if (labelMode === "monthday") {
            return String(d.getUTCDate());
        }
        // weekday
        return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(d);
    }
    // month granularity
    const [year, month] = key.split("-");
    return new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(Number(year), Number(month) - 1, 1));
};

const buildBuckets = (startISO, endISO, granularity, labelMode = "weekday") => {
    const buckets = new Map();
    const start = new Date(startISO + "T00:00:00Z");
    const end = new Date(endISO + "T00:00:00Z");
    const cursor = new Date(start);

    while (cursor <= end) {
        const key = bucketKey(cursor, granularity);
        if (!buckets.has(key)) {
            buckets.set(key, {
                date: key,
                label: bucketLabel(key, granularity, labelMode),
                workouts: 0,
                members: new Set()
            });
        }

        if (granularity === "day") {
            cursor.setUTCDate(cursor.getUTCDate() + 1);
        } else {
            cursor.setUTCMonth(cursor.getUTCMonth() + 1);
        }
    }

    return buckets;
};
const getWeekKey = (date) => {
    // ISO week number
    const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const dayNum = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((target - yearStart) / 86400000 + 1) / 7);
    return String(weekNo).padStart(2, "0");
};


// Average workout duration MTD (minutes per session) with percent change vs prior month, filtered by program
router.get("/duration/average", authenticateToken, async (req, res) => {
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
            date: {
                [Op.between]: [
                    currentStart.toISOString().slice(0, 10),
                    nextMonthStart.toISOString().slice(0, 10)
                ]
            }
        };

        const wherePrev = {
            program_id: programId,
            date: {
                [Op.between]: [
                    prevMonthStart.toISOString().slice(0, 10),
                    prevMonthEnd.toISOString().slice(0, 10)
                ]
            }
        };

        const [currentMinutes, currentSessions, prevMinutes, prevSessions] = await Promise.all([
            WorkoutLog.sum("duration", { where: whereCurrent }),
            WorkoutLog.count({ where: whereCurrent }),
            WorkoutLog.sum("duration", { where: wherePrev }),
            WorkoutLog.count({ where: wherePrev })
        ]);

        const currentTotal = Number(currentMinutes || 0);
        const prevTotal = Number(prevMinutes || 0);
        const currentAvg = currentSessions > 0 ? Math.round(currentTotal / currentSessions) : 0;
        const prevAvg = prevSessions > 0 ? Math.round(prevTotal / prevSessions) : 0;

        res.json({
            avg_minutes: currentAvg,
            change_pct: percentChange(currentAvg, prevAvg)
        });
    } catch (err) {
        console.error("Error computing average duration:", err);
        res.status(500).json({ error: "Failed to compute average duration." });
    }
});

// Export helpers for member history reuse
module.exports.resolveTimelineWindow = resolveTimelineWindow;
module.exports.buildBuckets = buildBuckets;
module.exports.bucketKey = bucketKey;
