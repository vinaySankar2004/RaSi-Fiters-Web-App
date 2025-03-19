// Date and program constant values
// (Assuming these strings are interpreted as UTC or you want to treat them as such)
export const PROGRAM_START_DATE = new Date('2025-03-01');
export const PROGRAM_END_DATE = new Date('2025-12-31');

// Helper function to get a "today" date in UTC (with time set to midnight UTC)
const getUTCToday = () => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

// Helper functions for analytics calculations

/**
 * Calculate MTD participation for a single member.
 *
 * This returns the percentage of days the member worked out so far in the current month,
 * and the trend (difference compared to the previous month's participation rate).
 *
 * Returns:
 *   {
 *     participationRate: number,   // e.g., 30
 *     trend: number                // e.g., +5 (meaning 5 percentage points higher than last month)
 *   }
 */
export const calculateMemberMtdParticipation = (workoutLogs, memberName) => {
    if (!workoutLogs.length || !memberName) {
        return { participationRate: 0, trend: 0 };
    }

    // 1) Get "today" in UTC
    const today = getUTCToday();
    const currentMonth = today.getUTCMonth();
    const currentYear = today.getUTCFullYear();

    // 2) Get current month logs for this member
    const currentMonthLogs = workoutLogs.filter(log => {
        const logDate = new Date(log.date);
        return (
            log.member_name === memberName &&
            logDate.getUTCMonth() === currentMonth &&
            logDate.getUTCFullYear() === currentYear
        );
    });
    // Count distinct days (each log.date is an ISO string, so we assume it represents a day)
    const currentDaysSet = new Set(currentMonthLogs.map(log => log.date));
    const currentDistinctDays = currentDaysSet.size;

    // 3) Days elapsed so far in current month (using UTC day-of-month)
    const daysElapsed = today.getUTCDate();

    // 4) Participation rate for current month
    const participationRate = daysElapsed > 0 ? Math.round((currentDistinctDays / daysElapsed) * 100) : 0;

    // 5) Now for the previous month:
    let prevMonth, prevMonthYear;
    if (currentMonth === 0) {
        prevMonth = 11; // December
        prevMonthYear = currentYear - 1;
    } else {
        prevMonth = currentMonth - 1;
        prevMonthYear = currentYear;
    }
    const prevMonthLogs = workoutLogs.filter(log => {
        const logDate = new Date(log.date);
        return (
            log.member_name === memberName &&
            logDate.getUTCMonth() === prevMonth &&
            logDate.getUTCFullYear() === prevMonthYear
        );
    });
    const prevDaysSet = new Set(prevMonthLogs.map(log => log.date));
    const prevDistinctDays = prevDaysSet.size;

    // For previous month, use the total days in that month for a full comparison
    const daysInPrevMonth = new Date(Date.UTC(prevMonthYear, prevMonth + 1, 0)).getUTCDate();
    const prevParticipationRate = daysInPrevMonth > 0 ? Math.round((prevDistinctDays / daysInPrevMonth) * 100) : 0;

    // 6) Trend is the difference in percentage points
    const trend = participationRate - prevParticipationRate;

    return { participationRate, trend };
};


/**
 * Process workoutLogs data for analytics visualizations
 */
export const processWorkoutData = (workoutLogs, members, workouts, timeRange, selectedMember, isAdmin, memberName) => {
    if (!workoutLogs.length) return {};

    // Filter logs based on selected time range and member
    const filteredLogs = filterWorkoutLogs(workoutLogs, timeRange, selectedMember, isAdmin);

    // Current date information (using UTC)
    const today = getUTCToday();
    const currentMonth = today.getUTCMonth();
    const currentYear = today.getUTCFullYear();

    // Program progress calculations
    const programProgress = calculateProgramProgress();

    // Month to date calculations
    const daysInMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).getUTCDate();
    const dayOfMonth = today.getUTCDate();
    const mtdProgress = Math.round((dayOfMonth / daysInMonth) * 100);

    // Process different aspects of the data
    const workoutTypeStats = processWorkoutTypeData(filteredLogs, members);
    const memberStats = processMemberData(filteredLogs);
    const memberStreaks = calculateMemberStreaks(workoutLogs, members);
    const timelineData = generateTimelineData(filteredLogs, timeRange);
    const dayOfWeekData = calculateDayOfWeekData(filteredLogs);

    // Current month logs for MTD calculations (using UTC comparisons)
    const currentMonthLogs = workoutLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate.getUTCMonth() === currentMonth && logDate.getUTCFullYear() === currentYear;
    });

    return {
        workoutTypeStats,
        memberStats,
        memberStreaks,
        timelineData,
        dayOfWeekData,
        currentMonthLogs,
        programProgress,
        mtdProgress
    };
};

/**
 * Filter workout logs based on time range and selected member
 */
export const filterWorkoutLogs = (workoutLogs, timeRange, selectedMember, isAdmin) => {
    const now = getUTCToday();
    const timeRangeStart = getTimeRangeStart(now, timeRange);

    return workoutLogs.filter(log => {
        const logDate = new Date(log.date);

        // Filter by selected member if needed
        if (isAdmin && selectedMember !== 'all' && log.member_name !== selectedMember) {
            return false;
        }

        return logDate >= timeRangeStart;
    });
};

/**
 * Calculate the start date based on the selected time range (in UTC)
 */
export const getTimeRangeStart = (now, timeRange) => {
    switch (timeRange) {
        case 'month':
            return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        case 'quarter':
            const quarterStartMonth = Math.floor(now.getUTCMonth() / 3) * 3;
            return new Date(Date.UTC(now.getUTCFullYear(), quarterStartMonth, 1));
        case 'year':
            return new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
        default:
            return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    }
};

/**
 * Process workout type statistics
 */
export const processWorkoutTypeData = (logs, members) => {
    const workoutTypeData = {};

    logs.forEach(log => {
        if (!workoutTypeData[log.workout_name]) {
            workoutTypeData[log.workout_name] = {
                count: 0,
                totalDuration: 0,
                participants: new Set()
            };
        }
        workoutTypeData[log.workout_name].count += 1;
        workoutTypeData[log.workout_name].totalDuration += log.duration;
        workoutTypeData[log.workout_name].participants.add(log.member_name);
    });

    return Object.keys(workoutTypeData).map(workout => ({
        name: workout,
        count: workoutTypeData[workout].count,
        avgDuration: Math.round(workoutTypeData[workout].totalDuration / workoutTypeData[workout].count),
        participantsCount: workoutTypeData[workout].participants.size,
        participantsPercentage: Math.round((workoutTypeData[workout].participants.size / members.length) * 100)
    })).sort((a, b) => b.count - a.count);
};

/**
 * Process member statistics
 */
export const processMemberData = (logs) => {
    const memberData = {};

    logs.forEach(log => {
        if (!memberData[log.member_name]) {
            memberData[log.member_name] = {
                workoutCount: 0,
                totalDuration: 0,
                workoutTypes: new Set(),
                dates: new Set()
            };
        }
        memberData[log.member_name].workoutCount += 1;
        memberData[log.member_name].totalDuration += log.duration;
        memberData[log.member_name].workoutTypes.add(log.workout_name);
        memberData[log.member_name].dates.add(log.date);
    });

    return Object.keys(memberData).map(member => ({
        name: member,
        workoutCount: memberData[member].workoutCount,
        totalDuration: memberData[member].totalDuration,
        averageDuration: Math.round(memberData[member].totalDuration / memberData[member].workoutCount),
        uniqueWorkoutTypes: memberData[member].workoutTypes.size,
        activeDays: memberData[member].dates.size
    })).sort((a, b) => b.workoutCount - a.workoutCount);
};


/**
 * Calculate workout streaks for each member
 */
export const calculateMemberStreaks = (workoutLogs, members) => {
    const memberStreaks = {};

    members.forEach(member => {
        const memberLogs = workoutLogs.filter(log => log.member_name === member.member_name);
        if (memberLogs.length === 0) {
            memberStreaks[member.member_name] = { currentStreak: 0, longestStreak: 0 };
            return;
        }

        // Sort by date (using UTC for consistency)
        const sortedDates = memberLogs
            .map(log => log.date)
            .sort((a, b) => new Date(a) - new Date(b));

        // Remove duplicates
        const uniqueDates = [...new Set(sortedDates)].map(date => new Date(date));

        let currentStreak = 0;
        let longestStreak = 0;
        let currentStreakStart = null;

        // Check if the last workout was today or yesterday (using UTC)
        const lastWorkoutDate = uniqueDates[uniqueDates.length - 1];
        const today = getUTCToday();
        const yesterday = new Date(today);
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);

        if (lastWorkoutDate.getTime() === today.getTime() || lastWorkoutDate.getTime() === yesterday.getTime()) {
            // Start counting the current streak
            currentStreak = 1;
            currentStreakStart = lastWorkoutDate;

            // Go backwards through dates
            for (let i = uniqueDates.length - 2; i >= 0; i--) {
                const currentDate = uniqueDates[i];
                const expectedDate = new Date(currentStreakStart);
                expectedDate.setUTCDate(expectedDate.getUTCDate() - 1);

                if (currentDate.getTime() === expectedDate.getTime()) {
                    currentStreak++;
                    currentStreakStart = currentDate;
                } else {
                    break;
                }
            }
        }

        // Calculate longest streak
        for (let i = 0; i < uniqueDates.length; i++) {
            let streak = 1;
            for (let j = i + 1; j < uniqueDates.length; j++) {
                const currentDate = uniqueDates[j - 1];
                const nextDate = uniqueDates[j];
                const expectedDate = new Date(currentDate);
                expectedDate.setUTCDate(expectedDate.getUTCDate() + 1);

                if (nextDate.getTime() === expectedDate.getTime()) {
                    streak++;
                } else {
                    break;
                }
            }
            longestStreak = Math.max(longestStreak, streak);
        }

        memberStreaks[member.member_name] = { currentStreak, longestStreak };
    });

    return memberStreaks;
};

/**
 * Generate timeline data based on selected time range (using UTC)
 */
export const generateTimelineData = (logs, timeRange) => {
    const now = getUTCToday();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const timelineDates = [];

    // Generate dates for timeline in UTC
    if (timeRange === 'month') {
        const daysInMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), i));
            timelineDates.push({
                date: date.toISOString().split('T')[0],
                label: `${date.getUTCDate()}`
            });
        }
    } else if (timeRange === 'quarter') {
        const quarterStartMonth = Math.floor(now.getUTCMonth() / 3) * 3;
        const quarterStart = new Date(Date.UTC(now.getUTCFullYear(), quarterStartMonth, 1));
        const quarterEnd = new Date(Date.UTC(now.getUTCFullYear(), quarterStartMonth + 3, 0));

        for (let d = new Date(quarterStart); d <= quarterEnd; d.setUTCDate(d.getUTCDate() + 7)) {
            timelineDates.push({
                date: new Date(d).toISOString().split('T')[0],
                label: `${monthNames[d.getUTCMonth()].substr(0, 3)} ${d.getUTCDate()}`
            });
        }
    } else { // year
        for (let i = 0; i < 12; i++) {
            const date = new Date(Date.UTC(now.getUTCFullYear(), i, 1));
            timelineDates.push({
                date: date.toISOString().split('T')[0],
                label: `${monthNames[date.getUTCMonth()].substr(0, 3)}`
            });
        }
    }

    // Build timeline data using UTC comparisons
    return timelineDates.map(dateInfo => {
        const dateObj = new Date(dateInfo.date);
        let dateString = dateInfo.date;

        let startPeriod, endPeriod;
        if (timeRange === 'month') {
            startPeriod = new Date(dateObj);
            endPeriod = new Date(dateObj);
            endPeriod.setUTCDate(endPeriod.getUTCDate() + 1);
        } else if (timeRange === 'quarter') {
            startPeriod = new Date(dateObj);
            endPeriod = new Date(dateObj);
            endPeriod.setUTCDate(endPeriod.getUTCDate() + 7);
        } else { // year
            startPeriod = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), 1));
            endPeriod = new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth() + 1, 0));
        }

        // Filter logs for this period using UTC comparisons
        const periodLogs = logs.filter(log => {
            const logDate = new Date(log.date);
            return logDate >= startPeriod && logDate < endPeriod;
        });

        const totalDuration = periodLogs.reduce((sum, log) => sum + log.duration, 0);
        const uniqueMembers = new Set(periodLogs.map(log => log.member_name)).size;
        const workoutCount = periodLogs.length;

        return {
            date: dateString,
            label: dateInfo.label,
            totalDuration,
            uniqueMembers,
            workoutCount,
            averageDuration: workoutCount > 0 ? Math.round(totalDuration / workoutCount) : 0
        };
    });
};

/**
 * Calculate day of week frequency data (using UTC)
 */
export const calculateDayOfWeekData = (logs) => {
    const dayOfWeekData = Array(7).fill(0).map((_, i) => ({
        day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i],
        count: 0
    }));

    logs.forEach(log => {
        const dayOfWeek = new Date(log.date).getUTCDay();
        dayOfWeekData[dayOfWeek].count++;
    });

    return dayOfWeekData;
};

/**
 * Calculate program progress percentage using UTC today
 */
export const calculateProgramProgress = () => {
    const today = getUTCToday();

    const totalProgramDays = Math.floor((PROGRAM_END_DATE - PROGRAM_START_DATE) / (1000 * 60 * 60 * 24)) + 1;
    const elapsedProgramDays = Math.floor((today - PROGRAM_START_DATE) / (1000 * 60 * 60 * 24)) + 1;

    return {
        totalProgramDays,
        elapsedProgramDays,
        remainingProgramDays: Math.max(0, totalProgramDays - elapsedProgramDays),
        progressPercentage: Math.round((elapsedProgramDays / totalProgramDays) * 100)
    };
};

/**
 * Calculate member-specific statistics using UTC for current month
 */
export const calculateMemberStats = (workoutLogs, memberName) => {
    if (!workoutLogs.length || !memberName) return {};

    const today = getUTCToday();
    const currentMonth = today.getUTCMonth();
    const currentYear = today.getUTCFullYear();

    // Filter logs for the specific member
    const memberLogs = workoutLogs.filter(log => log.member_name === memberName);

    // Calculate MTD stats using UTC
    const mtdLogs = memberLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate.getUTCMonth() === currentMonth && logDate.getUTCFullYear() === currentYear;
    });

    const mtdWorkoutDays = new Set(mtdLogs.map(log => log.date)).size;
    const mtdWorkoutMinutes = mtdLogs.reduce((sum, log) => sum + log.duration, 0);

    // Calculate PTD (Program to Date) stats
    const { elapsedProgramDays } = calculateProgramProgress();

    const ptdLogs = memberLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= PROGRAM_START_DATE;
    });

    const ptdWorkoutDays = new Set(ptdLogs.map(log => log.date)).size;
    const ptdWorkoutMinutes = ptdLogs.reduce((sum, log) => sum + log.duration, 0);
    const ptdCompletionPercentage = Math.round((ptdWorkoutDays / elapsedProgramDays) * 100);

    // Calculate favorite workout
    const workoutCounts = {};
    memberLogs.forEach(log => {
        workoutCounts[log.workout_name] = (workoutCounts[log.workout_name] || 0) + 1;
    });

    let favoriteWorkout = { name: 'None', count: 0 };
    Object.keys(workoutCounts).forEach(workout => {
        if (workoutCounts[workout] > favoriteWorkout.count) {
            favoriteWorkout = { name: workout, count: workoutCounts[workout] };
        }
    });

    // Calculate streaks from member-specific logs
    const streaks = calculateMemberStreaks([{ member_name: memberName, logs: memberLogs }], [{ member_name: memberName }]);
    const memberStreak = streaks[memberName] || { currentStreak: 0, longestStreak: 0 };

    return {
        mtdWorkoutDays,
        mtdWorkoutMinutes,
        ptdWorkoutDays,
        ptdWorkoutMinutes,
        ptdCompletionPercentage,
        favoriteWorkout,
        currentStreak: memberStreak.currentStreak,
        longestStreak: memberStreak.longestStreak
    };
};

/**
 * Calculate overall statistics for admin view using UTC for current month and previous month comparisons
 */
export const calculateOverallStats = (workoutLogs, members) => {
    if (!workoutLogs.length || !members.length) return {};

    const today = getUTCToday();
    const currentMonth = today.getUTCMonth();
    const currentYear = today.getUTCFullYear();

    // Calculate MTD stats for current month using UTC
    const mtdLogs = workoutLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate.getUTCMonth() === currentMonth && logDate.getUTCFullYear() === currentYear;
    });
    const uniqueMembersMtd = new Set(mtdLogs.map(log => log.member_name)).size;
    const participationRateMtd = Math.round((uniqueMembersMtd / members.length) * 100);

    // **Total Workouts** for current month
    const totalWorkoutsMtd = mtdLogs.length;

    // **Total Duration** (in minutes) for current month
    const totalDurationMtd = mtdLogs.reduce((sum, log) => sum + log.duration, 0);

    // Calculate previous month's logs
    let prevMonth, prevMonthYear;
    if (currentMonth === 0) {
        prevMonth = 11; // December
        prevMonthYear = currentYear - 1;
    } else {
        prevMonth = currentMonth - 1;
        prevMonthYear = currentYear;
    }

    const prevMonthLogs = workoutLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate.getUTCMonth() === prevMonth && logDate.getUTCFullYear() === prevMonthYear;
    });

    // **Previous month** stats
    const uniqueMembersPrev = new Set(prevMonthLogs.map(log => log.member_name)).size;
    const participationRatePrev = Math.round((uniqueMembersPrev / members.length) * 100);
    const totalWorkoutsPrev = prevMonthLogs.length;
    const totalDurationPrev = prevMonthLogs.reduce((sum, log) => sum + log.duration, 0);

    // **Trends**: differences or % changes from last month
    const participationTrend = participationRateMtd - participationRatePrev;
    const totalWorkoutsTrend = totalWorkoutsPrev > 0
        ? Math.round(((totalWorkoutsMtd - totalWorkoutsPrev) / totalWorkoutsPrev) * 100)
        : (totalWorkoutsMtd > 0 ? 100 : 0);

    // For total duration, do a % difference as well
    const totalDurationTrend = totalDurationPrev > 0
        ? Math.round(((totalDurationMtd - totalDurationPrev) / totalDurationPrev) * 100)
        : (totalDurationMtd > 0 ? 100 : 0);

    // Average workouts per active member
    const workoutsPerMemberMtd = uniqueMembersMtd > 0 ? Math.round(totalWorkoutsMtd / uniqueMembersMtd * 10) / 10 : 0;

    // Average duration per workout (in minutes)
    const avgDurationMtd = totalWorkoutsMtd > 0 ? Math.round(totalDurationMtd / totalWorkoutsMtd) : 0;

    // Compute previous month's average duration:
    const prevMonthAvgDuration = totalWorkoutsPrev > 0 ? Math.round(totalDurationPrev / totalWorkoutsPrev) : 0;

    // Calculate the trend as a % difference from last month:
    const avgDurationTrend = prevMonthAvgDuration > 0 ? Math.round(((avgDurationMtd - prevMonthAvgDuration) / prevMonthAvgDuration) * 100) : (avgDurationMtd > 0 ? 100 : 0);

    // Program to date stats
    const ptdLogs = workoutLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= PROGRAM_START_DATE;
    });

    const uniqueMembersPtd = new Set(ptdLogs.map(log => log.member_name)).size;
    const participationRatePtd = Math.round((uniqueMembersPtd / members.length) * 100);
    const totalWorkoutsPtd = ptdLogs.length;
    const totalDurationPtd = ptdLogs.reduce((sum, log) => sum + log.duration, 0);

    // Most popular workout type
    const workoutCounts = {};
    workoutLogs.forEach(log => {
        workoutCounts[log.workout_name] = (workoutCounts[log.workout_name] || 0) + 1;
    });

    let mostPopularWorkout = { name: 'None', count: 0 };
    Object.keys(workoutCounts).forEach(workout => {
        if (workoutCounts[workout] > mostPopularWorkout.count) {
            mostPopularWorkout = { name: workout, count: workoutCounts[workout] };
        }
    });

    // Get top performers based on workout frequency
    const memberWorkoutCounts = {};
    workoutLogs.forEach(log => {
        memberWorkoutCounts[log.member_name] = (memberWorkoutCounts[log.member_name] || 0) + 1;
    });

    const topPerformers = Object.keys(memberWorkoutCounts)
        .map(member => ({ name: member, count: memberWorkoutCounts[member] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return {
        mtd: {
            uniqueMembers: uniqueMembersMtd,
            participationRate: participationRateMtd,
            totalWorkouts: totalWorkoutsMtd,
            totalDuration: totalDurationMtd,  // total minutes
            workoutsPerMember: workoutsPerMemberMtd,
            avgDuration: avgDurationMtd,
            avgDurationTrend,
            trend: participationTrend,            // MTD participation trend
            totalWorkoutsTrend,                   // MTD total workouts trend
            totalDurationTrend                    // MTD total duration trend
        },
        ptd: {
            uniqueMembers: uniqueMembersPtd,
            participationRate: participationRatePtd,
            totalWorkouts: totalWorkoutsPtd,
            totalDuration: totalDurationPtd
        },
        mostPopularWorkout,
        topPerformers
    };
};
