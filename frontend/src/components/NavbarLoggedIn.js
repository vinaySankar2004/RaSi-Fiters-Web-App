import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Avatar, Box, Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../styles/NavbarLoggedIn.css"; // Using the new CSS file

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
            <Toolbar>
                <Typography variant="h6" className="navbar-loggedin-logo" onClick={() => navigate("/dashboard")}>
                    RASI FIT'ERS
                </Typography>

                <Box className="navbar-loggedin-links">
                    <Button onClick={() => navigate("/members")} className="navbar-link">Members</Button>
                    <Button onClick={() => navigate("/workouts")} className="navbar-link">Workouts</Button>
                    <Button onClick={() => navigate("/dashboard")} className="navbar-link">Dashboard</Button>
                    <Button onClick={() => navigate("/analytics")} className="navbar-link">Analytics</Button>
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
