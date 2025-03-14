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
    CircularProgress
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

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
        <>
            <Navbar />
            <div className="login-container">
                <Container maxWidth="sm">
                    <Paper elevation={3} className="login-box">
                        <Typography variant="h5" className="login-title">
                            Login to Your Account
                        </Typography>
                        {error && <Alert severity="error" className="login-alert">{error}</Alert>}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <TextField
                                label="Username"
                                variant="outlined"
                                fullWidth
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="login-input"
                            />
                            <TextField
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                variant="outlined"
                                fullWidth
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="login-input"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Button
                                className="login-button"
                                fullWidth
                                onClick={handleLogin}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
                            </Button>
                        </Box>
                    </Paper>
                </Container>
            </div>
        </>
    );
};

export default Login;
