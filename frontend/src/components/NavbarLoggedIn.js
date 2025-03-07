import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Avatar, Box, Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../styles/NavbarLoggedIn.css"; // Ensure styles match Navbar

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
        <AppBar position="fixed" className="navbar-loggedin">
            <Toolbar className="navbar-loggedin-toolbar">
                {/* Logo Section */}
                <Typography variant="h6" className="navbar-loggedin-logo" onClick={() => navigate("/dashboard")}>
                    RASI FIT'ERS
                </Typography>

                {/* Navigation Links */}
                <Box className="navbar-loggedin-links">
                    <Button onClick={() => navigate("/members")} className="navbar-loggedin-link">Members</Button>
                    <Button onClick={() => navigate("/workouts")} className="navbar-loggedin-link">Workouts</Button>
                    <Button onClick={() => navigate("/dashboard")} className="navbar-loggedin-link">Dashboard</Button>
                    <Button onClick={() => navigate("/analytics")} className="navbar-loggedin-link">Analytics</Button>
                </Box>

                {/* User Profile Dropdown */}
                <Box className="navbar-loggedin-user" onClick={handleMenuOpen}>
                    <Typography variant="body1" className="navbar-loggedin-username">{username}</Typography>
                    <Avatar className="navbar-loggedin-avatar" />
                </Box>

                <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose} className="navbar-loggedin-dropdown">
                    <MenuItem onClick={handleLogout}>Log Out</MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default NavbarLoggedIn;
