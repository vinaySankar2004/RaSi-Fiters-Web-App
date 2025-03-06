import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import { Container, Box, TextField, Button, Typography, Paper, Alert } from "@mui/material";
import Navbar from "../components/Navbar";
import api from "../utils/api";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError(null);
        try {
            const data = await api.login(username, password);

            // Store token & user info in localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify({ username }));

            navigate("/dashboard");
        } catch (err) {
            setError("Invalid username or password.");
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
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ p: 4, mt: 8, textAlign: "center" }}>
                    <Typography variant="h5" gutterBottom>
                        Login to Your Account
                    </Typography>
                    {error && <Alert severity="error">{error}</Alert>}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                            label="Username"
                            variant="outlined"
                            fullWidth
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <TextField
                            label="Password"
                            type="password"
                            variant="outlined"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <Button variant="contained" color="primary" fullWidth onClick={handleLogin}>
                            Login
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </>
    );
};

export default Login;
