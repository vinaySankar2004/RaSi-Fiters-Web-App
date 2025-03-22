import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Typography,
    Button,
    Box,
    ThemeProvider,
    createTheme,
    CssBaseline,
    alpha,
    Paper,
    IconButton
} from "@mui/material";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';

// Create a dark theme with our custom colors
const darkTheme = createTheme({
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
                    backgroundImage: 'none',
                },
            },
        },
    },
});

// Custom Calendar component inspired by the Daily UI example
const CustomCalendar = ({ selectedDate, onDateChange }) => {
    const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();

    const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });

    const generateDays = () => {
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

        const previousMonthDays = [];
        const currentMonthDays = [];
        const nextMonthDays = [];

        const daysInPreviousMonth = new Date(currentYear, currentMonth, 0).getDate();
        for (let i = adjustedFirstDay - 1; i >= 0; i--) {
            previousMonthDays.push(daysInPreviousMonth - i);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            currentMonthDays.push(i);
        }

        const totalCells = 42;
        const nextMonthDaysCount = totalCells - previousMonthDays.length - currentMonthDays.length;
        for (let i = 1; i <= nextMonthDaysCount; i++) {
            nextMonthDays.push(i);
        }

        return { previousMonthDays, currentMonthDays, nextMonthDays };
    };

    const { previousMonthDays, currentMonthDays, nextMonthDays } = generateDays();

    const isCurrentDate = (day) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()
        );
    };

    const isSelectedDate = (day) => {
        return (
            day === selectedDate.getDate() &&
            currentMonth === selectedDate.getMonth() &&
            currentYear === selectedDate.getFullYear()
        );
    };

    const handleDateClick = (day) => {
        const newDate = new Date(currentYear, currentMonth, day);
        onDateChange(newDate);
    };

    const navigateMonth = (direction) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + direction);
        onDateChange(newDate);
    };

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: '350px', // Reduced width to match calendar more closely
                mx: 'auto',
                background: 'transparent', // Make background transparent
                position: 'relative',
                zIndex: 1
            }}
        >
            <Box
                sx={{
                    background: 'rgba(30, 30, 30, 0.6)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                }}
            >
                {/* Calendar Header */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1.5,
                        px: 2,
                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                    }}
                >
                    <IconButton
                        onClick={() => navigateMonth(-1)}
                        size="small"
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                        <ChevronLeftIcon />
                    </IconButton>

                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#ffb800' }}>
                        {`${monthName} ${currentYear}`}
                    </Typography>

                    <IconButton
                        onClick={() => navigateMonth(1)}
                        size="small"
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                        <ChevronRightIcon />
                    </IconButton>
                </Box>

                {/* Weekday Headers */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        py: 1,
                        bgcolor: 'rgba(0, 0, 0, 0.1)'
                    }}
                >
                    {daysOfWeek.map((day) => (
                        <Box
                            key={day}
                            sx={{
                                textAlign: 'center',
                                color: '#ffb800',
                                fontWeight: 600,
                                fontSize: '0.7rem'
                            }}
                        >
                            {day}
                        </Box>
                    ))}
                </Box>

                {/* Calendar Grid */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        p: 1,
                        gap: 0.5 // Add small gap between cells
                    }}
                >
                    {previousMonthDays.map((day) => (
                        <Box
                            key={`prev-${day}`}
                            sx={{
                                aspectRatio: '1/1', // Make cells perfectly square
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: alpha('#fff', 0.2),
                                fontSize: '0.8rem',
                            }}
                        >
                            {day}
                        </Box>
                    ))}

                    {currentMonthDays.map((day) => (
                        <Box
                            key={`current-${day}`}
                            onClick={() => handleDateClick(day)}
                            sx={{
                                aspectRatio: '1/1', // Make cells perfectly square
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: isSelectedDate(day) ? 700 : 400,
                                color: isSelectedDate(day)
                                    ? '#111'
                                    : isCurrentDate(day)
                                        ? '#ffb800'
                                        : '#fff',
                                bgcolor: isSelectedDate(day)
                                    ? '#ffb800'
                                    : 'transparent',
                                borderRadius: '8px',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: isSelectedDate(day)
                                        ? '#ffb800'
                                        : 'rgba(255, 255, 255, 0.05)'
                                }
                            }}
                        >
                            {day}
                        </Box>
                    ))}

                    {nextMonthDays.map((day) => (
                        <Box
                            key={`next-${day}`}
                            sx={{
                                aspectRatio: '1/1', // Make cells perfectly square
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: alpha('#fff', 0.2),
                                fontSize: '0.8rem',
                            }}
                        >
                            {day}
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

const Dashboard = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const navigate = useNavigate();

    const handleSelectDate = () => {
        if (selectedDate) {
            // Format date in YYYY-MM-DD format without timezone conversion
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;

            navigate(`/dashboard/${formattedDate}`);
        }
    };

    return (
        <ThemeProvider theme={darkTheme}>
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
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexDirection: 'column',
                            textAlign: 'center',
                            mb: 4
                        }}
                    >
                        <Typography
                            variant="h3"
                            component="h1"
                            sx={{
                                fontWeight: 700,
                                mb: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                color: '#ffb800',
                            }}
                        >
                            <CalendarMonthIcon
                                sx={{
                                    fontSize: '2rem',
                                    color: '#ffb800',
                                    filter: 'drop-shadow(0 0 8px rgba(255,184,0,0.5))'
                                }}
                            />
                            Select a Day
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                color: alpha('#fff', 0.7),
                                maxWidth: '500px',
                                mb: 1
                            }}
                        >
                            Choose a date from the calendar to view or log your workouts
                        </Typography>
                    </Box>

                    <Paper
                        elevation={8}
                        sx={{
                            maxWidth: '350px',
                            mx: 'auto',
                            borderRadius: '16px',
                            background: 'transparent',
                            backdropFilter: 'none',
                            border: 'none',
                            overflow: 'hidden',
                            p: 0,
                            mb: 3,
                            position: 'relative',
                            boxShadow: 'none'
                        }}
                    >
                        <CustomCalendar
                            selectedDate={selectedDate}
                            onDateChange={setSelectedDate}
                        />
                    </Paper>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleSelectDate}
                            endIcon={<ArrowForwardIcon />}
                            sx={{
                                mt: 1,
                                background: 'linear-gradient(45deg, #ffb800 30%, #ff9d00 90%)',
                                color: '#111',
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '1rem',
                                px: 4,
                                py: 1.5,
                                borderRadius: '50px',
                                boxShadow: '0 4px 20px rgba(255, 184, 0, 0.25)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
                                    transform: 'translateX(-100%)'
                                },
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #ffce00 30%, #ffb800 90%)',
                                    boxShadow: '0 6px 25px rgba(255, 184, 0, 0.35)',
                                    transform: 'translateY(-2px)',
                                    '&::after': {
                                        transform: 'translateX(100%)',
                                        transition: 'transform 0.7s ease'
                                    }
                                }
                            }}
                        >
                            View Selected Day
                        </Button>
                    </Box>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default Dashboard;
