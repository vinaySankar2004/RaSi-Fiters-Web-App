import React, { useState, useEffect, useCallback } from "react";
import {
    Box,
    Grid,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Avatar,
    Chip,
    alpha,
    useTheme,
    Alert,
    IconButton,
    Tooltip
} from "@mui/material";
import {
    DateRange,
    FilterAlt,
    EmojiEvents,
    InfoOutlined
} from "@mui/icons-material";
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

import { LoadingPlaceholder } from "./AnalyticsComponents";
import { compactCalendarStyles } from "../common/CalendarStyles";

const DateRangeDashboard = ({ workoutLogs, members, workouts, selectedMember, isAdmin, memberName, loading }) => {
    const theme = useTheme();
    const chartColors = theme.palette.chart.colors;

    // Date range state
    const [startDate, setStartDate] = useState(getDefaultStartDate());
    const [endDate, setEndDate] = useState(getDefaultEndDate());
    const [isFiltering, setIsFiltering] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [error, setError] = useState(null);

    // Function to get default start date (March 1, 2025)
    function getDefaultStartDate() {
        return '2025-03-01';
    }

    // Function to get default end date (today's local date)
    function getDefaultEndDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Helper function to compare dates as strings (YYYY-MM-DD or DD-MM-YYYY)
    const compareDates = useCallback((dateA, dateB) => {
        // Convert DD-MM-YYYY to YYYY-MM-DD if needed
        const normalizeDate = (dateStr) => {
            if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
                const [day, month, year] = dateStr.split('-');
                return `${year}-${month}-${day}`;
            }
            return dateStr;
        };

        return normalizeDate(dateA) >= normalizeDate(dateB);
    }, []);

    // Calculate longest streak using string comparison
    const calculateLongestStreak = useCallback((logs, memberName) => {
        if (!logs || logs.length === 0) return 0;

        // Get logs for specific member, sorted by date
        const memberLogs = logs
            .filter(log => log.member_name === memberName);

        if (memberLogs.length === 0) return 0;

        // Get unique workout dates
        const workoutDates = [...new Set(memberLogs.map(log => log.date))];

        // Sort dates (assuming YYYY-MM-DD format)
        workoutDates.sort();

        let currentStreak = 1;
        let longestStreak = 1;

        // Calculate longest streak
        for (let i = 1; i < workoutDates.length; i++) {
            // Check if dates are consecutive by comparing the difference in days
            const date1Parts = workoutDates[i-1].split(/[-T]/);
            const date2Parts = workoutDates[i].split(/[-T]/);

            const date1 = new Date(`${date1Parts[0]}-${date1Parts[1]}-${date1Parts[2]}`);
            const date2 = new Date(`${date2Parts[0]}-${date2Parts[1]}-${date2Parts[2]}`);

            // Calculate difference in days
            const diffTime = Math.abs(date2 - date1);
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                currentStreak++;
                longestStreak = Math.max(longestStreak, currentStreak);
            } else if (diffDays > 1) {
                currentStreak = 1; // Reset streak
            }
        }

        return longestStreak;
    }, []);

    // Process filtered data to calculate metrics - memoized
    const processFilteredData = useCallback((logs, validMembers) => {
        // Create a map to store member stats
        const memberMap = {};

        // Initialize map with all valid members
        validMembers.forEach(member => {
            memberMap[member.member_name] = {
                name: member.member_name,
                memberObj: member,
                workoutCount: 0,
                totalDuration: 0,
                activeDays: new Set(),
                workoutTypes: new Set(),
                logs: []
            };
        });

        // Process logs to calculate metrics
        logs.forEach(log => {
            if (memberMap[log.member_name]) {
                memberMap[log.member_name].workoutCount++;
                memberMap[log.member_name].totalDuration += log.duration;
                memberMap[log.member_name].activeDays.add(log.date);
                memberMap[log.member_name].workoutTypes.add(log.workout_name);
                memberMap[log.member_name].logs.push(log);
            }
        });

        // Convert map to array and calculate derived metrics
        return Object.values(memberMap)
            .map(member => {
                // Calculate longest streak for this member within filtered logs
                const longestStreak = calculateLongestStreak(logs, member.name);

                return {
                    name: member.name,
                    memberObj: member.memberObj,
                    workoutCount: member.workoutCount,
                    totalDuration: member.totalDuration,
                    averageDuration: member.workoutCount > 0 ? Math.round(member.totalDuration / member.workoutCount) : 0,
                    activeDays: member.activeDays.size,
                    uniqueWorkoutTypes: member.workoutTypes.size,
                    longestStreak: longestStreak,
                    logs: member.logs
                };
            })
            .sort((a, b) => b.workoutCount - a.workoutCount);
    }, [calculateLongestStreak]);

    // Function to filter data based on date range and member selection - memoized
    const filterData = useCallback(() => {
        setIsFiltering(true);
        setError(null);

        try {
            // Validate date range
            if (startDate > endDate) {
                setError("Start date cannot be after end date");
                setIsFiltering(false);
                return;
            }

            // Filter members based on join date (only for admin with all members)
            let validMembers = members;
            if (isAdmin && selectedMember === 'all') {
                validMembers = members.filter(member => {
                    // If date_joined is not available, default to include the member
                    if (!member.date_joined) return true;

                    // Include member if their join date is on or before the end date
                    return compareDates(endDate, member.date_joined);
                });
            }

            // Filter workout logs based on date range
            let filteredLogs = workoutLogs.filter(log => {
                return log.date >= startDate && log.date <= endDate;
            });

            // If specific member is selected (either by admin or regular user)
            if (selectedMember !== 'all') {
                const effectiveMemberName = isAdmin ? selectedMember : memberName;
                filteredLogs = filteredLogs.filter(log => log.member_name === effectiveMemberName);
            }

            // Process member stats with filtered logs
            const memberStats = processFilteredData(filteredLogs, validMembers);

            setFilteredData(memberStats);
            setIsFiltering(false);
        } catch (error) {
            console.error("Error filtering data:", error);
            setError("Failed to filter data. Please try again.");
            setIsFiltering(false);
        }
    }, [startDate, endDate, members, workoutLogs, selectedMember, isAdmin, memberName, compareDates, processFilteredData]);

    // Effect to filter data when date range or selected member changes
    useEffect(() => {
        filterData();
    }, []);

    // Handle date change for start date
    const handleStartDateChange = (newDate) => {
        if (newDate) {
            const dateString = newDate.format('YYYY-MM-DD');
            setStartDate(dateString);
        }
    };

    // Handle date change for end date
    const handleEndDateChange = (newDate) => {
        if (newDate) {
            const dateString = newDate.format('YYYY-MM-DD');
            setEndDate(dateString);
        }
    };

    // Handle filter button click
    const handleFilter = () => {
        filterData();
    };

    // Render individual member details
    const renderMemberDetails = () => {
        const effectiveMemberName = isAdmin ? selectedMember : memberName;
        const memberData = filteredData.find(m => m.name === effectiveMemberName);

        if (!memberData || memberData.workoutCount === 0) {
            return (
                <Alert severity="info" sx={{
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    color: 'primary.main',
                    border: '1px solid rgba(33, 150, 243, 0.2)',
                    mt: 2
                }}>
                    No workouts found for {effectiveMemberName} in the selected date range.
                </Alert>
            );
        }

        return (
            <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Workout Details for {effectiveMemberName}
                </Typography>

                <TableContainer component={Paper} sx={{ mb: 3, borderRadius: '16px' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ background: 'rgba(0,0,0,0.15)' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Workout</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Duration (mins)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {memberData.logs
                                .sort((a, b) => b.date.localeCompare(a.date)) // Sort by date string
                                .map((log, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{log.date}</TableCell>
                                        <TableCell>{log.workout_name}</TableCell>
                                        <TableCell align="center">{log.duration}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    };

    // Render loading state
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

    // Custom styles for the date picker component

    // Custom styles for the input fields
    const inputFieldStyles = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            backgroundColor: 'rgba(30, 30, 30, 0.8)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #ffb800',
            color: 'white',
            '& fieldset': {
                borderColor: 'rgba(255, 184, 0, 0.5)',
            },
            '&:hover fieldset': {
                borderColor: '#ffb800',
            },
            '&.Mui-focused fieldset': {
                borderColor: '#ffb800',
                borderWidth: 2,
            },
            '& .MuiOutlinedInput-input': {
                padding: '12px 14px',
                color: 'white',
            },
            '& .MuiSvgIcon-root': {
                color: 'white',
            },
        },
        '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.7)',
            backgroundColor: 'rgba(30, 30, 30, 0.8)',
            padding: '0 4px',
            marginLeft: '-4px',
            borderRadius: '4px',
            '&.Mui-focused': {
                color: '#ffb800',
            }
        }
    };

    return (
        <Box sx={{ py: 2 }}>
            {/* Date Range Filter */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    background: 'rgba(30,30,30,0.6)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DateRange sx={{ color: '#ffb800', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Date Range Filter
                    </Typography>
                </Box>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4} md={3}>
                            <DesktopDatePicker
                                label="Start Date"
                                value={startDate ? dayjs(startDate) : null}
                                onChange={handleStartDateChange}
                                closeOnSelect={true}
                                format="MM/DD/YYYY"
                                sx={compactCalendarStyles}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        sx: inputFieldStyles
                                    },
                                    popper: {
                                        placement: "bottom-start",
                                        disablePortal: false,
                                        modifiers: [
                                            {
                                                name: "offset",
                                                options: {
                                                    offset: [0, 8],
                                                },
                                            },
                                            {
                                                name: "flip",
                                                enabled: false, // Disable the flip behavior to force dropdown below
                                            },
                                            {
                                                name: "preventOverflow",
                                                options: {
                                                    boundary: document.body,
                                                },
                                            }
                                        ]
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4} md={3}>
                            <DesktopDatePicker
                                label="End Date"
                                value={endDate ? dayjs(endDate) : null}
                                onChange={handleEndDateChange}
                                closeOnSelect={true}
                                format="MM/DD/YYYY"
                                sx={compactCalendarStyles}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        sx: inputFieldStyles
                                    },
                                    popper: {
                                        placement: "bottom-start",
                                        disablePortal: false,
                                        modifiers: [
                                            {
                                                name: "offset",
                                                options: {
                                                    offset: [0, 8],
                                                },
                                            },
                                            {
                                                name: "flip",
                                                enabled: false, // Disable the flip behavior to force dropdown below
                                            },
                                            {
                                                name: "preventOverflow",
                                                options: {
                                                    boundary: document.body,
                                                },
                                            }
                                        ]
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4} md={2}>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<FilterAlt />}
                                onClick={handleFilter}
                                disabled={isFiltering}
                                sx={{
                                    py: 1.5,
                                    background: 'linear-gradient(45deg, #ffb800 30%, #ff9d00 90%)',
                                    color: '#111',
                                    borderRadius: '10px',
                                    boxShadow: '0 4px 20px rgba(255,184,0,0.25)',
                                    fontWeight: 600,
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #ffce00 30%, #ffb800 90%)',
                                    }
                                }}
                            >
                                Apply Filter
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary', ml: { md: 2 } }}>
                                Showing data from {startDate} to {endDate}
                            </Typography>
                        </Grid>
                    </Grid>
                </LocalizationProvider>

                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mt: 2,
                            backgroundColor: 'rgba(211, 47, 47, 0.1)',
                            color: '#ff5252',
                            border: '1px solid rgba(211, 47, 47, 0.2)',
                            '& .MuiAlert-icon': {
                                color: '#ff5252'
                            }
                        }}
                    >
                        {error}
                    </Alert>
                )}
            </Paper>

            {/* Performance Metrics */}
            {isAdmin && selectedMember === 'all' ? (
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
                    <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FilterAlt sx={{ color: '#ffb800', mr: 1 }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Member Performance Metrics
                            </Typography>
                        </Box>
                        <Tooltip title="Only includes members who joined on or before the end date">
                            <IconButton size="small" sx={{ color: 'text.secondary' }}>
                                <InfoOutlined fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ background: 'rgba(0,0,0,0.15)' }}>
                                    <TableCell sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Member</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Workouts</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Total Duration</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Avg. Duration</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Active Days</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Workout Types</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Longest Streak</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData.length > 0 ? (
                                    filteredData.map((member, index) => (
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
                                                    icon={<EmojiEvents />}
                                                    label={member.longestStreak}
                                                    sx={{
                                                        bgcolor: alpha('#ff5252', 0.1),
                                                        color: '#ff5252',
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            No data available for the selected date range
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            ) : (
                // Individual member view
                renderMemberDetails()
            )}
        </Box>
    );
}

export default DateRangeDashboard;
