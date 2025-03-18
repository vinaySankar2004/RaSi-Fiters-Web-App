import React, { useState, useEffect } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Avatar,
    Box,
    Menu,
    MenuItem,
    IconButton,
    Container,
    alpha,
    Divider
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    FitnessCenter as FitnessCenterIcon,
    AccountCircle,
    ArrowDropDown,
    Logout,
    Dashboard,
    Group,
    DirectionsRun,
    BarChart
} from "@mui/icons-material";

const NavbarLoggedIn = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileWidth, setProfileWidth] = useState(140);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event) => {
        const width = event.currentTarget.getBoundingClientRect().width;
        setProfileWidth(Math.max(width, 140)); // Ensure minimum width of 140
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

    const navItems = [
        { path: "/members", label: "Members", icon: <Group fontSize="small" /> },
        { path: "/workouts", label: "Workouts", icon: <DirectionsRun fontSize="small" /> },
        { path: "/dashboard", label: "Dashboard", icon: <Dashboard fontSize="small" /> },
        { path: "/analytics", label: "Analytics", icon: <BarChart fontSize="small" /> }
    ];

    const isActive = (path) => {
        return window.location.pathname === path;
    };

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                background: 'transparent',
                backdropFilter: 'none',
                borderBottom: 'none',
                boxShadow: 'none',
                py: 0.5
            }}
        >
            <Container maxWidth="xl">
                <Toolbar
                    disableGutters
                    sx={{
                        py: 1
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            position: 'relative',
                            mr: 4,
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                width: '50px',
                                height: '50px',
                                background: 'radial-gradient(circle, rgba(255,184,0,0.15) 0%, transparent 70%)',
                                left: '-15px',
                                zIndex: -1
                            }
                        }}
                        onClick={() => navigate("/dashboard")}
                    >
                        <FitnessCenterIcon
                            sx={{
                                color: '#ffb800',
                                mr: 1.5,
                                fontSize: '1.8rem',
                                transform: 'rotate(-10deg)',
                                filter: 'drop-shadow(0 0 8px rgba(255,184,0,0.5))'
                            }}
                        />
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 800,
                                letterSpacing: '1px',
                                background: 'linear-gradient(90deg, #ffb800 0%, #ff9d00 100%)',
                                backgroundClip: 'text',
                                textFillColor: 'transparent',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textShadow: '0 0 20px rgba(255,184,0,0.3)',
                                position: 'relative'
                            }}
                        >
                            RASI FIT'ERS
                        </Typography>
                    </Box>

                    {/* Mobile Menu Button */}
                    <IconButton
                        sx={{
                            display: { xs: 'flex', md: 'none' },
                            color: 'white',
                            mr: 1
                        }}
                        onClick={toggleMobileMenu}
                        edge="start"
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Desktop Navigation Links */}
                    <Box
                        sx={{
                            display: { xs: 'none', md: 'flex' },
                            flexGrow: 1,
                            gap: 1,
                            alignItems: 'center'
                        }}
                    >
                        {navItems.map((item) => (
                            <Button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                startIcon={item.icon}
                                sx={{
                                    mx: 0.5,
                                    py: 1,
                                    px: 2,
                                    color: isActive(item.path) ? '#ffb800' : 'white',
                                    fontWeight: isActive(item.path) ? 600 : 400,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        bottom: 0,
                                        left: isActive(item.path) ? '10%' : '50%',
                                        width: isActive(item.path) ? '80%' : '0%',
                                        height: '2px',
                                        backgroundColor: '#ffb800',
                                        transition: 'all 0.3s ease',
                                        opacity: isActive(item.path) ? 1 : 0
                                    },
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        '&::after': {
                                            width: '80%',
                                            left: '10%',
                                            opacity: 0.7
                                        }
                                    }
                                }}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </Box>

                    {/* User Profile Section - Fixed Width */}
                    <Box
                        onClick={handleMenuOpen}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            ml: { xs: 'auto', md: 0 },
                            px: 1.5,
                            py: 0.8,
                            borderRadius: '50px',
                            transition: 'all 0.2s',
                            border: '1px solid rgba(255,255,255,0.08)',
                            minWidth: '140px',
                            width: 'auto',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                borderColor: 'rgba(255,184,0,0.2)'
                            }
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {user?.profilePic ? (
                                <Avatar
                                    src={user.profilePic}
                                    alt={user?.member_name || user?.username}
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        border: '2px solid rgba(255,184,0,0.5)'
                                    }}
                                />
                            ) : (
                                <Avatar
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        bgcolor: 'rgba(255,184,0,0.2)',
                                        color: '#ffb800',
                                        border: '2px solid rgba(255,184,0,0.5)',
                                        fontWeight: 'bold',
                                        fontSize: '14px'
                                    }}
                                >
                                    {(user?.member_name || user?.username || 'U').charAt(0).toUpperCase()}
                                </Avatar>
                            )}

                            <Box sx={{
                                flex: 1,
                                minWidth: 0, // This is crucial for text truncation in flex containers
                                overflow: 'hidden'
                            }}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 500,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        width: '100%' // Ensures full width usage
                                    }}
                                >
                                    {user?.member_name || user?.username || 'User'}
                                </Typography>

                                {user?.role === 'admin' && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: '#ffb800',
                                            fontSize: '0.65rem',
                                            fontWeight: 700,
                                            display: 'block',
                                            lineHeight: 1,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}
                                    >
                                        ADMIN
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        <ArrowDropDown sx={{ color: alpha('#fff', 0.7) }} />
                    </Box>

                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleMenuClose}
                        PaperProps={{
                            sx: {
                                mt: 1.5,
                                width: profileWidth,
                                minWidth: 140,
                                background: 'rgba(30, 30, 30, 0.8)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '12px',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '1px',
                                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,184,0,0.2) 50%, transparent 100%)'
                                }
                            }
                        }}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                        }}
                    >
                        {user?.role === 'member' && (
                            <MenuItem
                                onClick={() => { handleMenuClose(); navigate("/my-account"); }}
                                sx={{
                                    py: 1.5,
                                    px: 2,
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                                    }
                                }}
                            >
                                <AccountCircle sx={{ mr: 1.5, color: alpha('#fff', 0.7) }} />
                                <Typography variant="body2">My Account</Typography>
                            </MenuItem>
                        )}

                        <Divider sx={{ my: 0.5, borderColor: 'rgba(255,255,255,0.05)' }} />

                        <MenuItem
                            onClick={handleLogout}
                            sx={{
                                py: 1.5,
                                px: 2,
                                color: '#ff5252',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 82, 82, 0.05)'
                                }
                            }}
                        >
                            <Logout sx={{ mr: 1.5, color: alpha('#ff5252', 0.8) }} />
                            <Typography variant="body2">Log Out</Typography>
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </Container>

            {/* Mobile Menu Overlay */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 1099,
                    display: mobileMenuOpen ? 'flex' : 'none',
                    flexDirection: 'column',
                    pt: 8, // Space for navbar
                    px: 2
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        width: '100%'
                    }}
                >
                    {navItems.map((item) => (
                        <Button
                            key={item.path}
                            startIcon={item.icon}
                            onClick={() => handleNavigation(item.path)}
                            sx={{
                                py: 2,
                                justifyContent: 'flex-start',
                                textAlign: 'left',
                                color: isActive(item.path) ? '#ffb800' : 'white',
                                backgroundColor: isActive(item.path) ? 'rgba(255,184,0,0.1)' : 'transparent',
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                fontWeight: isActive(item.path) ? 600 : 400,
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.05)'
                                }
                            }}
                        >
                            {item.label}
                        </Button>
                    ))}

                    {user?.role === 'member' && (
                        <Button
                            startIcon={<AccountCircle />}
                            onClick={() => handleNavigation("/my-account")}
                            sx={{
                                py: 2,
                                justifyContent: 'flex-start',
                                textAlign: 'left',
                                color: isActive("/my-account") ? '#ffb800' : 'white',
                                backgroundColor: isActive("/my-account") ? 'rgba(255,184,0,0.1)' : 'transparent',
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                fontWeight: isActive("/my-account") ? 600 : 400,
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.05)'
                                }
                            }}
                        >
                            My Account
                        </Button>
                    )}

                    <Button
                        startIcon={<Logout />}
                        onClick={handleLogout}
                        sx={{
                            py: 2,
                            justifyContent: 'flex-start',
                            textAlign: 'left',
                            color: '#ff5252',
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontSize: '1.1rem',
                            mt: 2,
                            '&:hover': {
                                backgroundColor: 'rgba(255,82,82,0.05)'
                            }
                        }}
                    >
                        Log Out
                    </Button>
                </Box>
            </Box>
        </AppBar>
    );
};

export default NavbarLoggedIn;
