import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {Container, Box, TextField, Button, Typography, Paper, Alert, IconButton, InputAdornment, CircularProgress
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import "../styles/Login.css";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError(null);
        setLoading(true);

        try {
            const data = await api.login(username, password);
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify({ username }));
            navigate("/dashboard");
        } catch (err) {
            setError("Invalid username or password.");
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
