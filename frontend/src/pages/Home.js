import React from "react";
import { Box, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";

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
            main: '#4a148c', // Purple accent for contrast with the gold
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
            fontWeight: 800,
        },
        h3: {
            fontWeight: 700,
        },
        h4: {
            fontWeight: 700,
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
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
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

const Home = () => {
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                    color: 'text.primary',
                    backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(25, 25, 25, 0.8) 0%, rgba(18, 18, 18, 1) 90%)',
                }}
            >
                <Navbar />
                <HeroSection />
            </Box>
        </ThemeProvider>
    );
};

export default Home;
