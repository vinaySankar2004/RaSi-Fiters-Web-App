import { createTheme } from "@mui/material";

// Create a dark theme with our custom colors (matching existing theme)
export const analyticsTheme = createTheme({
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
    },
});
