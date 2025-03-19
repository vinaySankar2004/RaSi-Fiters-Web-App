import React, { useState } from "react";
import {
    Box,
    Grid,
    Typography,
    Avatar,
    Paper,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Tabs,
    Tab,
    Chip,
    useTheme,
    Divider,
    alpha,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import {
    Whatshot,
    EmojiEvents,
    CalendarMonth,
    Timer,
    DirectionsRun,
    CompareArrows,
    Leaderboard
} from "@mui/icons-material";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Cell,
    PieChart,
    Pie,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    LineChart,
    Line,
    CartesianGrid
} from "recharts";

import { ChartCard, RadialProgress, LoadingPlaceholder } from "./AnalyticsComponents";
import { calculateMemberStats, calculateMemberStreaks } from "../../utils/analyticsUtils";

const MemberDashboard = ({ workoutLogs, members, workouts, timeRange, selectedMember, isAdmin, memberName, loading }) => {
    const theme = useTheme();
    const chartColors = theme.palette.chart.colors;
    const [comparisonView, setComparisonView] = useState(0);

    // Determine effective member name based on role and selection
    const effectiveMemberName = isAdmin && selectedMember !== 'all' ? selectedMember : memberName;

    // Calculate member-specific statistics
    const memberStats = effectiveMemberName
        ? calculateMemberStats(workoutLogs, effectiveMemberName)
        : {};

    // Calculate streaks for all members
    const streaks = calculateMemberStreaks(workoutLogs, members);

    // Process data for visualizations
    const memberWorkoutData = processMemberWorkoutData(workoutLogs, effectiveMemberName);
    const memberWorkoutTypes = processMemberWorkoutTypes(workoutLogs, effectiveMemberName);
    const memberComparisonData = processMemberComparisonData(workoutLogs, members);
    const memberWorkoutHistory = processMemberWorkoutHistory(workoutLogs, effectiveMemberName, timeRange);

    // Handle loading state
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

    // Render admin view (member comparison) if admin and no specific member selected
    if (isAdmin && selectedMember === 'all') {
        return (
            <Box sx={{ py: 2 }}>
                <Box sx={{ mb: 3 }}>
                    <Tabs
                        value={comparisonView}
                        onChange={(e, val) => setComparisonView(val)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            mb: 2,
                            '& .MuiTab-root': {
                                minWidth: 'auto',
                                px: 3,
                                borderRadius: '50px',
                                mr: 1,
                                color: 'text.secondary',
                                '&.Mui-selected': {
                                    color: '#111',
                                    bgcolor: '#ffb800',
                                }
                            }
                        }}
                    >
                        <Tab label="Workout Frequency" icon={<DirectionsRun />} iconPosition="start" />
                        <Tab label="Workout Duration" icon={<Timer />} iconPosition="start" />
                        <Tab label="Streaks" icon={<Whatshot />} iconPosition="start" />
                        <Tab label="Activity Radar" icon={<CompareArrows />} iconPosition="start" />
                    </Tabs>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        {comparisonView === 0 && (
                            <ChartCard
                                minHeight={500}
                                title="Workout Frequency by Member"
                                chart={
                                    <ResponsiveContainer width="100%" height={450}>
                                        <BarChart
                                            data={memberComparisonData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                            <XAxis
                                                dataKey="name"
                                                stroke="rgba(255,255,255,0.7)"
                                                angle={-45}
                                                textAnchor="end"
                                                height={100}
                                            />
                                            <YAxis stroke="rgba(255,255,255,0.7)" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(30,30,30,0.8)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <Bar dataKey="workoutCount" name="Workouts" fill="#ffb800" radius={[4, 4, 0, 0]}>
                                                {memberComparisonData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                }
                                info="Compares the number of workouts logged by each member"
                            />
                        )}

                        {comparisonView === 1 && (
                            <ChartCard
                                minHeight={500}
                                title="Workout Duration by Member"
                                chart={
                                    <ResponsiveContainer width="100%" height={450}>
                                        <BarChart
                                            data={memberComparisonData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                            <XAxis
                                                dataKey="name"
                                                stroke="rgba(255,255,255,0.7)"
                                                angle={-45}
                                                textAnchor="end"
                                                height={100}
                                            />
                                            <YAxis stroke="rgba(255,255,255,0.7)" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(30,30,30,0.8)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <Bar dataKey="totalDuration" name="Total Minutes" fill="#4a148c" radius={[4, 4, 0, 0]}/>
                                            <Bar dataKey="averageDuration" name="Avg. Minutes" fill="#ff5252" radius={[4, 4, 0, 0]}/>
                                        </BarChart>
                                    </ResponsiveContainer>
                                }
                                info="Compares the total and average workout duration for each member"
                            />
                        )}

                        {comparisonView === 2 && (
                            <ChartCard
                                minHeight={500}
                                title="Workout Streaks by Member"
                                chart={
                                    <ResponsiveContainer width="100%" height={450}>
                                        <BarChart
                                            data={Object.keys(streaks).map(name => ({
                                                name,
                                                currentStreak: streaks[name].currentStreak,
                                                longestStreak: streaks[name].longestStreak
                                            }))}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                            <XAxis
                                                dataKey="name"
                                                stroke="rgba(255,255,255,0.7)"
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                            />
                                            <YAxis stroke="rgba(255,255,255,0.7)" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(30,30,30,0.8)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <Bar dataKey="currentStreak" name="Current Streak" fill="#ffb800" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="longestStreak" name="Longest Streak" fill="#ff5252" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                }
                                info="Compares current and all-time workout streaks for each member"
                            />
                        )}

                        {comparisonView === 3 && (
                            <ChartCard
                                minHeight={500}
                                title="Member Activity Radar Comparison"
                                chart={
                                    <ResponsiveContainer width="100%" height={450}>
                                        <RadarChart outerRadius={150} data={[
                                            { subject: 'Workout Count', fullMark: 100 },
                                            { subject: 'Avg. Duration', fullMark: 100 },
                                            { subject: 'Active Days', fullMark: 100 },
                                            { subject: 'Workout Types', fullMark: 100 },
                                            { subject: 'Current Streak', fullMark: 100 }
                                        ]}>
                                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                            <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.7)" />
                                            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="rgba(255,255,255,0.3)" />

                                            {memberComparisonData.slice(0, 5).map((member, index) => {
                                                // Normalize values for radar chart (0-100 scale)
                                                const maxWorkoutCount = Math.max(...memberComparisonData.map(m => m.workoutCount));
                                                const maxDuration = Math.max(...memberComparisonData.map(m => m.averageDuration));
                                                const maxActiveDays = Math.max(...memberComparisonData.map(m => m.activeDays));
                                                const maxTypes = Math.max(...memberComparisonData.map(m => m.uniqueWorkoutTypes));
                                                const maxStreak = Math.max(...Object.values(streaks).map(s => s.currentStreak));

                                                return (
                                                    <Radar
                                                        key={member.name}
                                                        name={member.name}
                                                        dataKey={(point) => {
                                                            if (point.subject === 'Workout Count')
                                                                return (member.workoutCount / maxWorkoutCount) * 100 || 0;
                                                            if (point.subject === 'Avg. Duration')
                                                                return (member.averageDuration / maxDuration) * 100 || 0;
                                                            if (point.subject === 'Active Days')
                                                                return (member.activeDays / maxActiveDays) * 100 || 0;
                                                            if (point.subject === 'Workout Types')
                                                                return (member.uniqueWorkoutTypes / maxTypes) * 100 || 0;
                                                            if (point.subject === 'Current Streak')
                                                                return (streaks[member.name]?.currentStreak / maxStreak) * 100 || 0;
                                                            return 0;
                                                        }}
                                                        stroke={chartColors[index % chartColors.length]}
                                                        fill={chartColors[index % chartColors.length]}
                                                        fillOpacity={0.1}
                                                    />
                                                );
                                            })}
                                            <Legend />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(30,30,30,0.8)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '8px'
                                                }}
                                                formatter={(value, name, props) => {
                                                    const subject = props.payload.subject;
                                                    const member = memberComparisonData.find(m => m.name === name);

                                                    if (subject === 'Workout Count')
                                                        return [member.workoutCount, `${name} - Workouts`];
                                                    if (subject === 'Avg. Duration')
                                                        return [member.averageDuration, `${name} - Avg Mins`];
                                                    if (subject === 'Active Days')
                                                        return [member.activeDays, `${name} - Active Days`];
                                                    if (subject === 'Workout Types')
                                                        return [member.uniqueWorkoutTypes, `${name} - Workout Types`];
                                                    if (subject === 'Current Streak')
                                                        return [streaks[name]?.currentStreak, `${name} - Current Streak`];
                                                    return [value, name];
                                                }}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                }
                                info="Multi-dimensional comparison of member activity across different metrics"
                            />
                        )}
                    </Grid>

                    <Grid item xs={12}>
                        <Paper
                            elevation={0}
                            sx={{
                                background: 'rgba(30,30,30,0.6)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                overflow: 'hidden'
                            }}
                        >
                            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center' }}>
                                <Leaderboard sx={{ color: '#ffb800', mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Member Performance Metrics
                                </Typography>
                            </Box>

                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ background: 'rgba(0,0,0,0.1)' }}>
                                            <TableCell sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Member</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Workouts</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Total Duration</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Avg. Duration</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Active Days</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Workout Types</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Current Streak</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Longest Streak</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {memberComparisonData.map((member, index) => (
                                            <TableRow key={member.name} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Avatar
                                                            sx={{
                                                                width: 32,
                                                                height: 32,
                                                                bgcolor: alpha(chartColors[index % chartColors.length], 0.2),
                                                                color: chartColors[index % chartColors.length],
                                                                mr: 1,
                                                                fontSize: '0.875rem',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            {member.name.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {member.name}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">{member.workoutCount}</TableCell>
                                                <TableCell align="center">{member.totalDuration} mins</TableCell>
                                                <TableCell align="center">{member.averageDuration} mins</TableCell>
                                                <TableCell align="center">{member.activeDays}</TableCell>
                                                <TableCell align="center">{member.uniqueWorkoutTypes}</TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        size="small"
                                                        icon={<Whatshot />}
                                                        label={streaks[member.name]?.currentStreak || 0}
                                                        sx={{
                                                            bgcolor: alpha('#ffb800', 0.1),
                                                            color: '#ffb800',
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        size="small"
                                                        icon={<EmojiEvents />}
                                                        label={streaks[member.name]?.longestStreak || 0}
                                                        sx={{
                                                            bgcolor: alpha('#ff5252', 0.1),
                                                            color: '#ff5252',
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    // Render individual member view
    return (
        <Box sx={{ py: 2 }}>
            {/* Member Profile Header */}
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
                                <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Avatar
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                bgcolor: alpha('#ffb800', 0.2),
                                                color: '#ffb800',
                                                fontSize: '2.5rem',
                                                fontWeight: 'bold',
                                                mb: 2,
                                                border: '2px solid rgba(255,184,0,0.3)'
                                            }}
                                        >
                                            {effectiveMemberName?.charAt(0).toUpperCase() || 'M'}
                                        </Avatar>

                                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                            {effectiveMemberName || 'Member'}
                                        </Typography>

                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                                            <Chip
                                                icon={<Whatshot />}
                                                label={`Streak: ${streaks[effectiveMemberName]?.currentStreak || 0} days`}
                                                sx={{
                                                    bgcolor: alpha('#ffb800', 0.1),
                                                    color: '#ffb800',
                                                    fontWeight: 'bold'
                                                }}
                                            />

                                            <Chip
                                                icon={<DirectionsRun />}
                                                label={`${memberWorkoutData.totalWorkouts} workouts`}
                                                sx={{
                                                    bgcolor: alpha('#4a148c', 0.1),
                                                    color: '#9c27b0',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={8}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6} sm={3}>
                                            <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(0,0,0,0.15)', borderRadius: '10px' }}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                                    MTD Workouts
                                                </Typography>
                                                <Typography variant="h5" sx={{ color: '#ffb800', fontWeight: 700 }}>
                                                    {memberStats.mtdWorkoutDays || 0}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    days with activity
                                                </Typography>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={6} sm={3}>
                                            <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(0,0,0,0.15)', borderRadius: '10px' }}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                                    PTD %
                                                </Typography>
                                                <Typography variant="h5" sx={{ color: '#4a148c', fontWeight: 700 }}>
                                                    {memberStats.ptdCompletionPercentage || 0}%
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    of PTD completed
                                                </Typography>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={6} sm={3}>
                                            <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(0,0,0,0.15)', borderRadius: '10px' }}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                                    Total Time
                                                </Typography>
                                                <Typography variant="h5" sx={{ color: '#ff5252', fontWeight: 700 }}>
                                                    {Math.round((memberStats.ptdWorkoutMinutes || 0) / 60)}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    hours of workouts
                                                </Typography>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={6} sm={3}>
                                            <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(0,0,0,0.15)', borderRadius: '10px' }}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                                    Favorite
                                                </Typography>
                                                <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 700, fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {memberStats.favoriteWorkout?.name || 'N/A'}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    most frequent workout
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Program Progress</span>
                                            <span>{memberStats.ptdWorkoutDays || 0} / {memberStats.ptdCompletionPercentage ? Math.round((memberStats.ptdWorkoutDays / (memberStats.ptdCompletionPercentage / 100))) : '?'} days</span>
                                        </Typography>
                                        <LinearProgress
                                            variant="determinate"
                                            value={memberStats.ptdCompletionPercentage || 0}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                bgcolor: 'rgba(255,255,255,0.1)',
                                                '& .MuiLinearProgress-bar': {
                                                    borderRadius: 4,
                                                    background: 'linear-gradient(90deg, #ffb800 0%, #ff9d00 100%)'
                                                }
                                            }}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Workout History and Stats */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <ChartCard
                        title="Workout History"
                        chart={
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={memberWorkoutHistory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                                    <Line type="monotone" dataKey="duration" stroke="#ffb800" name="Duration (mins)" />
                                </LineChart>
                            </ResponsiveContainer>
                        }
                        info="Workout duration history over time"
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <ChartCard
                        title="Workout Type Distribution"
                        chart={
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={memberWorkoutTypes}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                        animationDuration={1000}
                                    >
                                        {memberWorkoutTypes.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={renderCustomPieTooltip} />
                                </PieChart>
                            </ResponsiveContainer>
                        }
                        info="Distribution of workout types"
                    />
                </Grid>

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
                            <Whatshot sx={{ color: '#ffb800', mr: 1 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Streak Stats
                            </Typography>
                        </Box>

                        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    Current Streak
                                </Typography>
                                <Box sx={{ position: 'relative' }}>
                                    <RadialProgress
                                        value={streaks[effectiveMemberName]?.currentStreak || 0}
                                        maxValue={Math.max(7, streaks[effectiveMemberName]?.longestStreak || 0)}
                                        size={140}
                                        strokeWidth={10}
                                        color="#ffb800"
                                        label="days"
                                    />
                                    {streaks[effectiveMemberName]?.currentStreak > 0 && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: -10,
                                                right: -10,
                                                bgcolor: '#ffb800',
                                                color: '#111',
                                                borderRadius: '50%',
                                                width: 36,
                                                height: 36,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 'bold',
                                                fontSize: '1.25rem',
                                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                                            }}
                                        >
                                            🔥
                                        </Box>
                                    )}
                                </Box>
                            </Box>

                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    Longest Streak
                                </Typography>
                                <Box sx={{ position: 'relative' }}>
                                    <RadialProgress
                                        value={streaks[effectiveMemberName]?.longestStreak || 0}
                                        maxValue={Math.max(10, streaks[effectiveMemberName]?.longestStreak || 0)}
                                        size={140}
                                        strokeWidth={10}
                                        color="#ff5252"
                                        label="days"
                                    />
                                    {streaks[effectiveMemberName]?.longestStreak >= 7 && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: -10,
                                                right: -10,
                                                bgcolor: '#ff5252',
                                                color: '#fff',
                                                borderRadius: '50%',
                                                width: 36,
                                                height: 36,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 'bold',
                                                fontSize: '1.25rem',
                                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                                            }}
                                        >
                                            🏆
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.05)' }} />

                        <Box sx={{ px: 3, pb: 3 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                                Streak Milestones
                            </Typography>

                            <Grid container spacing={2}>
                                {[3, 7, 14, 30, 60, 90].map(days => {
                                    const isAchieved = (streaks[effectiveMemberName]?.longestStreak || 0) >= days;
                                    const isInProgress = !isAchieved && (streaks[effectiveMemberName]?.currentStreak || 0) > 0;

                                    return (
                                        <Grid item xs={4} sm={2} key={days}>
                                            <Box
                                                sx={{
                                                    textAlign: 'center',
                                                    p: 1,
                                                    borderRadius: '8px',
                                                    bgcolor: isAchieved ? alpha('#ffb800', 0.15) : 'rgba(255,255,255,0.03)',
                                                    border: `1px solid ${isAchieved ? '#ffb800' : 'rgba(255,255,255,0.05)'}`,
                                                    opacity: isAchieved ? 1 : 0.7
                                                }}
                                            >
                                                <Typography variant="h6" sx={{ color: isAchieved ? '#ffb800' : 'text.secondary', fontWeight: 700 }}>
                                                    {days}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: isAchieved ? '#ffb800' : 'text.secondary' }}>
                                                    days
                                                </Typography>
                                                {isAchieved && (
                                                    <Box sx={{ mt: 0.5, fontSize: '1.25rem' }}>🏆</Box>
                                                )}
                                                {isInProgress && (
                                                    <Box sx={{ mt: 0.5, fontSize: '1rem' }}>⏳</Box>
                                                )}
                                            </Box>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
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
                            <CalendarMonth sx={{ color: '#ffb800', mr: 1 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Recent Workouts
                            </Typography>
                        </Box>

                        <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 400 }}>
                            {memberWorkoutData.recentWorkouts.length > 0 ? (
                                <List disablePadding>
                                    {memberWorkoutData.recentWorkouts.map((workout, index) => (
                                        <ListItem
                                            key={index}
                                            divider={index < memberWorkoutData.recentWorkouts.length - 1}
                                            sx={{ py: 1.5 }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: alpha(chartColors[index % chartColors.length], 0.2),
                                                        color: chartColors[index % chartColors.length]
                                                    }}
                                                >
                                                    <DirectionsRun />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                        {workout.workout_name}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 0.5, gap: 1 }}>
                                                        <Chip
                                                            size="small"
                                                            icon={<CalendarMonth fontSize="small" />}
                                                            label={new Date(workout.date).toLocaleDateString()}
                                                            sx={{ bgcolor: 'rgba(0,0,0,0.2)', height: 24 }}
                                                        />
                                                        <Chip
                                                            size="small"
                                                            icon={<Timer fontSize="small" />}
                                                            label={`${workout.duration} mins`}
                                                            sx={{ bgcolor: 'rgba(0,0,0,0.2)', height: 24 }}
                                                        />
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Box sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No recent workouts found.
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

// Helper functions for data processing

const processMemberWorkoutData = (logs, memberName) => {
    if (!logs || !logs.length || !memberName) {
        return { totalWorkouts: 0, totalDuration: 0, recentWorkouts: [] };
    }

    const memberLogs = logs.filter(log => log.member_name === memberName);

    // Sort by date (most recent first) for recent workouts
    const sortedLogs = [...memberLogs].sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
        totalWorkouts: memberLogs.length,
        totalDuration: memberLogs.reduce((sum, log) => sum + log.duration, 0),
        recentWorkouts: sortedLogs.slice(0, 10) // Get 10 most recent workouts
    };
};

const processMemberWorkoutTypes = (logs, memberName) => {
    if (!logs || !logs.length || !memberName) return [];

    const memberLogs = logs.filter(log => log.member_name === memberName);
    const workoutTypes = {};

    memberLogs.forEach(log => {
        if (!workoutTypes[log.workout_name]) {
            workoutTypes[log.workout_name] = {
                name: log.workout_name,
                count: 0,
                totalDuration: 0
            };
        }
        workoutTypes[log.workout_name].count++;
        workoutTypes[log.workout_name].totalDuration += log.duration;
    });

    return Object.values(workoutTypes)
        .map(type => ({
            ...type,
            avgDuration: Math.round(type.totalDuration / type.count)
        }))
        .sort((a, b) => b.count - a.count);
};

const processMemberComparisonData = (logs, members) => {
    if (!logs || !logs.length || !members || !members.length) return [];

    const memberData = {};

    // Initialize data for all members
    members.forEach(member => {
        memberData[member.member_name] = {
            name: member.member_name,
            workoutCount: 0,
            totalDuration: 0,
            activeDays: new Set(),
            workoutTypes: new Set()
        };
    });

    // Process logs
    logs.forEach(log => {
        if (memberData[log.member_name]) {
            memberData[log.member_name].workoutCount++;
            memberData[log.member_name].totalDuration += log.duration;
            memberData[log.member_name].activeDays.add(log.date);
            memberData[log.member_name].workoutTypes.add(log.workout_name);
        }
    });

    // Convert to array and calculate derived metrics
    return Object.values(memberData)
        .map(member => ({
            name: member.name,
            workoutCount: member.workoutCount,
            totalDuration: member.totalDuration,
            averageDuration: member.workoutCount > 0 ? Math.round(member.totalDuration / member.workoutCount) : 0,
            activeDays: member.activeDays.size,
            uniqueWorkoutTypes: member.workoutTypes.size
        }))
        .sort((a, b) => b.workoutCount - a.workoutCount);
};

// Custom tooltip for the Workout Type Distribution PieChart with white text
const renderCustomPieTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                backgroundColor: 'rgba(30,30,30,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '8px',
                color: '#fff'
                }}>
                <p style={{ margin: 0 }}>{payload[0].payload.name}</p>
                <p style={{ margin: 0 }}>
                {`${payload[0].value} workouts (${Math.round(payload[0].value / payload[0].payload.count * 100)}%)`}
                </p>
                </div>
            );
        }
    return null;
};

const processMemberWorkoutHistory = (logs, memberName, timeRange) => {
    if (!logs || !logs.length || !memberName) return [];

    const memberLogs = logs.filter(log => log.member_name === memberName);
    // Use your existing UTC helper (imported from analyticsUtils), or replicate the logic:
    const now = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
    const timeRangeMap = {
        'month': 30,
        'quarter': 90,
        'year': 365
    };
    const daysToShow = timeRangeMap[timeRange] || 30;

    // Generate dates for the selected time range
    const datePoints = [];
    for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setUTCDate(date.getUTCDate() - i);
        const formattedDate = date.toISOString().split('T')[0];

        const dayLogs = memberLogs.filter(log => log.date === formattedDate);
        const totalDuration = dayLogs.reduce((sum, log) => sum + log.duration, 0);
        const utcDay = date.getUTCDate();
        const label = (timeRange === 'year') ? date.toLocaleString('en-US',
            { month: 'short', day: 'numeric', timeZone: 'UTC' }) : utcDay.toString();
        datePoints.push({
            date: formattedDate,
            label: label,
            duration: totalDuration,
            count: dayLogs.length
        });
    }

    return datePoints;
};

export default MemberDashboard;
