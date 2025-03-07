import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Avatar, Box, Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css"; // Reusing navbar styles

const NavbarLoggedIn = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("User");
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    useEffect(() => {
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
        <AppBar position="fixed" className="navbar">
            <Toolbar>
                <Typography variant="h6" className="navbar-logo" onClick={() => navigate("/dashboard")}>
                    RASI FIT'ERS
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                    <Button className="navbar-link" onClick={() => navigate("/members")}>Members</Button>
                    <Button className="navbar-link" onClick={() => navigate("/workouts")}>Workouts</Button>
                    <Button className="navbar-link" onClick={() => navigate("/dashboard")}>Dashboard</Button>
                    <Button className="navbar-link" onClick={() => navigate("/analytics")}>Analytics</Button>
                </Box>

                <Box className="navbar-user" onClick={handleMenuOpen}>
                    <Typography variant="body1">{username}</Typography>
                    <Avatar className="navbar-avatar" />
                </Box>

                <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose} className="navbar-dropdown">
                    <MenuItem onClick={handleLogout}>Log Out</MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default NavbarLoggedIn;
