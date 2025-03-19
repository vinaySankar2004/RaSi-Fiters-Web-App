import React, { useState } from "react";
import {
    Box,
    Grid,
    Typography,
    Paper,
    ToggleButtonGroup,
    ToggleButton,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Avatar,
    Divider,
    Chip,
    useTheme,
    alpha, TableContainer, Table
} from "@mui/material";
import {
    Timeline,
    CalendarMonth,
    TrendingUp,
    TrendingDown,
    AccessTime,
    Whatshot,
    CalendarViewWeek,
    DateRange,
    Star,
    Info,
    BarChart,
    ShowChart,
    Insights
} from "@mui/icons-material";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Cell,
    AreaChart,
    Area,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ComposedChart,
    PieChart,
    Pie
} from "recharts";

import { ChartCard, StatCard, LoadingPlaceholder } from "./AnalyticsComponents";

const TrendsDashboard = ({ workoutLogs, members, workouts, timeRange, selectedMember, isAdmin, memberName, loading }) => {
    const theme = useTheme();
    const chartColors = theme.palette.chart.colors;
    const [dataView, setDataView] = useState('activity');

    // Process data for visualizations
    const timeActivityData = processTimeActivityData(workoutLogs, timeRange, selectedMember, isAdmin);
    const dayOfWeekData = processDayOfWeekData(workoutLogs, selectedMember, isAdmin);
    const memberConsistencyData = processMemberConsistencyData(workoutLogs, members, timeRange, selectedMember, isAdmin);
    const workoutTrendData = processWorkoutTrendData(workoutLogs, workouts, timeRange, selectedMember, isAdmin);
    const monthlyComparisonData = processMonthlyComparisonData(workoutLogs, timeRange, selectedMember, isAdmin);

    // Calculate trend metrics for summary cards
    const trendMetrics = calculateTrendMetrics(workoutLogs, timeRange, selectedMember, isAdmin);

    const handleViewChange = (event, newView) => {
        if (newView !== null) {
            setDataView(newView);
        }
    };

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
            {/* Summary Stats */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Average Workouts"
                        value={`${trendMetrics.avgWorkoutsPerPeriod}/period`}
                        subtitle={`Compared to previous ${timeRange}`}
                        icon={<Timeline />}
                        trend={trendMetrics.workoutsTrend}
                        color="#ffb800"
                        bgColor="rgba(255,184,0,0.15)"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Avg. Duration"
                        value={`${trendMetrics.avgDuration} mins`}
                        subtitle={`Per workout session`}
                        icon={<AccessTime />}
                        trend={trendMetrics.durationTrend}
                        color="#4a148c"
                        bgColor="rgba(74,20,140,0.15)"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title={isAdmin ? "Member Participation" : "Workout Consistency"}
                        value={isAdmin ? `${trendMetrics.participationRate}%` : `${trendMetrics.consistencyScore}/10`}
                        subtitle={isAdmin ? "Active members" : "Consistency score"}
                        icon={isAdmin ? <CalendarMonth /> : <Whatshot />}
                        trend={isAdmin ? trendMetrics.participationTrend : null}
                        color="#ff5252"
                        bgColor="rgba(255,82,82,0.15)"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Most Active"
                        value={trendMetrics.mostActivePeriod}
                        subtitle={`Best ${timeRange === 'month' ? 'day' : timeRange === 'quarter' ? 'week' : 'month'}`}
                        icon={<Star />}
                        color="#4caf50"
                        bgColor="rgba(76,175,80,0.15)"
                    />
                </Grid>
            </Grid>

            {/* View Selector */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                <ToggleButtonGroup
                    value={dataView}
                    exclusive
                    onChange={handleViewChange}
                    aria-label="data view"
                    sx={{
                        '& .MuiToggleButton-root': {
                            px: 3,
                            py: 1,
                            color: 'text.secondary',
                            borderColor: 'rgba(255,255,255,0.1)',
                            '&.Mui-selected': {
                                color: '#ffb800',
                                backgroundColor: 'rgba(255,184,0,0.1)',
                                borderColor: 'rgba(255,184,0,0.2)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,184,0,0.15)',
                                }
                            },
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.05)',
                            }
                        }
                    }}
                >
                    <ToggleButton value="activity" aria-label="activity trends">
                        <ShowChart sx={{ mr: 1 }} /> Activity Trends
                    </ToggleButton>
                    <ToggleButton value="day" aria-label="day of week patterns">
                        <CalendarViewWeek sx={{ mr: 1 }} /> Day Patterns
                    </ToggleButton>
                    <ToggleButton value="comparison" aria-label="period comparison">
                        <BarChart sx={{ mr: 1 }} /> Period Comparison
                    </ToggleButton>
                    {isAdmin && (
                        <ToggleButton value="consistency" aria-label="member consistency">
                            <Insights sx={{ mr: 1 }} /> Member Consistency
                        </ToggleButton>
                    )}
                </ToggleButtonGroup>
            </Box>

            {/* Activity Trends View */}
            {dataView === 'activity' && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <ChartCard
                            title="Workout Activity Timeline"
                            chart={
                                <ResponsiveContainer width="100%" height={400}>
                                    <ComposedChart data={timeActivityData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="label" stroke="rgba(255,255,255,0.7)" />
                                        <YAxis yAxisId="left" stroke="rgba(255,255,255,0.7)" />
                                        <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.7)" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(30,30,30,0.8)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend />
                                        <Area
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="workoutCount"
                                            name="Workout Count"
                                            fill={alpha(chartColors[0], 0.3)}
                                            stroke={chartColors[0]}
                                            activeDot={{ r: 6 }}
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="avgDuration"
                                            name="Avg. Duration (mins)"
                                            stroke={chartColors[1]}
                                            strokeWidth={2}
                                            activeDot={{ r: 6 }}
                                        />
                                        {isAdmin && selectedMember === 'all' && (
                                            <Line
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="uniqueMembers"
                                                name="Active Members"
                                                stroke={chartColors[2]}
                                                strokeWidth={2}
                                                activeDot={{ r: 6 }}
                                            />
                                        )}
                                    </ComposedChart>
                                </ResponsiveContainer>
                            }
                            info={`Workout activity over time for the selected ${timeRange}`}
                        />
                    </Grid>

                    <Grid item xs={12} md={7}>
                        <ChartCard
                            title="Workout Type Distribution Over Time"
                            chart={
                                <ResponsiveContainer width="100%" height={400}>
                                    <AreaChart data={workoutTrendData.timeData}>
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
                                        <Legend />
                                        {workoutTrendData.workoutTypes.map((workout, index) => (
                                            <Area
                                                key={workout}
                                                type="monotone"
                                                dataKey={workout}
                                                stackId="1"
                                                stroke={chartColors[index % chartColors.length]}
                                                fill={alpha(chartColors[index % chartColors.length], 0.6)}
                                            />
                                        ))}
                                    </AreaChart>
                                </ResponsiveContainer>
                            }
                            info="Distribution of workout types over time"
                        />
                    </Grid>

                    <Grid item xs={12} md={5}>
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
                            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <TrendingUp sx={{ color: '#ffb800', mr: 1 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Trend Analysis
                                    </Typography>
                                </Box>
                                <Chip
                                    icon={<Info />}
                                    label={`Based on ${timeRange} data`}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}
                                />
                            </Box>

                            <Grid container sx={{ p: 2 }}>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                            Workout Growth
                                        </Typography>
                                        <Box sx={{ width: 100, height: 100, mx: 'auto', position: 'relative' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: 'Growth', value: Math.max(0, trendMetrics.workoutsTrend), color: '#4caf50' },
                                                            { name: 'Decline', value: Math.max(0, -trendMetrics.workoutsTrend), color: '#ff5252' },
                                                            { name: 'Remaining', value: Math.max(0, 100 - Math.abs(trendMetrics.workoutsTrend)), color: 'rgba(255,255,255,0.1)' }
                                                        ]}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={30}
                                                        outerRadius={40}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {[
                                                            { name: 'Growth', value: Math.max(0, trendMetrics.workoutsTrend), color: '#4caf50' },
                                                            { name: 'Decline', value: Math.max(0, -trendMetrics.workoutsTrend), color: '#ff5252' },
                                                            { name: 'Remaining', value: Math.max(0, 100 - Math.abs(trendMetrics.workoutsTrend)), color: 'rgba(255,255,255,0.1)' }
                                                        ].map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: trendMetrics.workoutsTrend >= 0 ? '#4caf50' : '#ff5252' }}>
                                                    {trendMetrics.workoutsTrend > 0 ? '+' : ''}{trendMetrics.workoutsTrend}%
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'text.secondary' }}>
                                            {trendMetrics.workoutsTrend > 0
                                                ? 'Increase in workouts'
                                                : trendMetrics.workoutsTrend < 0
                                                    ? 'Decrease in workouts'
                                                    : 'No change in workouts'}
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ p: 2 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                            Duration Trend
                                        </Typography>
                                        <Box sx={{ width: 100, height: 100, mx: 'auto', position: 'relative' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            { name: 'Growth', value: Math.max(0, trendMetrics.durationTrend), color: '#4a148c' },
                                                            { name: 'Decline', value: Math.max(0, -trendMetrics.durationTrend), color: '#ff5252' },
                                                            { name: 'Remaining', value: Math.max(0, 100 - Math.abs(trendMetrics.durationTrend)), color: 'rgba(255,255,255,0.1)' }
                                                        ]}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={30}
                                                        outerRadius={40}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {[
                                                            { name: 'Growth', value: Math.max(0, trendMetrics.durationTrend), color: '#4a148c' },
                                                            { name: 'Decline', value: Math.max(0, -trendMetrics.durationTrend), color: '#ff5252' },
                                                            { name: 'Remaining', value: Math.max(0, 100 - Math.abs(trendMetrics.durationTrend)), color: 'rgba(255,255,255,0.1)' }
                                                        ].map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: trendMetrics.durationTrend >= 0 ? '#4a148c' : '#ff5252' }}>
                                                    {trendMetrics.durationTrend > 0 ? '+' : ''}{trendMetrics.durationTrend}%
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'text.secondary' }}>
                                            {trendMetrics.durationTrend > 0
                                                ? 'Longer workouts'
                                                : trendMetrics.durationTrend < 0
                                                    ? 'Shorter workouts'
                                                    : 'No change in duration'}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.05)' }} />

                            <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
                                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                                    Workout Type Trends
                                </Typography>

                                <List dense disablePadding>
                                    {workoutTrendData.topWorkoutTrends.map((workout, index) => (
                                        <ListItem
                                            key={workout.name}
                                            divider={index < workoutTrendData.topWorkoutTrends.length - 1}
                                            sx={{ py: 1 }}
                                        >
                                            <ListItemIcon>
                                                <Box
                                                    sx={{
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: '50%',
                                                        bgcolor: chartColors[index % chartColors.length],
                                                        mr: 1
                                                    }}
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {workout.name}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            {workout.trend > 0 ? (
                                                                <TrendingUp fontSize="small" sx={{ color: '#4caf50', mr: 0.5 }} />
                                                            ) : workout.trend < 0 ? (
                                                                <TrendingDown fontSize="small" sx={{ color: '#ff5252', mr: 0.5 }} />
                                                            ) : (
                                                                <TrendingUp fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                                                            )}
                                                            <Typography variant="body2" sx={{
                                                                fontWeight: 'bold',
                                                                color: workout.trend > 0 ? '#4caf50' : workout.trend < 0 ? '#ff5252' : 'text.secondary'
                                                            }}>
                                                                {workout.trend > 0 ? '+' : ''}{workout.trend}%
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                        <Box sx={{ flex: 1, height: 4, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                                                            <Box
                                                                sx={{
                                                                    height: '100%',
                                                                    width: `${Math.min(100, Math.abs(workout.trend))}%`,
                                                                    bgcolor: workout.trend >= 0 ? '#4caf50' : '#ff5252',
                                                                    borderRadius: 2
                                                                }}
                                                            />
                                                        </Box>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* Day of Week Patterns View */}
            {dataView === 'day' && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <ChartCard
                            title="Day of Week Distribution"
                            chart={
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={dayOfWeekData.dayDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="day" stroke="rgba(255,255,255,0.7)" />
                                        <YAxis stroke="rgba(255,255,255,0.7)" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(30,30,30,0.8)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="count" name="Number of Workouts" radius={[4, 4, 0, 0]}>
                                            {dayOfWeekData.dayDistribution.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.isHighest ? chartColors[0] : entry.isWeekend ? chartColors[1] : chartColors[2]}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            }
                            info="Number of workouts completed on each day of the week"
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <ChartCard
                            title="Day of Week Duration Analysis"
                            chart={
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={dayOfWeekData.dayDuration}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="day" stroke="rgba(255,255,255,0.7)" />
                                        <YAxis stroke="rgba(255,255,255,0.7)" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(30,30,30,0.8)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="avgDuration"
                                            name="Avg. Duration (mins)"
                                            stroke={chartColors[3]}
                                            strokeWidth={2}
                                            activeDot={{ r: 8 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="totalDuration"
                                            name="Total Duration (mins)"
                                            stroke={chartColors[4]}
                                            strokeWidth={2}
                                            activeDot={{ r: 8 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            }
                            info="Average and total workout duration by day of week"
                        />
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
                                <CalendarViewWeek sx={{ color: '#ffb800', mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Day of Week Workout Analysis
                                </Typography>
                            </Box>

                            <Grid container spacing={2} sx={{ p: 2, mb: 2 }}>
                                <Grid item xs={12} sm={4}>
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: '10px',
                                            bgcolor: alpha(chartColors[0], 0.1),
                                            border: `1px solid ${alpha(chartColors[0], 0.2)}`,
                                            height: '100%'
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                            Most Popular Day
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: chartColors[0], mb: 0.5 }}>
                                            {dayOfWeekData.insights.mostPopularDay}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: chartColors[0] }}>
                                            {dayOfWeekData.insights.mostPopularDayCount} workouts
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: '10px',
                                            bgcolor: alpha(chartColors[3], 0.1),
                                            border: `1px solid ${alpha(chartColors[3], 0.2)}`,
                                            height: '100%'
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                            Longest Workouts
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: chartColors[3], mb: 0.5 }}>
                                            {dayOfWeekData.insights.longestDurationDay}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: chartColors[3] }}>
                                            {dayOfWeekData.insights.longestDurationAvg} mins average
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderRadius: '10px',
                                            bgcolor: alpha(chartColors[1], 0.1),
                                            border: `1px solid ${alpha(chartColors[1], 0.2)}`,
                                            height: '100%'
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                            Weekend vs. Weekday
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: chartColors[1], mb: 0.5 }}>
                                            {dayOfWeekData.insights.weekendPercentage}%
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: chartColors[1] }}>
                                            of workouts on weekends
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            <TableContainer sx={{ maxHeight: 300 }}>
                                <Table size="small" stickyHeader>
                                    <thead>
                                    <tr>
                                        <th style={{ padding: '16px', fontWeight: 600, backgroundColor: 'rgba(0,0,0,0.2)' }}>Day</th>
                                        <th style={{ padding: '16px', fontWeight: 600, backgroundColor: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>Workouts</th>
                                        <th style={{ padding: '16px', fontWeight: 600, backgroundColor: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>Avg. Duration</th>
                                        <th style={{ padding: '16px', fontWeight: 600, backgroundColor: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>Total Duration</th>
                                        <th style={{ padding: '16px', fontWeight: 600, backgroundColor: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>Most Common Workout</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {dayOfWeekData.dayWorkoutTypes.map((day) => (
                                        <tr key={day.day} style={{ backgroundColor: day.isWeekend ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                                            <td style={{ padding: '12px', fontWeight: day.isHighest ? 700 : 400, color: day.isHighest ? chartColors[0] : 'inherit' }}>
                                                {day.day}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <Box
                                                    sx={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: 40,
                                                        height: 24,
                                                        borderRadius: '12px',
                                                        bgcolor: alpha(chartColors[day.isHighest ? 0 : day.isWeekend ? 1 : 2], 0.1),
                                                        color: chartColors[day.isHighest ? 0 : day.isWeekend ? 1 : 2],
                                                        fontWeight: 'bold',
                                                        fontSize: '0.8125rem'
                                                    }}
                                                >
                                                    {day.count}
                                                </Box>
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>{day.avgDuration} mins</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>{day.totalDuration} mins</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                {day.topWorkout ? (
                                                    <Chip
                                                        size="small"
                                                        label={day.topWorkout}
                                                        sx={{
                                                            bgcolor: 'rgba(0,0,0,0.2)',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    />
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* Period Comparison View */}
            {dataView === 'comparison' && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <ChartCard
                            title="Monthly Workout Comparison"
                            chart={
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={monthlyComparisonData.monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
                                        <YAxis stroke="rgba(255,255,255,0.7)" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(30,30,30,0.8)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="workoutCount" name="Workouts" fill={chartColors[0]}>
                                            {monthlyComparisonData.monthlyData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.isCurrent ? chartColors[0] : alpha(chartColors[0], 0.5)}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            }
                            info="Monthly comparison of workout volume"
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <ChartCard
                            title="Average Duration by Month"
                            chart={
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={monthlyComparisonData.monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
                                        <YAxis stroke="rgba(255,255,255,0.7)" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(30,30,30,0.8)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="avgDuration"
                                            name="Avg. Duration (mins)"
                                            stroke={chartColors[3]}
                                            strokeWidth={2}
                                            dot={{ stroke: chartColors[3], strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 8 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            }
                            info="Monthly comparison of average workout duration"
                        />
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
                                <DateRange sx={{ color: '#ffb800', mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Period Performance Insights
                                </Typography>
                            </Box>

                            <Grid container spacing={2} sx={{ p: 2 }}>
                                {monthlyComparisonData.insights.map((insight, index) => (
                                    <Grid item xs={12} sm={6} md={3} key={index}>
                                        <Box
                                            sx={{
                                                p: 2,
                                                borderRadius: '10px',
                                                bgcolor: alpha(chartColors[index % chartColors.length], 0.1),
                                                border: `1px solid ${alpha(chartColors[index % chartColors.length], 0.2)}`,
                                                height: '100%'
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                                {insight.label}
                                            </Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 700, color: chartColors[index % chartColors.length], mb: 0.5 }}>
                                                {insight.value}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: chartColors[index % chartColors.length] }}>
                                                {insight.description}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>

                            <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.05)' }} />

                            <Box sx={{ p: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                                    Quarter-over-Quarter Workout Type Comparison
                                </Typography>

                                <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart
                                            data={monthlyComparisonData.quarterWorkoutComparison}
                                            layout="vertical"
                                            margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                            <XAxis type="number" stroke="rgba(255,255,255,0.7)" />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                stroke="rgba(255,255,255,0.7)"
                                                tick={{ fill: 'rgba(255,255,255,0.9)' }}
                                                width={130}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(30,30,30,0.8)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <Legend />
                                            <Bar dataKey="currentQuarter" name="Current Quarter" fill={chartColors[0]} />
                                            <Bar dataKey="previousQuarter" name="Previous Quarter" fill={alpha(chartColors[0], 0.5)} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* Member Consistency View - Admin Only */}
            {dataView === 'consistency' && isAdmin && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <ChartCard
                            title="Member Consistency Analysis"
                            chart={
                                <ResponsiveContainer width="100%" height={400}>
                                    <RadarChart outerRadius={150} data={memberConsistencyData.radarData}>
                                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                        <PolarAngleAxis dataKey="metric" stroke="rgba(255,255,255,0.7)" />
                                        <PolarRadiusAxis angle={90} domain={[0, 10]} stroke="rgba(255,255,255,0.3)" />
                                        {memberConsistencyData.radarChartMembers.map((member, index) => (
                                            <Radar
                                                key={member}
                                                name={member}
                                                dataKey={`scores.${member}`}
                                                stroke={chartColors[index % chartColors.length]}
                                                fill={alpha(chartColors[index % chartColors.length], 0.5)}
                                                strokeWidth={2}
                                            />
                                        ))}
                                        <Legend />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(30,30,30,0.8)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px'
                                            }}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            }
                            info="Multi-dimensional consistency analysis comparing members across different metrics"
                        />
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
                                <Whatshot sx={{ color: '#ffb800', mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Member Consistency Scores
                                </Typography>
                            </Box>

                            <TableContainer sx={{ maxHeight: 500 }}>
                                <Table stickyHeader>
                                    <thead>
                                    <tr>
                                        <th style={{ padding: '16px', fontWeight: 600, backgroundColor: 'rgba(0,0,0,0.2)' }}>Member</th>
                                        <th style={{ padding: '16px', fontWeight: 600, backgroundColor: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>Overall Score</th>
                                        <th style={{ padding: '16px', fontWeight: 600, backgroundColor: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>Frequency</th>
                                        <th style={{ padding: '16px', fontWeight: 600, backgroundColor: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>Regularity</th>
                                        <th style={{ padding: '16px', fontWeight: 600, backgroundColor: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>Variety</th>
                                        <th style={{ padding: '16px', fontWeight: 600, backgroundColor: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>Completion</th>
                                        <th style={{ padding: '16px', fontWeight: 600, backgroundColor: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>Streak</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {memberConsistencyData.memberScores
                                        .sort((a, b) => b.overallScore - a.overallScore)
                                        .map((member, index) => (
                                            <tr key={member.name} style={{ backgroundColor: index % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                                                <td style={{ padding: '12px' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Avatar
                                                            sx={{
                                                                width: 32,
                                                                height: 32,
                                                                mr: 1.5,
                                                                bgcolor: alpha(chartColors[index % chartColors.length], 0.2),
                                                                color: chartColors[index % chartColors.length],
                                                                fontSize: '0.875rem',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            {member.name.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontWeight: index < 3 ? 700 : 400,
                                                                color: index < 3 ? chartColors[index % chartColors.length] : 'inherit'
                                                            }}
                                                        >
                                                            {member.name}
                                                        </Typography>
                                                    </Box>
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                                    <Box
                                                        sx={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: '50%',
                                                            bgcolor: alpha(chartColors[index % chartColors.length], 0.1),
                                                            color: chartColors[index % chartColors.length],
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        {member.overallScore.toFixed(1)}
                                                    </Box>
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                                    {renderScoreCell(member.frequencyScore, index)}
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                                    {renderScoreCell(member.regularityScore, index)}
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                                    {renderScoreCell(member.varietyScore, index)}
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                                    {renderScoreCell(member.completionScore, index)}
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                                    {renderScoreCell(member.streakScore, index)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

// Helper rendering function for consistency score cells
const renderScoreCell = (score, index) => (
    <Box
        sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: score >= 8 ? alpha('#4caf50', 0.1) :
                score >= 5 ? alpha('#ffb800', 0.1) :
                    alpha('#ff5252', 0.1),
            color: score >= 8 ? '#4caf50' :
                score >= 5 ? '#ffb800' :
                    '#ff5252',
            fontWeight: 'bold'
        }}
    >
        {score.toFixed(1)}
    </Box>
);

// Data processing functions

const processTimeActivityData = (workoutLogs, timeRange, selectedMember, isAdmin) => {
    if (!workoutLogs || !workoutLogs.length) return [];

    // Filter logs for selected member if applicable
    const filteredLogs = selectedMember !== 'all' && isAdmin
        ? workoutLogs.filter(log => log.member_name === selectedMember)
        : workoutLogs;

    // Generate time periods based on selected range
    const now = new Date();
    const periodData = [];

    if (timeRange === 'month') {
        // Daily data for the last 30 days
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dayLogs = filteredLogs.filter(log => log.date === dateStr);

            periodData.push({
                date: dateStr,
                label: date.getDate().toString(),
                workoutCount: dayLogs.length,
                uniqueMembers: new Set(dayLogs.map(log => log.member_name)).size,
                avgDuration: dayLogs.length > 0
                    ? Math.round(dayLogs.reduce((sum, log) => sum + log.duration, 0) / dayLogs.length)
                    : 0
            });
        }
    } else if (timeRange === 'quarter') {
        // Weekly data for the last 12 weeks
        for (let i = 11; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            const weekStartStr = weekStart.toISOString().split('T')[0];
            const weekEndStr = weekEnd.toISOString().split('T')[0];

            const weekLogs = filteredLogs.filter(log => {
                const logDate = log.date;
                return logDate >= weekStartStr && logDate <= weekEndStr;
            });

            periodData.push({
                date: weekStartStr,
                label: `W${12 - i}`,
                workoutCount: weekLogs.length,
                uniqueMembers: new Set(weekLogs.map(log => log.member_name)).size,
                avgDuration: weekLogs.length > 0
                    ? Math.round(weekLogs.reduce((sum, log) => sum + log.duration, 0) / weekLogs.length)
                    : 0
            });
        }
    } else if (timeRange === 'year') {
        // Monthly data for the last 12 months
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for (let i = 11; i >= 0; i--) {
            const monthDate = new Date(now);
            monthDate.setMonth(monthDate.getMonth() - i);
            const year = monthDate.getFullYear();
            const month = monthDate.getMonth();

            const monthLogs = filteredLogs.filter(log => {
                const logDate = new Date(log.date);
                return logDate.getFullYear() === year && logDate.getMonth() === month;
            });

            periodData.push({
                date: new Date(year, month, 1).toISOString().split('T')[0],
                label: monthNames[month],
                workoutCount: monthLogs.length,
                uniqueMembers: new Set(monthLogs.map(log => log.member_name)).size,
                avgDuration: monthLogs.length > 0
                    ? Math.round(monthLogs.reduce((sum, log) => sum + log.duration, 0) / monthLogs.length)
                    : 0
            });
        }
    }

    return periodData;
};

const processDayOfWeekData = (workoutLogs, selectedMember, isAdmin) => {
    if (!workoutLogs || !workoutLogs.length) return {
        dayDistribution: [],
        dayDuration: [],
        dayWorkoutTypes: [],
        insights: {
            mostPopularDay: 'N/A',
            mostPopularDayCount: 0,
            longestDurationDay: 'N/A',
            longestDurationAvg: 0,
            weekendPercentage: 0
        }
    };

    // Filter logs for selected member if applicable
    const filteredLogs = selectedMember !== 'all' && isAdmin
        ? workoutLogs.filter(log => log.member_name === selectedMember)
        : workoutLogs;

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayData = dayNames.map(day => ({
        day,
        count: 0,
        totalDuration: 0,
        workouts: {},
        isWeekend: day === 'Saturday' || day === 'Sunday'
    }));

    // Process logs
    filteredLogs.forEach(log => {
        const dayOfWeek = new Date(log.date).getDay(); // 0 = Sunday, 6 = Saturday
        dayData[dayOfWeek].count++;
        dayData[dayOfWeek].totalDuration += log.duration;

        // Track workout types
        if (!dayData[dayOfWeek].workouts[log.workout_name]) {
            dayData[dayOfWeek].workouts[log.workout_name] = 0;
        }
        dayData[dayOfWeek].workouts[log.workout_name]++;
    });

    // Calculate derived metrics
    dayData.forEach(day => {
        day.avgDuration = day.count > 0 ? Math.round(day.totalDuration / day.count) : 0;

        // Find most common workout for this day
        let topWorkout = null;
        let topCount = 0;

        Object.entries(day.workouts).forEach(([workout, count]) => {
            if (count > topCount) {
                topWorkout = workout;
                topCount = count;
            }
        });

        day.topWorkout = topWorkout;
        day.topWorkoutCount = topCount;
    });

    // Find most popular day
    const mostPopularDay = [...dayData].sort((a, b) => b.count - a.count)[0];

    // Find day with longest average duration
    const longestDurationDay = [...dayData].sort((a, b) => b.avgDuration - a.avgDuration)[0];

    // Calculate weekend percentage
    const weekendWorkouts = dayData.filter(day => day.isWeekend).reduce((sum, day) => sum + day.count, 0);
    const totalWorkouts = dayData.reduce((sum, day) => sum + day.count, 0);
    const weekendPercentage = totalWorkouts > 0 ? Math.round((weekendWorkouts / totalWorkouts) * 100) : 0;

    // Mark highest count day
    const highestCount = Math.max(...dayData.map(day => day.count));
    dayData.forEach(day => {
        day.isHighest = day.count === highestCount;
    });

    return {
        dayDistribution: dayData,
        dayDuration: dayData,
        dayWorkoutTypes: dayData,
        insights: {
            mostPopularDay: mostPopularDay.day,
            mostPopularDayCount: mostPopularDay.count,
            longestDurationDay: longestDurationDay.day,
            longestDurationAvg: longestDurationDay.avgDuration,
            weekendPercentage
        }
    };
};

const processMemberConsistencyData = (workoutLogs, members, timeRange, selectedMember, isAdmin) => {
    if (!workoutLogs || !workoutLogs.length || !members || !members.length || !isAdmin) {
        return { radarData: [], radarChartMembers: [], memberScores: [] };
    }

    // If viewing a specific member, only include that member
    const selectedMembers = selectedMember !== 'all'
        ? members.filter(member => member.member_name === selectedMember)
        : members;

    // Get the top 5 members by workout count if showing all members
    const memberWorkoutCounts = {};
    workoutLogs.forEach(log => {
        if (!memberWorkoutCounts[log.member_name]) {
            memberWorkoutCounts[log.member_name] = 0;
        }
        memberWorkoutCounts[log.member_name]++;
    });

    const topMembers = selectedMember !== 'all'
        ? selectedMembers.map(member => member.member_name)
        : Object.entries(memberWorkoutCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(entry => entry[0]);

    // Calculate consistency metrics for each member
    const memberMetrics = {};

    selectedMembers.forEach(member => {
        const memberName = member.member_name;
        const memberLogs = workoutLogs.filter(log => log.member_name === memberName);

        if (memberLogs.length === 0) {
            memberMetrics[memberName] = {
                frequencyScore: 0,
                regularityScore: 0,
                varietyScore: 0,
                completionScore: 0,
                streakScore: 0
            };
            return;
        }

        // Frequency Score: How often they work out (normalized to 0-10)
        const workoutCount = memberLogs.length;
        const maxWorkouts = Math.max(...Object.values(memberWorkoutCounts));
        const frequencyScore = Math.min(10, Math.round((workoutCount / maxWorkouts) * 10 * 10) / 10);

        // Regularity Score: How consistent the intervals are between workouts
        const workoutDates = memberLogs.map(log => new Date(log.date).getTime()).sort();
        let totalGap = 0;
        let gapCount = 0;
        let previousDate = null;

        workoutDates.forEach(date => {
            if (previousDate) {
                const gap = date - previousDate;
                totalGap += gap;
                gapCount++;
            }
            previousDate = date;
        });

        const avgGap = gapCount > 0 ? totalGap / gapCount : 0;
        const idealGap = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
        const regularityScore = Math.min(10, Math.round((1 - Math.abs(avgGap - idealGap) / (7 * 24 * 60 * 60 * 1000)) * 10 * 10) / 10);

        // Variety Score: How many different workout types they do
        const uniqueWorkoutTypes = new Set(memberLogs.map(log => log.workout_name)).size;
        const maxWorkoutTypes = Math.max(...members.map(m => {
            const types = new Set(workoutLogs.filter(log => log.member_name === m.member_name).map(log => log.workout_name));
            return types.size;
        }));
        const varietyScore = Math.min(10, Math.round((uniqueWorkoutTypes / maxWorkoutTypes) * 10 * 10) / 10);

        // Completion Score: How consistently they complete the expected duration
        const avgDuration = memberLogs.reduce((sum, log) => sum + log.duration, 0) / memberLogs.length;
        const durationVariance = memberLogs.reduce((sum, log) => sum + Math.abs(log.duration - avgDuration), 0) / memberLogs.length;
        const completionScore = Math.min(10, Math.round((1 - durationVariance / avgDuration) * 10 * 10) / 10);

        // Streak Score: Longest streak of consecutive workout days
        const dateSet = new Set(memberLogs.map(log => log.date));
        const sortedDates = [...dateSet].sort();

        let currentStreak = 1;
        let longestStreak = 1;

        for (let i = 1; i < sortedDates.length; i++) {
            const current = new Date(sortedDates[i]);
            const previous = new Date(sortedDates[i - 1]);

            // Check if dates are consecutive
            const diffDays = Math.round((current - previous) / (24 * 60 * 60 * 1000));

            if (diffDays === 1) {
                currentStreak++;
                longestStreak = Math.max(longestStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }

        const streakScore = Math.min(10, longestStreak);

        memberMetrics[memberName] = {
            frequencyScore,
            regularityScore,
            varietyScore,
            completionScore,
            streakScore
        };
    });

    // Prepare data for radar chart
    const radarMetrics = [
        { metric: 'Frequency', fullMark: 10 },
        { metric: 'Regularity', fullMark: 10 },
        { metric: 'Variety', fullMark: 10 },
        { metric: 'Completion', fullMark: 10 },
        { metric: 'Streak', fullMark: 10 }
    ];

    // Add scores for each member
    radarMetrics.forEach(metric => {
        metric.scores = {};

        topMembers.forEach(memberName => {
            const metricKey = `${metric.metric.toLowerCase()}Score`;
            metric.scores[memberName] = memberMetrics[memberName] ? memberMetrics[memberName][metricKey] : 0;
        });
    });

    // Calculate overall scores
    const memberScores = Object.keys(memberMetrics).map(memberName => {
        const metrics = memberMetrics[memberName];
        const overallScore = Object.values(metrics).reduce((sum, score) => sum + score, 0) / 5;

        return {
            name: memberName,
            overallScore,
            ...metrics
        };
    });

    return {
        radarData: radarMetrics,
        radarChartMembers: topMembers,
        memberScores
    };
};

const processWorkoutTrendData = (workoutLogs, workouts, timeRange, selectedMember, isAdmin) => {
    if (!workoutLogs || !workoutLogs.length || !workouts || !workouts.length) {
        return { timeData: [], workoutTypes: [], topWorkoutTrends: [] };
    }

    // Filter logs for selected member if applicable
    const filteredLogs = selectedMember !== 'all' && isAdmin
        ? workoutLogs.filter(log => log.member_name === selectedMember)
        : workoutLogs;

    // Get workout types to track
    const workoutTypes = workouts.map(workout => workout.workout_name);

    // Generate time periods based on selected range
    const now = new Date();
    const timeData = [];

    if (timeRange === 'month') {
        // Weekly data for the month
        for (let i = 0; i < 4; i++) {
            const weekStart = new Date(now);
            weekStart.setDate(1); // Start of month
            weekStart.setDate(weekStart.getDate() + (i * 7));

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            if (weekEnd > now) {
                weekEnd.setTime(now.getTime());
            }

            const weekStartStr = weekStart.toISOString().split('T')[0];
            const weekEndStr = weekEnd.toISOString().split('T')[0];

            const weekLogs = filteredLogs.filter(log => {
                const logDate = log.date;
                return logDate >= weekStartStr && logDate <= weekEndStr;
            });

            const periodData = {
                period: `Week ${i + 1}`,
                label: `Week ${i + 1}`
            };

            // Count each workout type
            workoutTypes.forEach(workout => {
                periodData[workout] = weekLogs.filter(log => log.workout_name === workout).length;
            });

            timeData.push(periodData);
        }
    } else if (timeRange === 'quarter') {
        // Monthly data for the quarter
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        for (let i = 0; i < 3; i++) {
            const month = (currentMonth - 2 + i + 12) % 12;
            const year = currentMonth - 2 + i < 0 ? currentYear - 1 : currentYear;

            const monthStart = new Date(year, month, 1);
            const monthEnd = new Date(year, month + 1, 0);

            if (monthEnd > now) {
                monthEnd.setTime(now.getTime());
            }

            const monthStartStr = monthStart.toISOString().split('T')[0];
            const monthEndStr = monthEnd.toISOString().split('T')[0];

            const monthLogs = filteredLogs.filter(log => {
                const logDate = log.date;
                return logDate >= monthStartStr && logDate <= monthEndStr;
            });

            const periodData = {
                period: monthNames[month],
                label: monthNames[month]
            };

            // Count each workout type
            workoutTypes.forEach(workout => {
                periodData[workout] = monthLogs.filter(log => log.workout_name === workout).length;
            });

            timeData.push(periodData);
        }
    } else if (timeRange === 'year') {
        // Quarterly data for the year
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const currentYear = now.getFullYear();

        for (let i = 0; i < 4; i++) {
            const quarter = (currentQuarter - 3 + i + 4) % 4;
            const year = currentQuarter - 3 + i < 0 ? currentYear - 1 : currentYear;

            const quarterStart = new Date(year, quarter * 3, 1);
            const quarterEnd = new Date(year, (quarter + 1) * 3, 0);

            if (quarterEnd > now) {
                quarterEnd.setTime(now.getTime());
            }

            const quarterStartStr = quarterStart.toISOString().split('T')[0];
            const quarterEndStr = quarterEnd.toISOString().split('T')[0];

            const quarterLogs = filteredLogs.filter(log => {
                const logDate = log.date;
                return logDate >= quarterStartStr && logDate <= quarterEndStr;
            });

            const periodData = {
                period: `Q${quarter + 1}`,
                label: `Q${quarter + 1}`
            };

            // Count each workout type
            workoutTypes.forEach(workout => {
                periodData[workout] = quarterLogs.filter(log => log.workout_name === workout).length;
            });

            timeData.push(periodData);
        }
    }

    // Calculate trends for each workout type
    const workoutTypeTrends = workoutTypes.map(workout => {
        // Split logs into current and previous periods
        const periodUnit = timeRange === 'month' ? 7 : timeRange === 'quarter' ? 30 : 90; // days
        const currentPeriodStart = new Date(now);
        currentPeriodStart.setDate(currentPeriodStart.getDate() - periodUnit);

        const previousPeriodStart = new Date(currentPeriodStart);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - periodUnit);

        const currentPeriodLogs = filteredLogs.filter(log => {
            const logDate = new Date(log.date);
            return logDate >= currentPeriodStart && logDate <= now;
        });

        const previousPeriodLogs = filteredLogs.filter(log => {
            const logDate = new Date(log.date);
            return logDate >= previousPeriodStart && logDate < currentPeriodStart;
        });

        const currentCount = currentPeriodLogs.filter(log => log.workout_name === workout).length;
        const previousCount = previousPeriodLogs.filter(log => log.workout_name === workout).length;

        let trend = 0;
        if (previousCount > 0) {
            trend = Math.round(((currentCount - previousCount) / previousCount) * 100);
        } else if (currentCount > 0) {
            trend = 100; // New workout (infinite growth represented as 100%)
        }

        return {
            name: workout,
            currentCount,
            previousCount,
            trend
        };
    }).filter(w => w.currentCount > 0 || w.previousCount > 0); // Only include workouts with data

    return {
        timeData,
        workoutTypes,
        topWorkoutTrends: workoutTypeTrends.sort((a, b) => Math.abs(b.trend) - Math.abs(a.trend)).slice(0, 6)
    };
};

const processMonthlyComparisonData = (workoutLogs, timeRange, selectedMember, isAdmin) => {
    if (!workoutLogs || !workoutLogs.length) {
        return {
            monthlyData: [],
            quarterWorkoutComparison: [],
            insights: []
        };
    }

    // Filter logs for selected member if applicable
    const filteredLogs = selectedMember !== 'all' && isAdmin
        ? workoutLogs.filter(log => log.member_name === selectedMember)
        : workoutLogs;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Process monthly data
    const monthlyData = [];
    for (let i = 0; i < 12; i++) {
        const month = (currentMonth - 11 + i + 12) % 12;
        const year = currentMonth - 11 + i < 0 ? currentYear - 1 : currentYear;

        // const monthStart = new Date(year, month, 1);
        // const monthEnd = new Date(year, month + 1, 0);

        const monthLogs = filteredLogs.filter(log => {
            const logDate = new Date(log.date);
            return logDate.getFullYear() === year && logDate.getMonth() === month;
        });

        monthlyData.push({
            month: monthNames[month],
            year,
            workoutCount: monthLogs.length,
            uniqueMembers: isAdmin ? new Set(monthLogs.map(log => log.member_name)).size : null,
            totalDuration: monthLogs.reduce((sum, log) => sum + log.duration, 0),
            avgDuration: monthLogs.length > 0 ? Math.round(monthLogs.reduce((sum, log) => sum + log.duration, 0) / monthLogs.length) : 0,
            isCurrent: month === currentMonth && year === currentYear
        });
    }

    // Process quarter comparison data for workout types
    const currentQuarter = Math.floor(currentMonth / 3);
    const previousQuarter = (currentQuarter - 1 + 4) % 4;
    const previousQuarterYear = currentQuarter === 0 ? currentYear - 1 : currentYear;

    const currentQuarterLogs = filteredLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate.getFullYear() === currentYear && Math.floor(logDate.getMonth() / 3) === currentQuarter;
    });

    const previousQuarterLogs = filteredLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate.getFullYear() === previousQuarterYear && Math.floor(logDate.getMonth() / 3) === previousQuarter;
    });

    // Count workouts by type for each quarter
    const workoutCounts = {};

    // Process current quarter
    currentQuarterLogs.forEach(log => {
        if (!workoutCounts[log.workout_name]) {
            workoutCounts[log.workout_name] = { name: log.workout_name, currentQuarter: 0, previousQuarter: 0 };
        }
        workoutCounts[log.workout_name].currentQuarter++;
    });

    // Process previous quarter
    previousQuarterLogs.forEach(log => {
        if (!workoutCounts[log.workout_name]) {
            workoutCounts[log.workout_name] = { name: log.workout_name, currentQuarter: 0, previousQuarter: 0 };
        }
        workoutCounts[log.workout_name].previousQuarter++;
    });

    const quarterWorkoutComparison = Object.values(workoutCounts)
        .sort((a, b) => b.currentQuarter - a.currentQuarter);

    // Generate insights
    const currentMonthData = monthlyData.find(month => month.isCurrent) || { workoutCount: 0, avgDuration: 0 };
    const previousMonthData = monthlyData[10]; // Previous month

    const workoutCountChange = previousMonthData.workoutCount > 0
        ? Math.round(((currentMonthData.workoutCount - previousMonthData.workoutCount) / previousMonthData.workoutCount) * 100)
        : currentMonthData.workoutCount > 0 ? 100 : 0;

    const durationChange = previousMonthData.avgDuration > 0
        ? Math.round(((currentMonthData.avgDuration - previousMonthData.avgDuration) / previousMonthData.avgDuration) * 100)
        : currentMonthData.avgDuration > 0 ? 100 : 0;

    // Find best month
    const bestMonth = [...monthlyData].sort((a, b) => b.workoutCount - a.workoutCount)[0];

    // Find month with longest workouts
    const longestMonth = [...monthlyData].sort((a, b) => b.avgDuration - a.avgDuration)[0];

    const insights = [
        {
            label: 'Month-Over-Month',
            value: `${workoutCountChange > 0 ? '+' : ''}${workoutCountChange}%`,
            description: 'Change in workout count'
        },
        {
            label: 'Best Workout Month',
            value: bestMonth.month,
            description: `${bestMonth.workoutCount} workouts`
        },
        {
            label: 'Duration Trend',
            value: `${durationChange > 0 ? '+' : ''}${durationChange}%`,
            description: 'Change in workout length'
        },
        {
            label: 'Longest Workouts',
            value: longestMonth.month,
            description: `${longestMonth.avgDuration} mins average`
        }
    ];

    return {
        monthlyData,
        quarterWorkoutComparison,
        insights
    };
};

const calculateTrendMetrics = (workoutLogs, timeRange, selectedMember, isAdmin) => {
    if (!workoutLogs || !workoutLogs.length) {
        return {
            avgWorkoutsPerPeriod: 0,
            workoutsTrend: 0,
            avgDuration: 0,
            durationTrend: 0,
            participationRate: 0,
            participationTrend: 0,
            consistencyScore: 0,
            mostActivePeriod: 'N/A'
        };
    }

    // Filter logs for selected member if applicable
    const filteredLogs = selectedMember !== 'all' && isAdmin
        ? workoutLogs.filter(log => log.member_name === selectedMember)
        : workoutLogs;

    const now = new Date();

    // Determine period length based on timeRange
    const periodDays = timeRange === 'month' ? 30 : timeRange === 'quarter' ? 90 : 365;

    // Split logs into current and previous periods
    const currentPeriodStart = new Date(now);
    currentPeriodStart.setDate(currentPeriodStart.getDate() - periodDays);

    const previousPeriodStart = new Date(currentPeriodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - periodDays);

    const currentPeriodLogs = filteredLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= currentPeriodStart && logDate <= now;
    });

    const previousPeriodLogs = filteredLogs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= previousPeriodStart && logDate < currentPeriodStart;
    });

    // Calculate average workouts per period
    // const periodName = timeRange === 'month' ? 'day' : timeRange === 'quarter' ? 'week' : 'month';
    const periodsInTimeRange = timeRange === 'month' ? 30 : timeRange === 'quarter' ? 13 : 12;

    const avgWorkoutsPerPeriod = Math.round((currentPeriodLogs.length / periodsInTimeRange) * 10) / 10;

    // Calculate workout trend
    let workoutsTrend = 0;
    if (previousPeriodLogs.length > 0) {
        workoutsTrend = Math.round(((currentPeriodLogs.length - previousPeriodLogs.length) / previousPeriodLogs.length) * 100);
    } else if (currentPeriodLogs.length > 0) {
        workoutsTrend = 100; // First period with data
    }

    // Calculate average duration
    const avgDuration = currentPeriodLogs.length > 0
        ? Math.round(currentPeriodLogs.reduce((sum, log) => sum + log.duration, 0) / currentPeriodLogs.length)
        : 0;

    // Calculate duration trend
    const prevAvgDuration = previousPeriodLogs.length > 0
        ? Math.round(previousPeriodLogs.reduce((sum, log) => sum + log.duration, 0) / previousPeriodLogs.length)
        : 0;

    let durationTrend = 0;
    if (prevAvgDuration > 0) {
        durationTrend = Math.round(((avgDuration - prevAvgDuration) / prevAvgDuration) * 100);
    } else if (avgDuration > 0) {
        durationTrend = 100; // First period with data
    }

    // Calculate participation rate (admin only)
    let participationRate = 0;
    let participationTrend = 0;

    if (isAdmin && selectedMember === 'all') {
        const uniqueMembersCurrent = new Set(currentPeriodLogs.map(log => log.member_name)).size;
        const uniqueMembersPrevious = new Set(previousPeriodLogs.map(log => log.member_name)).size;

        // Calculate what percentage of total members participated
        const totalMembers = 20; // Estimated total member count - would need to be passed in
        participationRate = Math.round((uniqueMembersCurrent / totalMembers) * 100);

        if (uniqueMembersPrevious > 0) {
            participationTrend = Math.round(((uniqueMembersCurrent - uniqueMembersPrevious) / uniqueMembersPrevious) * 100);
        } else if (uniqueMembersCurrent > 0) {
            participationTrend = 100; // First period with participants
        }
    }

    // Calculate consistency score
    const consistencyScore = calculateConsistencyScore(filteredLogs);

    // Find most active period
    const mostActivePeriod = findMostActivePeriod(filteredLogs, timeRange);

    return {
        avgWorkoutsPerPeriod,
        workoutsTrend,
        avgDuration,
        durationTrend,
        participationRate,
        participationTrend,
        consistencyScore,
        mostActivePeriod
    };
};

// Helper function to calculate consistency score
const calculateConsistencyScore = (logs) => {
    if (!logs || logs.length === 0) return 0;

    // Sort logs by date
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate average gap between workouts
    let totalGap = 0;
    let gapCount = 0;
    let previousDate = null;

    sortedLogs.forEach(log => {
        const currentDate = new Date(log.date);
        if (previousDate) {
            const gap = Math.abs(currentDate - previousDate) / (1000 * 60 * 60 * 24); // Gap in days
            totalGap += gap;
            gapCount++;
        }
        previousDate = currentDate;
    });

    const avgGap = gapCount > 0 ? totalGap / gapCount : 0;

    // Calculate standard deviation of gaps
    let squaredDiffs = 0;
    previousDate = null;

    sortedLogs.forEach(log => {
        const currentDate = new Date(log.date);
        if (previousDate) {
            const gap = Math.abs(currentDate - previousDate) / (1000 * 60 * 60 * 24); // Gap in days
            squaredDiffs += Math.pow(gap - avgGap, 2);
        }
        previousDate = currentDate;
    });

    const stdDev = gapCount > 0 ? Math.sqrt(squaredDiffs / gapCount) : 0;

    // Calculate consistency score (0-10 scale)
    // Lower standard deviation = more consistent = higher score
    const regularityScore = Math.max(0, Math.min(10, 10 - stdDev));

    // Calculate frequency score (0-10 scale based on avg gap)
    // Ideal gap is 2-3 days, higher score for closer to ideal
    const idealGap = 2.5; // 2-3 days between workouts
    const frequencyScore = Math.max(0, Math.min(10, 10 - Math.abs(avgGap - idealGap)));

    // Final consistency score is average of regularity and frequency scores
    return Math.round((regularityScore + frequencyScore) / 2 * 10) / 10;
};

// Helper function to find most active period
const findMostActivePeriod = (logs, timeRange) => {
    if (!logs || logs.length === 0) return 'N/A';

    // const now = new Date();

    if (timeRange === 'month') {
        // Find most active day
        const dayCount = {};
        logs.forEach(log => {
            const dayStr = log.date.split('T')[0];
            dayCount[dayStr] = (dayCount[dayStr] || 0) + 1;
        });

        let mostActiveDay = null;
        let maxCount = 0;

        Object.entries(dayCount).forEach(([day, count]) => {
            if (count > maxCount) {
                mostActiveDay = day;
                maxCount = count;
            }
        });

        if (mostActiveDay) {
            const date = new Date(mostActiveDay);
            return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
        }
    } else if (timeRange === 'quarter') {
        // Find most active week
        const weekCount = {};

        logs.forEach(log => {
            const logDate = new Date(log.date);
            const year = logDate.getFullYear();
            const month = logDate.getMonth();
            const weekOfMonth = Math.floor((logDate.getDate() - 1) / 7) + 1;
            const weekKey = `${year}-${month}-${weekOfMonth}`;

            weekCount[weekKey] = (weekCount[weekKey] || 0) + 1;
        });

        let mostActiveWeek = null;
        let maxCount = 0;

        Object.entries(weekCount).forEach(([week, count]) => {
            if (count > maxCount) {
                mostActiveWeek = week;
                maxCount = count;
            }
        });

        if (mostActiveWeek) {
            const [year, month, weekNum] = mostActiveWeek.split('-').map(Number);
            const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'short' });
            return `Week ${weekNum} of ${monthName}`;
        }
    } else if (timeRange === 'year') {
        // Find most active month
        const monthCount = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        logs.forEach(log => {
            const logDate = new Date(log.date);
            const year = logDate.getFullYear();
            const month = logDate.getMonth();
            const monthKey = `${year}-${month}`;

            monthCount[monthKey] = (monthCount[monthKey] || 0) + 1;
        });

        let mostActiveMonth = null;
        let maxCount = 0;

        Object.entries(monthCount).forEach(([monthKey, count]) => {
            if (count > maxCount) {
                mostActiveMonth = monthKey;
                maxCount = count;
            }
        });

        if (mostActiveMonth) {
            const [, month] = mostActiveMonth.split('-').map(Number);
            return monthNames[month];
        }
    }

    return 'N/A';
};

export default TrendsDashboard;
