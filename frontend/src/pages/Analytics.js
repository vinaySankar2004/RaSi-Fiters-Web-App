import React, {useState, useEffect, useCallback} from "react";
import {
    Container,
    Typography,
    Box,
    Tabs,
    Tab,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Fade,
    CssBaseline,
    ThemeProvider,
    Button
} from "@mui/material";
import {
    Refresh,
    Dashboard,
    Group,
    FitnessCenter,
    Timeline,
    ArrowDropDown,
    InfoOutlined
} from "@mui/icons-material";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

// Import dashboard components
import OverviewDashboard from "../components/analytics/OverviewDashboard";
import MemberDashboard from "../components/analytics/MemberDashboard";
import WorkoutTypesDashboard from "../components/analytics/WorkoutTypesDashboard";
import TrendsDashboard from "../components/analytics/TrendsDashboard";

// Import theme and styles
import { createTheme } from "@mui/material";

// Create analytics theme with glassmorphism and dark mode
const analyticsTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#ffb800',
            light: '#ffce00',
            dark: '#ff9d00',
            contrastText: '#111111',
        },
        secondary: {
            main: '#4a148c',
            light: '#7c43bd',
            dark: '#38006b',
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
        text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
        },
        chart: {
            colors: [
                '#ffb800', '#4a148c', '#ff5252', '#4caf50',
                '#2196f3', '#ff9800', '#9c27b0', '#00bcd4'
            ]
        }
    },
    typography: {
        fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 800,
        },
        h2: {
            fontWeight: 700,
        },
        h3: {
            fontWeight: 700,
        },
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
        button: {
            fontWeight: 600,
            textTransform: 'none',
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarWidth: 'thin',
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: '#1e1e1e',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(255,184,0,0.3)',
                        borderRadius: '20px',
                        '&:hover': {
                            backgroundColor: 'rgba(255,184,0,0.5)',
                        },
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 50,
                    textTransform: 'none',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    background: 'rgba(30,30,30,0.6)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    backgroundImage: 'none',
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    borderRadius: '8px 8px 0 0',
                    '&.Mui-selected': {
                        color: '#ffb800',
                    }
                }
            }
        },
        MuiTabs: {
            styleOverrides: {
                indicator: {
                    backgroundColor: '#ffb800',
                    height: 3,
                    borderRadius: '3px 3px 0 0'
                }
            }
        },
        MuiSelect: {
            styleOverrides: {
                select: {
                    borderRadius: '10px',
                }
            }
        },
        MuiFormControl: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: 'rgba(255,255,255,0.1)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(255,184,0,0.3)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#ffb800',
                        },
                    },
                }
            }
        }
    },
});

const Analytics = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const memberName = user?.member_name;

    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('month'); // month, quarter, year
    const [members, setMembers] = useState([]);
    const [workouts, setWorkouts] = useState([]);
    const [workoutLogs, setWorkoutLogs] = useState([]);
    const [selectedMember, setSelectedMember] = useState('all');
    const [isTimeRangeMenuOpen, setIsTimeRangeMenuOpen] = useState(false);

    // Tab labels and icons
    const tabData = [
        { label: "Overview", icon: <Dashboard sx={{ mr: 1 }} /> },
        { label: "Members", icon: <Group sx={{ mr: 1 }} /> },
        { label: "Workout Types", icon: <FitnessCenter sx={{ mr: 1 }} /> },
        { label: "Trends", icon: <Timeline sx={{ mr: 1 }} /> }
    ];

    const fetchData = useCallback(async () => {
        setLoading(true);
        setFetching(true);
        setError(null);

        try {
            // Fetch members
            const membersData = await api.getMembers();
            setMembers(Array.isArray(membersData) ? membersData : []);

            // Fetch workouts
            const workoutsData = await api.getWorkouts();
            setWorkouts(Array.isArray(workoutsData) ? workoutsData : []);

            // Fetch workout logs for specific member or all members
            let logsData = [];
            if (isAdmin) {
                // For admin, collect logs for all members
                const promises = membersData.map(member =>
                    api.getAllWorkoutLogs(member.member_name)
                        .catch(err => {
                            console.error(`Error fetching logs for ${member.member_name}:`, err);
                            return [];
                        })
                );
                const allLogs = await Promise.all(promises);
                logsData = allLogs.flat();
            } else {
                // For regular member, just get their own logs
                logsData = await api.getAllWorkoutLogs(memberName);
            }

            setWorkoutLogs(logsData);
        } catch (error) {
            console.error("Error fetching analytics data:", error);
            setError("Failed to load analytics data. Please try again later.");
        } finally {
            setLoading(false);
            setFetching(false);
        }
    }, [isAdmin, memberName]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleTimeRangeChange = (event) => {
        setTimeRange(event.target.value);
        setIsTimeRangeMenuOpen(false);
    };

    const handleMemberChange = (event) => {
        setSelectedMember(event.target.value);
    };

    const handleRefresh = () => {
        fetchData();
    };

    const handleTimeRangeClick = () => {
        setIsTimeRangeMenuOpen(!isTimeRangeMenuOpen);
    };

    // Common props for all dashboard components
    const dashboardProps = {
        workoutLogs,
        members,
        workouts,
        timeRange,
        selectedMember,
        isAdmin,
        memberName,
        loading: fetching
    };

    // Render tab content based on selected tab
    const renderTabContent = () => {
        switch (tabValue) {
            case 0:
                return <OverviewDashboard {...dashboardProps} />;
            case 1:
                return <MemberDashboard {...dashboardProps} />;
            case 2:
                return <WorkoutTypesDashboard {...dashboardProps} />;
            case 3:
                return <TrendsDashboard {...dashboardProps} />;
            default:
                return <OverviewDashboard {...dashboardProps} />;
        }
    };

    return (
        <ThemeProvider theme={analyticsTheme}>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100vh',
                    backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(25, 25, 25, 0.9) 0%, rgba(18, 18, 18, 1) 90%)',
                    position: 'relative',
                    pb: 4,
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '20%',
                        left: '10%',
                        width: '50%',
                        height: '60%',
                        background: 'radial-gradient(ellipse, rgba(255,184,0,0.03) 0%, transparent 70%)',
                        zIndex: 0
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '10%',
                        right: '5%',
                        width: '30%',
                        height: '40%',
                        background: 'radial-gradient(ellipse, rgba(74,20,140,0.03) 0%, transparent 70%)',
                        zIndex: 0
                    }
                }}
            >
                <NavbarLoggedIn />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: 10, pb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Typography
                            variant="h3"
                            sx={{ color: '#ffb800', fontWeight: 700 }}
                        >
                            Analytics Dashboard
                        </Typography>
                        <IconButton
                            onClick={handleRefresh}
                            sx={{ color: '#ffb800' }}
                            disabled={fetching}
                        >
                            {fetching ? (
                                <CircularProgress size={24} color="primary" />
                            ) : (
                                <Refresh />
                            )}
                        </IconButton>
                    </Box>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
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

                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: { xs: 'stretch', sm: 'center' },
                        mb: 3,
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2
                    }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            textColor="primary"
                            indicatorColor="primary"
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                '& .MuiTab-root': {
                                    fontWeight: 600,
                                    color: 'text.secondary',
                                    minHeight: '48px',
                                    py: 1,
                                    '&.Mui-selected': {
                                        color: 'primary.main'
                                    }
                                }
                            }}
                        >
                            {tabData.map((tab, index) => (
                                <Tab
                                    key={index}
                                    label={tab.label}
                                    icon={tab.icon}
                                    iconPosition="start"
                                />
                            ))}
                        </Tabs>

                        <Box sx={{
                            display: 'flex',
                            gap: 2,
                            ml: { sm: 'auto' },
                            flexWrap: { xs: 'wrap', sm: 'nowrap' },
                            justifyContent: { xs: 'center', sm: 'flex-end' },
                        }}>
                            <Box sx={{ position: 'relative' }}>
                                <Button
                                    variant="outlined"
                                    endIcon={<ArrowDropDown />}
                                    onClick={handleTimeRangeClick}
                                    sx={{
                                        borderColor: 'rgba(255,255,255,0.2)',
                                        borderRadius: '10px',
                                        minWidth: 120,
                                        textTransform: 'capitalize',
                                        '&:hover': {
                                            borderColor: 'rgba(255,184,0,0.5)',
                                            backgroundColor: 'rgba(255,184,0,0.05)'
                                        }
                                    }}
                                >
                                    {timeRange}
                                </Button>
                                {isTimeRangeMenuOpen && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            mt: 1,
                                            width: 150,
                                            backgroundColor: 'rgba(30,30,30,0.95)',
                                            backdropFilter: 'blur(10px)',
                                            borderRadius: '10px',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            zIndex: 10,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {['month', 'quarter', 'year'].map((option) => (
                                            <Box
                                                key={option}
                                                sx={{
                                                    py: 1.5,
                                                    px: 2,
                                                    cursor: 'pointer',
                                                    textTransform: 'capitalize',
                                                    backgroundColor: timeRange === option ? 'rgba(255,184,0,0.1)' : 'transparent',
                                                    color: timeRange === option ? '#ffb800' : 'text.primary',
                                                    '&:hover': {
                                                        backgroundColor: timeRange === option ? 'rgba(255,184,0,0.15)' : 'rgba(255,255,255,0.05)'
                                                    }
                                                }}
                                                onClick={() => handleTimeRangeChange({ target: { value: option } })}
                                            >
                                                {option}
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>

                            {isAdmin && (
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel id="member-select-label">Member</InputLabel>
                                    <Select
                                        labelId="member-select-label"
                                        value={selectedMember}
                                        label="Member"
                                        onChange={handleMemberChange}
                                        sx={{
                                            borderRadius: '10px',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'rgba(255,255,255,0.2)'
                                            }
                                        }}
                                    >
                                        <MenuItem value="all">All Members</MenuItem>
                                        {members.map(member => (
                                            <MenuItem key={member.id} value={member.member_name}>
                                                {member.member_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                        </Box>
                    </Box>

                    {loading && !workoutLogs.length ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                            <CircularProgress color="primary" size={60} thickness={4} />
                            <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
                                Loading analytics data...
                            </Typography>
                        </Box>
                    ) : workoutLogs.length === 0 ? (
                        <Box
                            sx={{
                                py: 8,
                                textAlign: 'center',
                                backgroundColor: 'rgba(30,30,30,0.6)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.05)',
                            }}
                        >
                            <InfoOutlined sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                                No workout data available
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 500, mx: 'auto', mb: 3 }}>
                                {isAdmin
                                    ? "There are no workout logs recorded yet. Once members start logging workouts, you'll see analytics here."
                                    : "You haven't logged any workouts yet. Start recording your fitness journey to see your analytics here."}
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => window.location.href = '/dashboard'}
                                sx={{
                                    background: 'linear-gradient(45deg, #ffb800 30%, #ff9d00 90%)',
                                    color: '#111',
                                    fontWeight: 600,
                                    px: 3,
                                    py: 1
                                }}
                            >
                                Go to Dashboard
                            </Button>
                        </Box>
                    ) : (
                        <Fade in={!loading} timeout={500}>
                            <Box>
                                {renderTabContent()}
                            </Box>
                        </Fade>
                    )}
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default Analytics;
