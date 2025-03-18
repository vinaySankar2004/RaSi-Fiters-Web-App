import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Alert,
    IconButton,
    InputAdornment,
    CircularProgress,
    ThemeProvider,
    createTheme,
    CssBaseline,
    alpha
} from "@mui/material";
import { Visibility, VisibilityOff, FitnessCenterOutlined, LockOutlined } from "@mui/icons-material";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

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
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: 'rgba(255,184,0,0.2)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(255,184,0,0.5)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#ffb800',
                        },
                    },
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    '&.Mui-focused': {
                        color: '#ffb800',
                    },
                },
            },
        },
    },
});

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async () => {
        setError(null);
        setLoading(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Login Response:", data);

                login({
                    token: data.token,
                    username: data.username,
                    role: data.role,
                    member_name: data.member_name
                });

                setTimeout(() => {
                    // Redirect user after login
                    navigate("/dashboard", { replace: true });
                }, 100);
            } else {
                setError(data.error || "Invalid username or password.");
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            handleLogin();
        }
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100vh',
                    backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(25, 25, 25, 0.8) 0%, rgba(18, 18, 18, 1) 90%)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '10%',
                        left: '5%',
                        width: '80%',
                        height: '80%',
                        background: 'radial-gradient(circle, rgba(255,184,0,0.05) 0%, transparent 70%)',
                        zIndex: 0
                    }
                }}
            >
                <Navbar />
                <Container
                    maxWidth="sm"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        pt: { xs: 8, sm: 0 },
                        pb: { xs: 4, sm: 0 },
                        position: 'relative',
                        zIndex: 1
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            width: '220px',
                            height: '220px',
                            top: { xs: '20%', sm: '15%' },
                            left: { xs: '-10%', sm: '-30%' },
                            background: 'radial-gradient(circle, rgba(74, 20, 140, 0.1) 0%, transparent 70%)',
                            borderRadius: '50%',
                            zIndex: 0
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            width: '250px',
                            height: '250px',
                            bottom: '10%',
                            right: '-20%',
                            background: 'radial-gradient(circle, rgba(255,184,0,0.07) 0%, transparent 70%)',
                            borderRadius: '50%',
                            zIndex: 0
                        }}
                    />

                    <Paper
                        elevation={8}
                        sx={{
                            width: '100%',
                            maxWidth: '450px',
                            borderRadius: '24px',
                            py: 4,
                            px: { xs: 3, sm: 5 },
                            background: 'rgba(30, 30, 30, 0.7)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            boxShadow: '0 15px 45px rgba(0, 0, 0, 0.3)',
                            overflow: 'hidden',
                            position: 'relative',
                            zIndex: 2,
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '4px',
                                background: 'linear-gradient(90deg, rgba(255,184,0,0.8) 0%, rgba(74, 20, 140, 0.5) 100%)',
                                zIndex: 1
                            }
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                mb: 3,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: '70px',
                                    height: '70px',
                                    borderRadius: '50%',
                                    mb: 2,
                                    background: 'linear-gradient(45deg, rgba(255,184,0,0.15) 0%, rgba(255,184,0,0.05) 100%)',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
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
                                    '&:hover::after': {
                                        transform: 'translateX(100%)',
                                        transition: 'transform 0.7s ease'
                                    }
                                }}
                            >
                                <LockOutlined
                                    sx={{
                                        fontSize: '32px',
                                        color: '#ffb800',
                                        filter: 'drop-shadow(0 0 8px rgba(255,184,0,0.5))'
                                    }}
                                />
                            </Box>

                            <Typography
                                variant="h4"
                                component="h1"
                                sx={{
                                    fontWeight: 700,
                                    mb: 0.5,
                                    background: 'linear-gradient(90deg, #ffb800 30%, #ff9d00 90%)',
                                    backgroundClip: 'text',
                                    textFillColor: 'transparent',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    textShadow: '0 0 20px rgba(255,184,0,0.2)'
                                }}
                            >
                                Welcome Back
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    color: alpha('#fff', 0.7),
                                    textAlign: 'center',
                                    maxWidth: '80%'
                                }}
                            >
                                Login to access your fitness dashboard
                            </Typography>
                        </Box>

                        {error && (
                            <Alert
                                severity="error"
                                sx={{
                                    mb: 3,
                                    borderRadius: '12px',
                                    '& .MuiAlert-icon': {
                                        color: '#f44336'
                                    }
                                }}
                            >
                                {error}
                            </Alert>
                        )}

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <TextField
                                label="Username"
                                variant="outlined"
                                fullWidth
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={handleKeyDown}
                                InputProps={{
                                    sx: {
                                        borderRadius: '12px',
                                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.15)',
                                        },
                                        '&.Mui-focused': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                        }
                                    }
                                }}
                            />

                            <TextField
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                variant="outlined"
                                fullWidth
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                InputProps={{
                                    sx: {
                                        borderRadius: '12px',
                                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.15)',
                                        },
                                        '&.Mui-focused': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                        }
                                    },
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                edge="end"
                                                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                fullWidth
                                onClick={handleLogin}
                                disabled={loading}
                                variant="contained"
                                sx={{
                                    mt: 1,
                                    py: 1.5,
                                    borderRadius: '12px',
                                    background: 'linear-gradient(45deg, #ffb800 30%, #ff9d00 90%)',
                                    color: '#111',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    textTransform: 'none',
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
                                        '&::after': {
                                            transform: 'translateX(100%)',
                                            transition: 'transform 0.7s ease'
                                        }
                                    },
                                    '&:disabled': {
                                        background: 'rgba(255, 184, 0, 0.3)',
                                        color: 'rgba(17, 17, 17, 0.5)'
                                    }
                                }}
                            >
                                {loading ? <CircularProgress size={24} sx={{ color: '#111' }} /> : "Login"}
                            </Button>
                        </Box>

                        <Typography
                            variant="body2"
                            sx={{
                                textAlign: 'center',
                                mt: 3,
                                color: alpha('#fff', 0.5),
                                fontSize: '0.75rem'
                            }}
                        >
                            Training hard? Login to track your progress.
                        </Typography>
                    </Paper>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default Login;
