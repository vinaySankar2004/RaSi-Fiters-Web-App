import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Avatar, Box, Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NavbarLoggedIn = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("User"); // Default placeholder
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    useEffect(() => {
        // Retrieve username from localStorage
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser?.username) {
            setUsername(storedUser.username);
        }
    }, []);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    return (
        <AppBar position="static" color="primary">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1, cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
                    RASI FIT'ERS
                </Typography>

                {/* Navigation Links */}
                <Box sx={{ display: "flex", gap: 2 }}>
                    <Button color="inherit" onClick={() => navigate("/members")}>Members</Button>
                    <Button color="inherit" onClick={() => navigate("/workouts")}>Workouts</Button>
                    <Button color="inherit" onClick={() => navigate("/dashboard")}>Dashboard</Button>
                    <Button color="inherit" onClick={() => navigate("/analytics")}>Analytics</Button>
                </Box>

                {/* User Dropdown */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        ml: 2,
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        cursor: "pointer"
                    }}
                    onClick={handleMenuOpen}
                >
                    <Typography variant="body1">{username}</Typography>
                    <Avatar sx={{ bgcolor: "secondary.main" }} />
                </Box>

                {/* Dropdown Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                    transformOrigin={{ vertical: "top", horizontal: "center" }}
                    sx={{ width: "auto" }}
                >
                    <MenuItem onClick={handleLogout} sx={{ width: "100%" }}>Log Out</MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default NavbarLoggedIn;
