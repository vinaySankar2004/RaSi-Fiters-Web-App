import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Avatar, Box, Menu, MenuItem, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import "../styles/NavbarLoggedIn.css"; // Ensure styles match Navbar

const NavbarLoggedIn = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("User");
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const open = Boolean(anchorEl);

    useEffect(() => {
        // Get username directly from localStorage
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username"); // Also remove username on logout
        navigate("/");
    };

    const handleNavigation = (path) => {
        navigate(path);
        setMobileMenuOpen(false); // Close mobile menu after navigation
    };

    return (
        <AppBar position="fixed" className="navbar-loggedin">
            <Toolbar className="navbar-loggedin-toolbar">
                {/* Logo Section - Ensure same weight as Navbar */}
                <Typography variant="h6" className="navbar-loggedin-logo" onClick={() => navigate("/dashboard")}>
                    RASI FIT'ERS
                </Typography>

                {/* Mobile Menu Button */}
                <IconButton 
                    className="mobile-menu-button" 
                    onClick={toggleMobileMenu}
                    edge="start"
                >
                    <MenuIcon />
                </IconButton>

                {/* Desktop Navigation Links */}
                <Box className="navbar-loggedin-links">
                    <Button onClick={() => navigate("/members")} className="navbar-loggedin-link">Members</Button>
                    <Button onClick={() => navigate("/workouts")} className="navbar-loggedin-link">Workouts</Button>
                    <Button onClick={() => navigate("/dashboard")} className="navbar-loggedin-link">Dashboard</Button>
                    <Button onClick={() => navigate("/analytics")} className="navbar-loggedin-link">Analytics</Button>
                </Box>

                {/* User Profile Section */}
                <Box className="navbar-loggedin-user" onClick={handleMenuOpen}>
                    <Typography variant="body1" className="navbar-loggedin-username">{username}</Typography>
                    <Avatar className="navbar-loggedin-avatar" />
                </Box>

                <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose} className="navbar-loggedin-dropdown">
                    <MenuItem onClick={handleLogout}>Log Out</MenuItem>
                </Menu>
            </Toolbar>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                <Button onClick={() => handleNavigation("/members")} className="mobile-menu-item">Members</Button>
                <Button onClick={() => handleNavigation("/workouts")} className="mobile-menu-item">Workouts</Button>
                <Button onClick={() => handleNavigation("/dashboard")} className="mobile-menu-item">Dashboard</Button>
                <Button onClick={() => handleNavigation("/analytics")} className="mobile-menu-item">Analytics</Button>
            </div>
        </AppBar>
    );
};

export default NavbarLoggedIn;
