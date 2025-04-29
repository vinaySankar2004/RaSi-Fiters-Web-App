import React from "react";
import {
    Box,
    Grid,
    Typography,
    Avatar,
    useTheme,
    Paper,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    alpha
} from "@mui/material";
import {
    Assessment,
    Timeline,
    Group,
    EmojiEvents,
    DirectionsRun,
    Whatshot,
    CalendarMonth,
    WorkspacePremium
} from "@mui/icons-material";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { calculateMemberMtdParticipation } from "../../utils/analyticsUtils";
import { StatCard, ChartCard, RadialProgressOld, LoadingPlaceholder } from "./AnalyticsComponents";
import { calculateOverallStats, calculateProgramProgress } from "../../utils/analyticsUtils";

const OverviewDashboard = ({ workoutLogs, members, workouts, timeRange, selectedMember, isAdmin, memberName, loading }) => {
    const theme = useTheme();
    const chartColors = theme.palette.chart.colors;

    // Calculate overall statistics (for both admin and non-admin, logs are pre-filtered if needed)
    const overallStats = members.length > 0 && workoutLogs.length > 0
        ? calculateOverallStats(workoutLogs, members)
        : {};

    // Calculate program progress
    const programProgress = calculateProgramProgress();

    // Process data for charts
    const workoutTypeData = processWorkoutTypeData(workoutLogs, workouts);
    const memberActivityData = processMemberActivityData(workoutLogs, members);
    const timelineData = processTimelineData(workoutLogs, timeRange);
    const dayOfWeekData = processDayOfWeekData(workoutLogs);
    const memberParticipation = !isAdmin ? calculateMemberMtdParticipation(workoutLogs, memberName) : null;

    if (loading) {
        return (
            <Box sx={{ py: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <LoadingPlaceholder height={300} />
                    </Grid>
                </Grid>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 2 }}>
            {/* Program Progress Banner */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            background: 'linear-gradient(90deg, rgba(30,30,30,0.8) 0%, rgba(30,30,30,0.6) 100%)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(45deg, rgba(255,184,0,0.05) 0%, transparent 70%)',
                                zIndex: 0
                            }
                        }}
                    >
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Grid container spacing={3} alignItems="center">
                                <Grid item xs={12} md={8}>
                                    <Box>
                                        <Typography variant="h5" sx={{ color: '#ffb800', fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center' }}>
                                            <WorkspacePremium sx={{ mr: 1 }} /> Program Progress
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                                            Track your fitness journey progress from {new Date('2025-03-02').toLocaleDateString()} to {new Date('2026-01-01').toLocaleDateString()}
                                        </Typography>

                                        <Box sx={{ mb: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    {programProgress.elapsedProgramDays} days completed
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    {programProgress.progressPercentage}%
                                                </Typography>
                                            </Box>
                                            <Box sx={{ width: '100%', height: '8px', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                                                <Box
                                                    sx={{
                                                        width: `${programProgress.progressPercentage}%`,
                                                        height: '100%',
                                                        background: 'linear-gradient(90deg, #ffb800 0%, #ff9d00 100%)',
                                                        borderRadius: '4px',
                                                        transition: 'width 1s ease-in-out'
                                                    }}
                                                />
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                                <CalendarMonth sx={{ color: '#ffb800', mr: 1 }} />
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        Total Days
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {programProgress.totalProgramDays}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                                <Whatshot sx={{ color: '#ff9d00', mr: 1 }} />
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        Elapsed Days
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {programProgress.elapsedProgramDays}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                                <Timeline sx={{ color: '#4a148c', mr: 1 }} />
                                                <Box>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        Remaining Days
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {programProgress.remainingProgramDays}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <RadialProgressOld
                                        value={programProgress.elapsedProgramDays}
                                        maxValue={programProgress.totalProgramDays}
                                        size={180}
                                        strokeWidth={10}
                                        color="#ffb800"
                                        label="Program Completion"
                                        subtitle={`${programProgress.elapsedProgramDays} of ${programProgress.totalProgramDays} days`}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Summary Stats Row */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    {isAdmin ? (
                        <StatCard
                            title="MTD Participation"
                            value={`${overallStats?.mtd?.participationRate || 0}%`}
                            subtitle="of members active vs. prior MTD"
                            icon={<Group />}
                            trend={overallStats?.mtd?.trend || 0}
                        />
                    ) : (
                        <StatCard
                            title="MTD Participation"
                            value={`${memberParticipation.participationRate}%`}
                            subtitle="of active days vs. prior MTD"
                            icon={<Group />}
                            trend={memberParticipation.trend}
                        />
                    )}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Workouts"
                        value={overallStats?.mtd?.totalWorkouts || 0}
                        subtitle="of workouts vs. prior MTD"
                        icon={<DirectionsRun />}
                        trend={overallStats?.mtd?.totalWorkoutsTrend || 0}
                        color="#4a148c"
                        bgColor="rgba(74,20,140,0.15)"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Duration"
                        // Convert minutes to hours for display
                        value={`${Math.round((overallStats?.mtd?.totalDuration || 0) / 60)} hrs`}
                        subtitle="of exercise vs. prior MTD"
                        icon={<Timeline />}
                        // Use the new totalDurationTrend field
                        trend={overallStats?.mtd?.totalDurationTrend || 0}
                        color="#ff5252"
                        bgColor="rgba(255,82,82,0.15)"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Avg. Workout Duration"
                        value={`${overallStats?.mtd?.avgDuration || 0} mins`}
                        subtitle="per session vs. prior MTD"
                        icon={<Assessment />}
                        trend={overallStats?.mtd?.avgDurationTrend || 0}
                        color="#4caf50"
                        bgColor="rgba(76,175,80,0.15)"
                    />
                </Grid>
            </Grid>

            {/* Charts Row */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={8}>
                    <ChartCard
                        title="Workout Activity Timeline"
                        chart={
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={timelineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="label" stroke="rgba(255,255,255,0.7)" />
                                    <YAxis stroke="rgba(255,255,255,0.7)" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(30,30,30,0.8)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Line type="monotone" dataKey="workoutCount" stroke="#ffb800" strokeWidth={2} activeDot={{ r: 6 }} name="Workouts" />
                                    <Line type="monotone" dataKey="uniqueMembers" stroke="#4a148c" strokeWidth={2} activeDot={{ r: 6 }} name="Active Members" />
                                </LineChart>
                            </ResponsiveContainer>
                        }
                        info="Visualizes workout frequency and member participation over time"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <ChartCard
                        title="Workout Distribution by Day"
                        chart={
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={dayOfWeekData} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis type="number" stroke="rgba(255,255,255,0.7)" tick={{ fill: '#fff' }} />
                                    <YAxis dataKey="day" type="category" stroke="rgba(255,255,255,0.7)" width={80} tick={{ fill: '#fff' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" name="Workouts" radius={[0, 4, 4, 0]}>
                                        {dayOfWeekData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        }
                        info="Shows which days are most popular for workouts"
                    />
                </Grid>
            </Grid>

            {/* Top Performers and Workouts Row */}
            <Grid container spacing={3}>
                {isAdmin && (
                    <Grid item xs={12} md={6}>
                        <Paper
                            elevation={0}
                            sx={{
                                height: '100%',
                                background: 'rgba(30,30,30,0.6)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                overflow: 'hidden'
                            }}
                        >
                            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center' }}>
                                <EmojiEvents sx={{ color: '#ffb800', mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Top Performers
                                </Typography>
                            </Box>
                            <List sx={{ p: 0 }}>
                                {memberActivityData.slice(0, 5).map((member, index) => (
                                    <ListItem key={member.name} divider={index < 4} sx={{ px: 3, py: 1.5 }}>
                                        <ListItemAvatar>
                                            <Avatar
                                                sx={{
                                                    bgcolor: alpha(chartColors[index % chartColors.length], 0.2),
                                                    color: chartColors[index % chartColors.length],
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {member.name.charAt(0).toUpperCase()}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {member.name}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#ffb800', fontWeight: 600 }}>
                                                        {member.workoutCount} workouts
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.05)', px: 1, py: 0.25, borderRadius: '4px' }}>
                                                        {member.activeDays} active days
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.05)', px: 1, py: 0.25, borderRadius: '4px' }}>
                                                        {member.averageDuration} mins avg
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>
                )}

                <Grid item xs={12} md={isAdmin ? 6 : 12}>
                    <Paper
                        elevation={0}
                        sx={{
                            height: '100%',
                            background: 'rgba(30,30,30,0.6)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center' }}>
                            <DirectionsRun sx={{ color: '#ffb800', mr: 1 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Top Workout Types
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
                            <Box sx={{ flex: 1, pt: 2, pl: 2 }}>
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={workoutTypeData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="count"
                                            animationDuration={1000}
                                        >
                                            {workoutTypeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(30,30,30,0.9)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px'
                                            }}
                                            formatter={(value, name, props) => [`${value} workouts`, props.payload.name]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>

                            <Box sx={{ flex: 1, maxHeight: 400, overflowY: 'auto', '&::-webkit-scrollbar': { width: '4px' } }}>
                                <List sx={{ py: 0 }}>
                                    {workoutTypeData.map((workout, index) => (
                                        <ListItem key={workout.name} divider={index < workoutTypeData.length - 1} sx={{ py: 1.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                <Box
                                                    sx={{
                                                        width: 12,
                                                        height: 12,
                                                        borderRadius: '4px',
                                                        bgcolor: chartColors[index % chartColors.length],
                                                        mr: 1.5
                                                    }}
                                                />
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {workout.name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        {workout.count} workouts • {workout.avgDuration} mins avg
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

// Helper functions for data processing
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) {
        return null;
    }

    // We assume there's only one dataKey, e.g. "count"
    // If you have multiple dataKeys, you'd map over payload instead
    const item = payload[0];
    const value = item.value;  // e.g. 41
    // const name = item.name;    // e.g. "count" or "Workouts"

    return (
        <div style={{
            backgroundColor: 'rgba(30,30,30,0.8)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '8px',
            color: '#fff'
        }}>
            {/* The 'label' is typically your Y-axis label (like 'Monday') */}
            <p style={{ margin: 0 }}>{label}</p>
            {/* Show your item with the text "Workouts: #", all in white */}
            <p style={{ margin: 0 }}>
                Workouts: {value}
            </p>
        </div>
    );
};


const processWorkoutTypeData = (logs, workouts) => {
    if (!logs || !logs.length) return [];

    const workoutTypeCounts = {};
    const workoutDurations = {};

    logs.forEach(log => {
        if (!workoutTypeCounts[log.workout_name]) {
            workoutTypeCounts[log.workout_name] = 0;
            workoutDurations[log.workout_name] = 0;
        }
        workoutTypeCounts[log.workout_name]++;
        workoutDurations[log.workout_name] += log.duration;
    });

    return Object.keys(workoutTypeCounts)
        .map(name => ({
            name,
            count: workoutTypeCounts[name],
            avgDuration: Math.round(workoutDurations[name] / workoutTypeCounts[name])
        }))
        .sort((a, b) => b.count - a.count);
};

const processMemberActivityData = (logs, members) => {
    if (!logs || !logs.length || !members || !members.length) return [];

    const memberData = {};

    logs.forEach(log => {
        if (!memberData[log.member_name]) {
            memberData[log.member_name] = {
                workoutCount: 0,
                totalDuration: 0,
                dates: new Set()
            };
        }
        memberData[log.member_name].workoutCount++;
        memberData[log.member_name].totalDuration += log.duration;
        memberData[log.member_name].dates.add(log.date);
    });

    return Object.keys(memberData)
        .map(name => ({
            name,
            workoutCount: memberData[name].workoutCount,
            activeDays: memberData[name].dates.size,
            averageDuration: Math.round(memberData[name].totalDuration / memberData[name].workoutCount)
        }))
        .sort((a, b) => {
            // First compare by top active days
            if (b.activeDays !== a.activeDays) {
                return b.activeDays - a.activeDays;
            }
            // If active days are equal, compare by top total workout duration
            return b.totalDuration - a.totalDuration;
        });
};

const processTimelineData = (logs, timeRange) => {
    if (!logs || !logs.length) return [];

    const now = new Date();
    const data = [];

    // In processTimelineData (the 'month' case):
    if (timeRange === 'month') {
        // For month view, show last 30 days *in UTC*
        // Create a "today" in UTC
        const nowUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        for (let i = 30; i >= 0; i--) {
            // Copy the UTC "today" and subtract i days using setUTCDate
            const date = new Date(nowUtc);
            date.setUTCDate(date.getUTCDate() - i);

            // Format as ISO YYYY-MM-DD
            const formattedDate = date.toISOString().split('T')[0];

            // Use getUTCDate() for your label
            const dayLabel = date.getUTCDate().toString();

            // Filter logs, etc...
            const dayLogs = logs.filter(log => log.date === formattedDate);
            const uniqueMembers = new Set(dayLogs.map(log => log.member_name)).size;

            data.push({
                date: formattedDate,
                label: dayLabel,              // changed from date.getDate() to date.getUTCDate()
                workoutCount: dayLogs.length,
                uniqueMembers
            });
        }
    } else if (timeRange === 'quarter') {
        // For quarter view, aggregate by week
        const weeks = 12; // ~3 months
        for (let i = weeks; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - (i * 7));
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            const weekStartStr = weekStart.toISOString().split('T')[0];
            const weekEndStr = weekEnd.toISOString().split('T')[0];

            const weekLogs = logs.filter(log => {
                const logDate = log.date;
                return logDate >= weekStartStr && logDate <= weekEndStr;
            });

            const uniqueMembers = new Set(weekLogs.map(log => log.member_name)).size;

            data.push({
                date: weekStartStr,
                label: `W${weeks - i + 1}`,
                workoutCount: weekLogs.length,
                uniqueMembers
            });
        }
    } else {
        // For year view, aggregate by month
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let i = 0; i < 12; i++) {
            const monthDate = new Date(now.getFullYear(), i, 1);
            const monthYear = monthDate.getFullYear();
            const month = monthDate.getMonth();

            const monthLogs = logs.filter(log => {
                const logDate = new Date(log.date);
                return logDate.getFullYear() === monthYear && logDate.getMonth() === month;
            });

            const uniqueMembers = new Set(monthLogs.map(log => log.member_name)).size;

            data.push({
                date: monthDate.toISOString().split('T')[0],
                label: monthNames[i],
                workoutCount: monthLogs.length,
                uniqueMembers
            });
        }
    }

    return data;
};

const processDayOfWeekData = (logs) => {
    if (!logs || !logs.length) return [];

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = days.map(day => ({ day, count: 0 }));

    logs.forEach(log => {
        const dayOfWeek = new Date(log.date).getUTCDay();
        dayCounts[dayOfWeek].count++;
    });

    return dayCounts;
};

export default OverviewDashboard;
