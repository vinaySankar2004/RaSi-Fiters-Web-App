import React, { useState, useRef, useEffect } from "react";
import { AppBar, Toolbar, Typography, Button, Avatar, Box, Menu, MenuItem, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/NavbarLoggedIn.css"; 

const NavbarLoggedIn = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const open = Boolean(anchorEl);
    const userBoxRef = useRef(null);

    // Set the width variable when the component mounts and when the window resizes
    useEffect(() => {
        const updateWidth = () => {
            if (userBoxRef.current) {
                const width = userBoxRef.current.offsetWidth;
                document.documentElement.style.setProperty('--user-box-width', `${width}px`);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
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
        logout();
        navigate("/");
    };

    const handleNavigation = (path) => {
        navigate(path);
        setMobileMenuOpen(false); 
    };

    return (
        <AppBar position="fixed" className="navbar-loggedin">
            <Toolbar className="navbar-loggedin-toolbar">
                {/* Logo Section */}
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
                    {user?.role === 'admin' && (
                        <Button onClick={() => navigate("/analytics")} className="navbar-loggedin-link">Analytics</Button>
                    )}
                </Box>

                {/* User Profile Section */}
                <Box 
                    className="navbar-loggedin-user" 
                    onClick={handleMenuOpen}
                    ref={userBoxRef}
                >
                    <Typography variant="body1" className="navbar-loggedin-username">
                        {user?.username || 'User'} 
                        {user?.role === 'admin' && <span className="admin-badge"> (Admin)</span>}
                    </Typography>
                    <Avatar className="navbar-loggedin-avatar" />
                </Box>

                <Menu 
                    anchorEl={anchorEl} 
                    open={open} 
                    onClose={handleMenuClose} 
                    className="navbar-loggedin-dropdown"
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <MenuItem onClick={handleLogout}>Log Out</MenuItem>
                </Menu>
            </Toolbar>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                <Button onClick={() => handleNavigation("/members")} className="mobile-menu-item">Members</Button>
                <Button onClick={() => handleNavigation("/workouts")} className="mobile-menu-item">Workouts</Button>
                <Button onClick={() => handleNavigation("/dashboard")} className="mobile-menu-item">Dashboard</Button>
                {user?.role === 'admin' && (
                    <Button onClick={() => handleNavigation("/analytics")} className="mobile-menu-item">Analytics</Button>
                )}
            </div>
        </AppBar>
    );
};

export default NavbarLoggedIn;
