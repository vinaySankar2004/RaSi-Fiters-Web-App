import React, { useState } from "react";
import {
    Box,
    Grid,
    Typography,
    Chip,
    Avatar,
    Paper,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    useTheme,
    alpha,
    Divider
} from "@mui/material";
import {
    DirectionsRun,
    Timer,
    Group,
    TrendingUp,
    BarChart,
    Analytics,
    FilterList,
    CompareArrows,
    Info
} from "@mui/icons-material";
import {
    ResponsiveContainer,
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    ScatterChart,
    Scatter,
    ZAxis
} from "recharts";

import { ChartCard, StatCard, LoadingPlaceholder } from "./AnalyticsComponents";

const WorkoutTypesDashboard = ({ workoutLogs, members, workouts, timeRange, selectedMember, isAdmin, memberName, loading }) => {
    const theme = useTheme();
    const chartColors = theme.palette.chart.colors;
    const [activeTab, setActiveTab] = useState(0);

    // Process workout data for visualizations
    const workoutTypeData = processWorkoutTypeData(workoutLogs, members, selectedMember, isAdmin);
    const workoutDurationData = processWorkoutDurationData(workoutLogs, selectedMember, isAdmin);
    const workoutParticipationData = processWorkoutParticipationData(workoutLogs, members, selectedMember, isAdmin);
    const workoutTrendsData = processWorkoutTrendsData(workoutLogs, workouts, timeRange, selectedMember, isAdmin);
    const workoutTypeMatrix = calculateWorkoutTypeMatrix(workoutLogs, selectedMember, isAdmin);

    // Get top workout types for summary stats
    const topWorkouts = [...workoutTypeData].sort((a, b) => b.count - a.count).slice(0, 4);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
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
                        title="Total Workout Types"
                        value={workoutTypeData.length}
                        subtitle="different exercises"
                        icon={<DirectionsRun />}
                        color="#ffb800"
                        bgColor="rgba(255,184,0,0.15)"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Most Popular"
                        value={topWorkouts[0]?.name || "N/A"}
                        subtitle={topWorkouts[0] ? `${topWorkouts[0].count} workouts` : "No data"}
                        icon={<TrendingUp />}
                        color="#4a148c"
                        bgColor="rgba(74,20,140,0.15)"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Longest Duration"
                        value={workoutDurationData[0]?.name || "N/A"}
                        subtitle={workoutDurationData[0] ? `${workoutDurationData[0].avgDuration} mins avg` : "No data"}
                        icon={<Timer />}
                        color="#ff5252"
                        bgColor="rgba(255,82,82,0.15)"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Highest Participation"
                        value={workoutParticipationData[0]?.name || "N/A"}
                        subtitle={workoutParticipationData[0] ? `${workoutParticipationData[0].participationRate}% of members` : "No data"}
                        icon={<Group />}
                        color="#4caf50"
                        bgColor="rgba(76,175,80,0.15)"
                    />
                </Grid>
            </Grid>

            {/* Tabs for different analysis views */}
            <Box sx={{ mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
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
                    <Tab label="Popularity" icon={<BarChart />} iconPosition="start" />
                    <Tab label="Duration Analysis" icon={<Timer />} iconPosition="start" />
                    <Tab label="Participation" icon={<Group />} iconPosition="start" />
                    <Tab label="Trends" icon={<TrendingUp />} iconPosition="start" />
                    <Tab label="Comparison Matrix" icon={<CompareArrows />} iconPosition="start" />
                </Tabs>
            </Box>

            {/* Popularity Analysis */}
            {activeTab === 0 && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={7}>
                        <ChartCard
                            title="Workout Type Popularity"
                            chart={
                                <ResponsiveContainer width="100%" height={400}>
                                    <RechartsBarChart
                                        data={workoutTypeData}
                                        layout="vertical"
                                        margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis type="number" stroke="rgba(255,255,255,0.7)" />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
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
                                        <Bar dataKey="count" name="Total Workouts" fill="#ffb800">
                                            {workoutTypeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                            ))}
                                        </Bar>
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            }
                            info="Shows the number of times each workout type has been completed"
                        />
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <ChartCard
                            title="Workout Distribution"
                            chart={
                                <ResponsiveContainer width="100%" height={400}>
                                    <PieChart>
                                        <Pie
                                            data={workoutTypeData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            dataKey="count"
                                            nameKey="name"
                                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                        >
                                            {workoutTypeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(30,30,30,0.8)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px'
                                            }}
                                            formatter={(value, name) => [`${value} workouts`, name]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            }
                            info="Percentage distribution of workout types"
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
                                <Analytics sx={{ color: '#ffb800', mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Workout Types Detail
                                </Typography>
                            </Box>

                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ background: 'rgba(0,0,0,0.1)' }}>
                                            <TableCell sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Workout Type</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Total Workouts</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Avg. Duration (mins)</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Participation</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Most Active Member</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {workoutTypeData.map((workout, index) => (
                                            <TableRow key={workout.name} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Box
                                                            sx={{
                                                                width: 12,
                                                                height: 12,
                                                                borderRadius: '4px',
                                                                bgcolor: chartColors[index % chartColors.length],
                                                                mr: 1.5
                                                            }}
                                                        />
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {workout.name}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">{workout.count}</TableCell>
                                                <TableCell align="center">{workout.avgDuration}</TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        size="small"
                                                        label={`${workout.participationRate}%`}
                                                        sx={{
                                                            bgcolor: alpha('#4caf50', 0.1),
                                                            color: '#4caf50',
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    {workout.topMember ? (
                                                        <Chip
                                                            avatar={
                                                                <Avatar
                                                                    sx={{
                                                                        bgcolor: alpha(chartColors[index % chartColors.length], 0.3),
                                                                        color: chartColors[index % chartColors.length]
                                                                    }}
                                                                >
                                                                    {workout.topMember.name.charAt(0).toUpperCase()}
                                                                </Avatar>
                                                            }
                                                            label={`${workout.topMember.name} (${workout.topMember.count})`}
                                                            sx={{
                                                                bgcolor: 'rgba(0,0,0,0.2)',
                                                                '& .MuiChip-label': { fontWeight: 500 }
                                                            }}
                                                        />
                                                    ) : (
                                                        "N/A"
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* Duration Analysis */}
            {activeTab === 1 && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <ChartCard
                            title="Workout Duration by Type"
                            chart={
                                <ResponsiveContainer width="100%" height={400}>
                                    <RechartsBarChart
                                        data={workoutDurationData}
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
                                        <Legend />
                                        <Bar dataKey="avgDuration" name="Average Duration (mins)" fill="#4a148c">
                                            {workoutDurationData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={chartColors[(index + 2) % chartColors.length]} />
                                            ))}
                                        </Bar>
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            }
                            info="Average duration in minutes for each workout type"
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <ChartCard
                            title="Duration vs. Frequency"
                            chart={
                                <ResponsiveContainer width="100%" height={400}>
                                    <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis
                                            type="number"
                                            dataKey="count"
                                            name="Frequency"
                                            stroke="rgba(255,255,255,0.7)"
                                            label={{
                                                value: 'Workout Count',
                                                position: 'insideBottom',
                                                offset: -5,
                                                fill: 'rgba(255,255,255,0.7)'
                                            }}
                                        />
                                        <YAxis
                                            type="number"
                                            dataKey="avgDuration"
                                            name="Avg. Duration"
                                            stroke="rgba(255,255,255,0.7)"
                                            label={{
                                                value: 'Avg. Duration (mins)',
                                                angle: -90,
                                                position: 'insideLeft',
                                                fill: 'rgba(255,255,255,0.7)'
                                            }}
                                        />
                                        <ZAxis dataKey="totalDuration" range={[60, 600]} name="Total Duration" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(30,30,30,0.8)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px'
                                            }}
                                            formatter={(value, name, props) => {
                                                const workout = props.payload;
                                                return [
                                                    `${workout.name}\nCount: ${workout.count}\nAvg Duration: ${workout.avgDuration} mins\nTotal Duration: ${workout.totalDuration} mins`,
                                                    ''
                                                ];
                                            }}
                                        />
                                        <Scatter
                                            name="Workouts"
                                            data={workoutDurationData}
                                            fill="#ffb800"
                                        >
                                            {workoutTypeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                            ))}
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>
                            }
                            info="Visualization of workout frequency vs. average duration. Bubble size represents total time spent."
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
                            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Timer sx={{ color: '#ffb800', mr: 1 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Duration Insights
                                    </Typography>
                                </Box>

                                <Chip
                                    icon={<Info />}
                                    label="Duration measured in minutes"
                                    size="small"
                                    sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}
                                />
                            </Box>

                            <Grid container spacing={0}>
                                <Grid item xs={12} md={6} sx={{ borderRight: { md: '1px solid rgba(255,255,255,0.05)' } }}>
                                    <Box sx={{ p: 3 }}>
                                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                                            <BarChart sx={{ mr: 1, color: '#4a148c' }} /> Workout Duration Rankings
                                        </Typography>

                                        <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                                            <List dense disablePadding>
                                                {[...workoutDurationData]
                                                    .sort((a, b) => b.avgDuration - a.avgDuration)
                                                    .map((workout, index) => (
                                                        <ListItem
                                                            key={workout.name}
                                                            divider={index < workoutDurationData.length - 1}
                                                            sx={{ py: 1.5 }}
                                                        >
                                                            <ListItemAvatar>
                                                                <Avatar
                                                                    sx={{
                                                                        width: 32,
                                                                        height: 32,
                                                                        bgcolor: alpha(chartColors[(index + 2) % chartColors.length], 0.2),
                                                                        color: chartColors[(index + 2) % chartColors.length],
                                                                        fontSize: '0.875rem',
                                                                        fontWeight: 'bold'
                                                                    }}
                                                                >
                                                                    {index + 1}
                                                                </Avatar>
                                                            </ListItemAvatar>

                                                            <ListItemText
                                                                primary={
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                            {workout.name}
                                                                        </Typography>
                                                                        <Typography variant="body2" sx={{ fontWeight: 700, color: chartColors[(index + 2) % chartColors.length] }}>
                                                                            {workout.avgDuration} mins
                                                                        </Typography>
                                                                    </Box>
                                                                }
                                                                secondary={
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                                        <Box sx={{ flex: 1, height: 4, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                                                                            <Box
                                                                                sx={{
                                                                                    height: '100%',
                                                                                    width: `${(workout.avgDuration / workoutDurationData[0].avgDuration) * 100}%`,
                                                                                    bgcolor: chartColors[(index + 2) % chartColors.length],
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
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Box sx={{ p: 3 }}>
                                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                                            <BarChart sx={{ mr: 1, color: '#ff5252' }} /> Duration Distribution
                                        </Typography>

                                        <Box sx={{ mb: 3 }}>
                                            <Grid container spacing={2}>
                                                {calculateDurationDistribution(workoutLogs).map((category, index) => (
                                                    <Grid item xs={6} sm={4} key={category.label}>
                                                        <Box
                                                            sx={{
                                                                p: 2,
                                                                borderRadius: '10px',
                                                                bgcolor: alpha(chartColors[(index + 4) % chartColors.length], 0.1),
                                                                border: `1px solid ${alpha(chartColors[(index + 4) % chartColors.length], 0.2)}`,
                                                                height: '100%',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center'
                                                            }}
                                                        >
                                                            <Typography variant="h4" sx={{ fontWeight: 700, color: chartColors[(index + 4) % chartColors.length] }}>
                                                                {category.count}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                                                                {category.label}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ color: chartColors[(index + 4) % chartColors.length], fontWeight: 600, mt: 1 }}>
                                                                {Math.round(category.percentage)}%
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Box>

                                        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.05)' }} />

                                        <Box>
                                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                                Duration Statistics
                                            </Typography>

                                            <Grid container spacing={2}>
                                                {calculateDurationStats(workoutLogs).map((stat, index) => (
                                                    <Grid item xs={6} md={3} key={stat.label}>
                                                        <Box sx={{ textAlign: 'center' }}>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                {stat.label}
                                                            </Typography>
                                                            <Typography variant="h6" sx={{ fontWeight: 700, color: stat.color }}>
                                                                {stat.value}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                minutes
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* Participation Analysis */}
            {activeTab === 2 && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={7}>
                        <ChartCard
                            title="Member Participation by Workout Type"
                            chart={
                                <ResponsiveContainer width="100%" height={400}>
                                    <RechartsBarChart
                                        data={workoutParticipationData}
                                        layout="vertical"
                                        margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis type="number" stroke="rgba(255,255,255,0.7)" domain={[0, 100]} label={{ value: 'Participation (%)', position: 'insideBottom', offset: -5 }} />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            tick={{ fill: 'rgba(255,255,255,0.9)' }}
                                            width={130}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(30,30,30,0.8)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px'
                                            }}
                                            formatter={(value) => [`${value}%`, 'Participation Rate']}
                                        />
                                        <Bar dataKey="participationRate" name="Participation Rate" fill="#4caf50">
                                            {workoutParticipationData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={chartColors[(index + 3) % chartColors.length]} />
                                            ))}
                                        </Bar>
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            }
                            info="Percentage of members who have done each workout type"
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
                            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center' }}>
                                <Group sx={{ color: '#ffb800', mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Member Engagement
                                </Typography>
                            </Box>

                            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                                {isAdmin && (
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                            Overall Engagement
                                        </Typography>

                                        <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', p: 2, borderRadius: '10px' }}>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, display: 'flex', justifyContent: 'space-between' }}>
                                                <span>Active Members</span>
                                                <span>{getActiveMemberCount(workoutLogs)} of {members.length}</span>
                                            </Typography>
                                            <Box sx={{ width: '100%', height: '8px', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '4px', mb: 2 }}>
                                                <Box
                                                    sx={{
                                                        width: `${(getActiveMemberCount(workoutLogs) / members.length) * 100}%`,
                                                        height: '100%',
                                                        bgcolor: '#4caf50',
                                                        borderRadius: '4px',
                                                        transition: 'width 1s ease-in-out'
                                                    }}
                                                />
                                            </Box>

                                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                                <Box sx={{ textAlign: 'center', flex: 1, minWidth: 100 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                                                        {((getActiveMemberCount(workoutLogs) / members.length) * 100).toFixed(0)}%
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        Participation Rate
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ textAlign: 'center', flex: 1, minWidth: 100 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffb800' }}>
                                                        {getAverageWorkoutTypes(workoutLogs, members).toFixed(1)}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        Avg Workout Types
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ textAlign: 'center', flex: 1, minWidth: 100 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff5252' }}>
                                                        {getMostDiverseMember(workoutLogs)?.types || 0}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        Max Workout Types
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                )}

                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                        Top Engaged Members
                                    </Typography>

                                    <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                                        <List dense disablePadding>
                                            {getMemberEngagementData(workoutLogs, workouts)
                                                .slice(0, 5)
                                                .map((member, index) => (
                                                    <ListItem
                                                        key={member.name}
                                                        divider={index < 4}
                                                        sx={{ py: 1.5 }}
                                                    >
                                                        <ListItemAvatar>
                                                            <Avatar
                                                                sx={{
                                                                    width: 32,
                                                                    height: 32,
                                                                    bgcolor: alpha(chartColors[index % chartColors.length], 0.2),
                                                                    color: chartColors[index % chartColors.length],
                                                                    fontSize: '0.875rem',
                                                                    fontWeight: 'bold'
                                                                }}
                                                            >
                                                                {member.name.charAt(0).toUpperCase()}
                                                            </Avatar>
                                                        </ListItemAvatar>

                                                        <ListItemText
                                                            primary={
                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                    {member.name}
                                                                </Typography>
                                                            }
                                                            secondary={
                                                                <Box sx={{ mt: 0.5 }}>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                            Workout Types: {member.uniqueWorkoutTypes}
                                                                        </Typography>
                                                                        <Typography variant="caption" sx={{ color: chartColors[index % chartColors.length], fontWeight: 600 }}>
                                                                            {member.coveragePercentage}%
                                                                        </Typography>
                                                                    </Box>
                                                                    <Box sx={{ width: '100%', height: '4px', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                                                                        <Box
                                                                            sx={{
                                                                                width: `${member.coveragePercentage}%`,
                                                                                height: '100%',
                                                                                bgcolor: chartColors[index % chartColors.length],
                                                                                borderRadius: '2px'
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
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <ChartCard
                            title="Workout Participation Matrix"
                            chart={
                                <ResponsiveContainer width="100%" height={400}>
                                    <RechartsBarChart
                                        data={workoutParticipationData.map(workout => ({
                                            name: workout.name,
                                            participationCount: workout.participantCount,
                                            avgFrequencyPerParticipant: workout.avgFrequencyPerParticipant
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
                                        <Bar yAxisId="left" dataKey="participationCount" name="Member Count" fill={chartColors[3]}>
                                            {workoutParticipationData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={chartColors[(index + 3) % chartColors.length]} />
                                            ))}
                                        </Bar>
                                        <Bar yAxisId="right" dataKey="avgFrequencyPerParticipant" name="Avg. Workouts per Participant" fill={chartColors[1]}>
                                            {workoutParticipationData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={chartColors[(index + 5) % chartColors.length]} />
                                            ))}
                                        </Bar>
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            }
                            info="Compares member count with average frequency per participant for each workout type"
                        />
                    </Grid>
                </Grid>
            )}

            {/* Trends Analysis */}
            {activeTab === 3 && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <ChartCard
                            title="Workout Type Trends Over Time"
                            chart={
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis
                                            dataKey="period"
                                            stroke="rgba(255,255,255,0.7)"
                                            data={workoutTrendsData.periodData}
                                        />
                                        <YAxis stroke="rgba(255,255,255,0.7)" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(30,30,30,0.8)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend />

                                        {workoutTrendsData.workoutTrends.map((workout, index) => (
                                            <Line
                                                key={workout.name}
                                                type="monotone"
                                                data={workout.data}
                                                dataKey="count"
                                                name={workout.name}
                                                stroke={chartColors[index % chartColors.length]}
                                                activeDot={{ r: 8 }}
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            }
                            info={`Trend of workout types over the selected ${timeRange} period`}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <ChartCard
                            title="Workout Type Growth Rate"
                            chart={
                                <ResponsiveContainer width="100%" height={400}>
                                    <RechartsBarChart
                                        data={workoutTrendsData.growthRates}
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
                                            formatter={(value) => [`${value > 0 ? '+' : ''}${value}%`, 'Growth Rate']}
                                        />
                                        <Bar dataKey="growthRate" name="Growth Rate (%)" radius={[4, 4, 0, 0]}>
                                            {workoutTrendsData.growthRates.map((entry) => (
                                                <Cell
                                                    key={`cell-${entry.name}`}
                                                    fill={entry.growthRate >= 0 ? '#4caf50' : '#ff5252'}
                                                />
                                            ))}
                                        </Bar>
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            }
                            info="Growth rate of each workout type compared to the previous period"
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
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center' }}>
                                <TrendingUp sx={{ color: '#ffb800', mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Trending Insights
                                </Typography>
                            </Box>

                            <Box sx={{ p: 3, flex: 1 }}>
                                <Grid container spacing={2} sx={{ mb: 3 }}>
                                    <Grid item xs={6}>
                                        <Box
                                            sx={{
                                                p: 2,
                                                borderRadius: '10px',
                                                bgcolor: alpha('#4caf50', 0.1),
                                                border: '1px solid rgba(76,175,80,0.2)',
                                                height: '100%'
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                                Trending Up
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50', mb: 0.5 }}>
                                                {workoutTrendsData.growthRates.length > 0 ?
                                                    workoutTrendsData.growthRates
                                                        .filter(w => w.growthRate > 0)
                                                        .sort((a, b) => b.growthRate - a.growthRate)[0]?.name || 'N/A' : 'N/A'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#4caf50' }}>
                                                {workoutTrendsData.growthRates.length > 0 ?
                                                    `+${workoutTrendsData.growthRates
                                                        .filter(w => w.growthRate > 0)
                                                        .sort((a, b) => b.growthRate - a.growthRate)[0]?.growthRate || 0}%` : 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={6}>
                                        <Box
                                            sx={{
                                                p: 2,
                                                borderRadius: '10px',
                                                bgcolor: alpha('#ff5252', 0.1),
                                                border: '1px solid rgba(255,82,82,0.2)',
                                                height: '100%'
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                                Trending Down
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff5252', mb: 0.5 }}>
                                                {workoutTrendsData.growthRates.length > 0 ?
                                                    workoutTrendsData.growthRates
                                                        .filter(w => w.growthRate < 0)
                                                        .sort((a, b) => a.growthRate - b.growthRate)[0]?.name || 'N/A' : 'N/A'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#ff5252' }}>
                                                {workoutTrendsData.growthRates.length > 0 ?
                                                    `${workoutTrendsData.growthRates
                                                        .filter(w => w.growthRate < 0)
                                                        .sort((a, b) => a.growthRate - b.growthRate)[0]?.growthRate || 0}%` : 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    Recent Trends ({timeRange})
                                </Typography>

                                <Box sx={{ maxHeight: 240, overflowY: 'auto' }}>
                                    <List dense disablePadding>
                                        {workoutTrendsData.growthRates
                                            .sort((a, b) => Math.abs(b.growthRate) - Math.abs(a.growthRate))
                                            .map((workout, index) => (
                                                <ListItem
                                                    key={workout.name}
                                                    divider={index < workoutTrendsData.growthRates.length - 1}
                                                    sx={{ py: 1 }}
                                                >
                                                    <ListItemText
                                                        primary={
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                    {workout.name}
                                                                </Typography>
                                                                <Chip
                                                                    size="small"
                                                                    icon={workout.growthRate >= 0 ? <TrendingUp fontSize="small" /> : <BarChart fontSize="small" />}
                                                                    label={`${workout.growthRate > 0 ? '+' : ''}${workout.growthRate}%`}
                                                                    sx={{
                                                                        bgcolor: alpha(workout.growthRate >= 0 ? '#4caf50' : '#ff5252', 0.1),
                                                                        color: workout.growthRate >= 0 ? '#4caf50' : '#ff5252',
                                                                        fontWeight: 'bold'
                                                                    }}
                                                                />
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                                                <Box sx={{ flex: 1, height: 4, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                                                                    <Box
                                                                        sx={{
                                                                            height: '100%',
                                                                            width: `${Math.min(100, Math.abs(workout.growthRate))}%`,
                                                                            bgcolor: workout.growthRate >= 0 ? '#4caf50' : '#ff5252',
                                                                            borderRadius: 2
                                                                        }}
                                                                    />
                                                                </Box>
                                                                <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                                                    {workout.currentCount} workouts
                                                                </Typography>
                                                            </Box>
                                                        }
                                                    />
                                                </ListItem>
                                            ))}
                                    </List>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* Comparison Matrix */}
            {activeTab === 4 && (
                <Grid container spacing={3}>
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
                            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CompareArrows sx={{ color: '#ffb800', mr: 1 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Workout Type Comparison Matrix
                                    </Typography>
                                </Box>

                                <Chip
                                    icon={<FilterList />}
                                    label="Top metrics highlighted"
                                    size="small"
                                    sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}
                                />
                            </Box>

                            <TableContainer sx={{ maxHeight: 600 }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600, bgcolor: 'rgba(0,0,0,0.3)' }}>Workout Type</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'rgba(0,0,0,0.3)' }}>Count</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'rgba(0,0,0,0.3)' }}>Avg. Duration</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'rgba(0,0,0,0.3)' }}>Participation</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'rgba(0,0,0,0.3)' }}>Recurrence Rate</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'rgba(0,0,0,0.3)' }}>Top Member</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, bgcolor: 'rgba(0,0,0,0.3)' }}>Growth Rate</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {workoutTypeMatrix.map((workout, index) => (
                                            <TableRow
                                                key={workout.name}
                                                hover
                                                sx={{
                                                    '&:nth-of-type(odd)': {
                                                        backgroundColor: 'rgba(0,0,0,0.05)',
                                                    }
                                                }}
                                            >
                                                <TableCell component="th" scope="row">
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Box
                                                            sx={{
                                                                width: 12,
                                                                height: 12,
                                                                borderRadius: '4px',
                                                                bgcolor: chartColors[index % chartColors.length],
                                                                mr: 1.5
                                                            }}
                                                        />
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {workout.name}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        size="small"
                                                        label={workout.count}
                                                        sx={{
                                                            bgcolor: workout.isTopCount ? alpha('#ffb800', 0.1) : 'rgba(0,0,0,0.2)',
                                                            color: workout.isTopCount ? '#ffb800' : 'inherit',
                                                            fontWeight: workout.isTopCount ? 'bold' : 'normal'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        size="small"
                                                        label={`${workout.avgDuration} mins`}
                                                        sx={{
                                                            bgcolor: workout.isTopDuration ? alpha('#4a148c', 0.1) : 'rgba(0,0,0,0.2)',
                                                            color: workout.isTopDuration ? '#9c27b0' : 'inherit',
                                                            fontWeight: workout.isTopDuration ? 'bold' : 'normal'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        size="small"
                                                        label={`${workout.participationRate}%`}
                                                        sx={{
                                                            bgcolor: workout.isTopParticipation ? alpha('#4caf50', 0.1) : 'rgba(0,0,0,0.2)',
                                                            color: workout.isTopParticipation ? '#4caf50' : 'inherit',
                                                            fontWeight: workout.isTopParticipation ? 'bold' : 'normal'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        size="small"
                                                        label={`${workout.recurrenceRate}x`}
                                                        sx={{
                                                            bgcolor: workout.isTopRecurrence ? alpha('#2196f3', 0.1) : 'rgba(0,0,0,0.2)',
                                                            color: workout.isTopRecurrence ? '#2196f3' : 'inherit',
                                                            fontWeight: workout.isTopRecurrence ? 'bold' : 'normal'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    {workout.topMember ? (
                                                        <Chip
                                                            avatar={
                                                                <Avatar
                                                                    sx={{
                                                                        bgcolor: alpha(chartColors[index % chartColors.length], 0.3),
                                                                        color: chartColors[index % chartColors.length]
                                                                    }}
                                                                >
                                                                    {workout.topMember.name.charAt(0).toUpperCase()}
                                                                </Avatar>
                                                            }
                                                            label={`${workout.topMember.name}`}
                                                            sx={{
                                                                bgcolor: 'rgba(0,0,0,0.2)',
                                                                '& .MuiChip-label': { fontWeight: 500 }
                                                            }}
                                                        />
                                                    ) : (
                                                        "N/A"
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        size="small"
                                                        icon={workout.growthRate >= 0 ? <TrendingUp fontSize="small" /> : <BarChart fontSize="small" />}
                                                        label={`${workout.growthRate > 0 ? '+' : ''}${workout.growthRate}%`}
                                                        sx={{
                                                            bgcolor: alpha(workout.growthRate >= 0 ? '#4caf50' : '#ff5252', 0.1),
                                                            color: workout.growthRate >= 0 ? '#4caf50' : '#ff5252',
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
            )}
        </Box>
    );
};

// Helper functions for data processing

const processWorkoutTypeData = (logs, members, selectedMember, isAdmin) => {
    if (!logs || !logs.length) return [];

    // Filter logs for selected member if applicable
    const filteredLogs = selectedMember !== 'all' && isAdmin
        ? logs.filter(log => log.member_name === selectedMember)
        : logs;

    const workoutTypes = {};
    const memberWorkoutCounts = {};

    // Process logs to count workout types
    filteredLogs.forEach(log => {
        // Track workout type metrics
        if (!workoutTypes[log.workout_name]) {
            workoutTypes[log.workout_name] = {
                name: log.workout_name,
                count: 0,
                totalDuration: 0,
                participants: new Set(),
                memberCounts: {}
            };
        }
        workoutTypes[log.workout_name].count++;
        workoutTypes[log.workout_name].totalDuration += log.duration;
        workoutTypes[log.workout_name].participants.add(log.member_name);

        // Track per-member counts for this workout type
        if (!workoutTypes[log.workout_name].memberCounts[log.member_name]) {
            workoutTypes[log.workout_name].memberCounts[log.member_name] = 0;
        }
        workoutTypes[log.workout_name].memberCounts[log.member_name]++;

        // Track overall member workout counts
        if (!memberWorkoutCounts[log.member_name]) {
            memberWorkoutCounts[log.member_name] = 0;
        }
        memberWorkoutCounts[log.member_name]++;
    });

    // Create final data array with calculated metrics
    return Object.values(workoutTypes).map(workout => {
        // Find the top member for this workout type
        let topMember = null;
        Object.entries(workout.memberCounts).forEach(([memberName, count]) => {
            if (!topMember || count > topMember.count) {
                topMember = { name: memberName, count };
            }
        });

        // Calculate participation rate
        const totalMembers = isAdmin ? members.length : 1;
        const participationRate = Math.round((workout.participants.size / totalMembers) * 100);

        return {
            name: workout.name,
            count: workout.count,
            totalDuration: workout.totalDuration,
            avgDuration: Math.round(workout.totalDuration / workout.count),
            participantCount: workout.participants.size,
            participationRate,
            topMember
        };
    }).sort((a, b) => b.count - a.count);
};

const processWorkoutDurationData = (logs, selectedMember, isAdmin) => {
    if (!logs || !logs.length) return [];

    // Filter logs for selected member if applicable
    const filteredLogs = selectedMember !== 'all' && isAdmin
        ? logs.filter(log => log.member_name === selectedMember)
        : logs;

    const workoutDurations = {};

    // Process logs to gather duration data
    filteredLogs.forEach(log => {
        if (!workoutDurations[log.workout_name]) {
            workoutDurations[log.workout_name] = {
                name: log.workout_name,
                count: 0,
                totalDuration: 0
            };
        }
        workoutDurations[log.workout_name].count++;
        workoutDurations[log.workout_name].totalDuration += log.duration;
    });

    // Calculate average durations
    return Object.values(workoutDurations).map(workout => ({
        name: workout.name,
        count: workout.count,
        totalDuration: workout.totalDuration,
        avgDuration: Math.round(workout.totalDuration / workout.count)
    })).sort((a, b) => b.avgDuration - a.avgDuration);
};

const processWorkoutParticipationData = (logs, members, selectedMember, isAdmin) => {
    if (!logs || !logs.length || !members || !members.length) return [];

    // If viewing as a specific member, participation data doesn't make sense
    if (!isAdmin || selectedMember !== 'all') {
        return [];
    }

    const workoutParticipation = {};

    // Process logs to track participation
    logs.forEach(log => {
        if (!workoutParticipation[log.workout_name]) {
            workoutParticipation[log.workout_name] = {
                name: log.workout_name,
                participants: new Set(),
                count: 0,
                memberWorkoutCounts: {}
            };
        }
        workoutParticipation[log.workout_name].participants.add(log.member_name);
        workoutParticipation[log.workout_name].count++;

        // Track how many times each member did this workout
        if (!workoutParticipation[log.workout_name].memberWorkoutCounts[log.member_name]) {
            workoutParticipation[log.workout_name].memberWorkoutCounts[log.member_name] = 0;
        }
        workoutParticipation[log.workout_name].memberWorkoutCounts[log.member_name]++;
    });

    // Calculate participation rates and other metrics
    return Object.values(workoutParticipation).map(workout => {
        const participantCount = workout.participants.size;
        const participationRate = Math.round((participantCount / members.length) * 100);

        // Calculate average workouts per participant
        let totalWorkoutsByParticipants = 0;
        Object.values(workout.memberWorkoutCounts).forEach(count => {
            totalWorkoutsByParticipants += count;
        });
        const avgFrequencyPerParticipant = participantCount > 0
            ? Math.round((totalWorkoutsByParticipants / participantCount) * 10) / 10
            : 0;

        return {
            name: workout.name,
            participantCount,
            participationRate,
            avgFrequencyPerParticipant,
            totalWorkouts: workout.count
        };
    }).sort((a, b) => b.participationRate - a.participationRate);
};

const processWorkoutTrendsData = (logs, workouts, timeRange, selectedMember, isAdmin) => {
    if (!logs || !logs.length) return { periodData: [], workoutTrends: [], growthRates: [] };

    // Filter logs for selected member if applicable
    const filteredLogs = selectedMember !== 'all' && isAdmin
        ? logs.filter(log => log.member_name === selectedMember)
        : logs;

    // Configure time periods based on selected range
    const now = new Date();
    let periods = [];
    // let periodFormat = '';

    if (timeRange === 'month') {
        // For month view, split into weeks
        // periodFormat = 'Week';
        const weeksInMonth = 4;
        for (let i = 0; i < weeksInMonth; i++) {
            periods.push(`Week ${i + 1}`);
        }
    } else if (timeRange === 'quarter') {
        // For quarter view, split into months
        // periodFormat = 'Month';
        const monthsInQuarter = 3;
        for (let i = 0; i < monthsInQuarter; i++) {
            const month = new Date(now.getFullYear(), now.getMonth() - 2 + i, 1);
            periods.push(month.toLocaleDateString('default', { month: 'short' }));
        }
    } else if (timeRange === 'year') {
        // For year view, split into quarters
        // periodFormat = 'Quarter';
        for (let i = 0; i < 4; i++) {
            periods.push(`Q${i + 1}`);
        }
    }

    // Determine the start date for the current period
    const getStartDate = () => {
        const date = new Date();
        if (timeRange === 'month') {
            date.setDate(1);
        } else if (timeRange === 'quarter') {
            const quarterStart = Math.floor(date.getMonth() / 3) * 3;
            date.setMonth(quarterStart);
            date.setDate(1);
        } else if (timeRange === 'year') {
            date.setMonth(0);
            date.setDate(1);
        }
        return date;
    };

    // Determine the start date for the previous period
    const getPrevPeriodStartDate = () => {
        const date = getStartDate();
        if (timeRange === 'month') {
            date.setMonth(date.getMonth() - 1);
        } else if (timeRange === 'quarter') {
            date.setMonth(date.getMonth() - 3);
        } else if (timeRange === 'year') {
            date.setFullYear(date.getFullYear() - 1);
        }
        return date;
    };

    // Assign each log to its period
    const getPeriodForDate = (dateStr) => {
        const date = new Date(dateStr);
        const startDate = getStartDate();

        if (timeRange === 'month') {
            // Determine which week of the month
            const dayOfMonth = date.getDate();
            const weekNum = Math.ceil(dayOfMonth / 7);
            return weekNum <= 4 ? `Week ${weekNum}` : 'Week 4';
        } else if (timeRange === 'quarter') {
            // Determine which month of the quarter
            const quarterStartMonth = Math.floor(startDate.getMonth() / 3) * 3;
            const monthIndex = date.getMonth();
            const quarterMonthIndex = (monthIndex - quarterStartMonth + 12) % 12;
            if (quarterMonthIndex >= 0 && quarterMonthIndex < 3) {
                const month = new Date(date.getFullYear(), date.getMonth(), 1);
                return month.toLocaleDateString('default', { month: 'short' });
            }
            return null; // Outside the quarter
        } else if (timeRange === 'year') {
            // Determine which quarter of the year
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            return `Q${quarter}`;
        }
        return null;
    };

    // Process logs by workout type and period
    const workoutTrends = [];
    const workoutCounts = {};
    const prevPeriodWorkoutCounts = {};

    // Initialize workout types
    workouts.forEach(workout => {
        workoutTrends.push({
            name: workout.workout_name,
            data: periods.map(period => ({ period, count: 0 }))
        });
        workoutCounts[workout.workout_name] = 0;
        prevPeriodWorkoutCounts[workout.workout_name] = 0;
    });

    // Count workout logs for current period
    const currentStart = getStartDate();
    const prevPeriodStart = getPrevPeriodStartDate();

    filteredLogs.forEach(log => {
        const logDate = new Date(log.date);

        // Check if in current period
        if (logDate >= currentStart) {
            const period = getPeriodForDate(log.date);
            if (period) {
                // Add to period data
                const workoutIndex = workoutTrends.findIndex(w => w.name === log.workout_name);
                if (workoutIndex >= 0) {
                    const periodIndex = periods.indexOf(period);
                    if (periodIndex >= 0) {
                        workoutTrends[workoutIndex].data[periodIndex].count++;
                    }
                }

                // Add to total count for current period
                workoutCounts[log.workout_name] = (workoutCounts[log.workout_name] || 0) + 1;
            }
        }
        // Check if in previous period
        else if (logDate >= prevPeriodStart && logDate < currentStart) {
            prevPeriodWorkoutCounts[log.workout_name] = (prevPeriodWorkoutCounts[log.workout_name] || 0) + 1;
        }
    });

    // Calculate growth rates
    const growthRates = Object.keys(workoutCounts).map(name => {
        const currentCount = workoutCounts[name] || 0;
        const prevCount = prevPeriodWorkoutCounts[name] || 0;
        let growthRate = 0;

        if (prevCount > 0) {
            growthRate = Math.round(((currentCount - prevCount) / prevCount) * 100);
        } else if (currentCount > 0) {
            growthRate = 100; // New workout (infinite growth represented as 100%)
        }

        return {
            name,
            currentCount,
            prevCount,
            growthRate
        };
    }).sort((a, b) => b.growthRate - a.growthRate);

    return {
        periodData: periods.map(period => ({ period })),
        workoutTrends,
        growthRates
    };
};

const calculateWorkoutTypeMatrix = (logs, selectedMember, isAdmin) => {
    // Combine data from other processing functions
    const typeData = processWorkoutTypeData(logs, [], selectedMember, isAdmin);
    const durationData = processWorkoutDurationData(logs, selectedMember, isAdmin);
    const participationData = processWorkoutParticipationData(logs, [], selectedMember, isAdmin);
    const trendData = processWorkoutTrendsData(logs, [], 'month', selectedMember, isAdmin);

    // Get top metrics for highlighting
    const topCount = typeData.length > 0 ? Math.max(...typeData.map(w => w.count)) : 0;
    const topDuration = durationData.length > 0 ? Math.max(...durationData.map(w => w.avgDuration)) : 0;
    const topParticipation = participationData.length > 0 ? Math.max(...participationData.map(w => w.participationRate)) : 0;

    // Calculate recurrence rate (avg workouts per participant)
    const workoutRecurrence = {};
    logs.forEach(log => {
        if (!workoutRecurrence[log.workout_name]) {
            workoutRecurrence[log.workout_name] = {
                totalWorkouts: 0,
                participants: new Set()
            };
        }
        workoutRecurrence[log.workout_name].totalWorkouts++;
        workoutRecurrence[log.workout_name].participants.add(log.member_name);
    });

    const recurrenceRates = Object.keys(workoutRecurrence).map(name => {
        const data = workoutRecurrence[name];
        const rate = data.participants.size > 0
            ? Math.round((data.totalWorkouts / data.participants.size) * 10) / 10
            : 0;
        return { name, rate };
    });

    const topRecurrence = recurrenceRates.length > 0 ? Math.max(...recurrenceRates.map(w => w.rate)) : 0;

    // Combine into unified matrix
    return typeData.map(workout => {
        // Get additional data
        const durationItem = durationData.find(w => w.name === workout.name) || { avgDuration: 0 };
        const participationItem = participationData.find(w => w.name === workout.name) || { participationRate: 0 };
        const trendItem = trendData.growthRates.find(w => w.name === workout.name) || { growthRate: 0 };
        const recurrenceItem = recurrenceRates.find(w => w.name === workout.name) || { rate: 0 };

        return {
            name: workout.name,
            count: workout.count,
            avgDuration: durationItem.avgDuration,
            participationRate: participationItem.participationRate,
            recurrenceRate: recurrenceItem.rate,
            topMember: workout.topMember,
            growthRate: trendItem.growthRate,

            // Flags for highlighting top metrics
            isTopCount: workout.count === topCount,
            isTopDuration: durationItem.avgDuration === topDuration,
            isTopParticipation: participationItem.participationRate === topParticipation,
            isTopRecurrence: recurrenceItem.rate === topRecurrence
        };
    });
};

// Additional utility functions

const calculateDurationDistribution = (logs) => {
    if (!logs || !logs.length) return [];

    // Define duration ranges
    const ranges = [
        { min: 0, max: 15, label: 'Short (0-15 mins)' },
        { min: 16, max: 30, label: 'Medium (16-30 mins)' },
        { min: 31, max: 60, label: 'Long (31-60 mins)' },
        { min: 61, max: 90, label: 'Extended (61-90 mins)' },
        { min: 91, max: Number.MAX_SAFE_INTEGER, label: 'Marathon (90+ mins)' }
    ];

    // Count logs in each range
    const distribution = ranges.map(range => ({ ...range, count: 0 }));

    logs.forEach(log => {
        const rangeIndex = distribution.findIndex(range =>
            log.duration >= range.min && log.duration <= range.max
        );
        if (rangeIndex >= 0) {
            distribution[rangeIndex].count++;
        }
    });

    // Calculate percentages
    const totalWorkouts = logs.length;
    distribution.forEach(range => {
        range.percentage = (range.count / totalWorkouts) * 100;
    });

    return distribution;
};

const calculateDurationStats = (logs) => {
    if (!logs || !logs.length) return [];

    const durations = logs.map(log => log.duration);

    // Calculate statistics
    const sum = durations.reduce((acc, val) => acc + val, 0);
    const avg = Math.round(sum / durations.length);
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    // Calculate median
    const sortedDurations = [...durations].sort((a, b) => a - b);
    const middle = Math.floor(sortedDurations.length / 2);
    const median = sortedDurations.length % 2 === 0
        ? Math.round((sortedDurations[middle - 1] + sortedDurations[middle]) / 2)
        : sortedDurations[middle];

    return [
        { label: 'Average', value: avg, color: '#ffb800' },
        { label: 'Median', value: median, color: '#4a148c' },
        { label: 'Min', value: min, color: '#4caf50' },
        { label: 'Max', value: max, color: '#ff5252' }
    ];
};

const getActiveMemberCount = (logs) => {
    if (!logs || !logs.length) return 0;
    return new Set(logs.map(log => log.member_name)).size;
};

const getAverageWorkoutTypes = (logs, members) => {
    if (!logs || !logs.length || !members || !members.length) return 0;

    const memberWorkoutTypes = {};

    logs.forEach(log => {
        if (!memberWorkoutTypes[log.member_name]) {
            memberWorkoutTypes[log.member_name] = new Set();
        }
        memberWorkoutTypes[log.member_name].add(log.workout_name);
    });

    const activeMembers = Object.keys(memberWorkoutTypes).length;
    if (activeMembers === 0) return 0;

    const totalUniqueTypes = Object.values(memberWorkoutTypes)
        .reduce((sum, types) => sum + types.size, 0);

    return totalUniqueTypes / activeMembers;
};

const getMostDiverseMember = (logs) => {
    if (!logs || !logs.length) return null;

    const memberWorkoutTypes = {};

    logs.forEach(log => {
        if (!memberWorkoutTypes[log.member_name]) {
            memberWorkoutTypes[log.member_name] = new Set();
        }
        memberWorkoutTypes[log.member_name].add(log.workout_name);
    });

    let mostDiverseMember = null;
    let maxTypes = 0;

    Object.entries(memberWorkoutTypes).forEach(([name, types]) => {
        if (types.size > maxTypes) {
            mostDiverseMember = name;
            maxTypes = types.size;
        }
    });

    return mostDiverseMember ? { name: mostDiverseMember, types: maxTypes } : null;
};

const getMemberEngagementData = (logs, workouts) => {
    if (!logs || !logs.length || !workouts || !workouts.length) return [];

    const memberData = {};
    const workoutTypesCount = workouts.length;

    logs.forEach(log => {
        if (!memberData[log.member_name]) {
            memberData[log.member_name] = {
                name: log.member_name,
                uniqueWorkoutTypes: new Set(),
                totalWorkouts: 0
            };
        }
        memberData[log.member_name].uniqueWorkoutTypes.add(log.workout_name);
        memberData[log.member_name].totalWorkouts++;
    });

    return Object.values(memberData).map(member => ({
        name: member.name,
        uniqueWorkoutTypes: member.uniqueWorkoutTypes.size,
        totalWorkouts: member.totalWorkouts,
        coveragePercentage: Math.round((member.uniqueWorkoutTypes.size / workoutTypesCount) * 100)
    })).sort((a, b) => b.uniqueWorkoutTypes - a.uniqueWorkoutTypes);
};

export default WorkoutTypesDashboard;
