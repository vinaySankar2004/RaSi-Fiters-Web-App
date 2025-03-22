import React from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Container
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const Navbar = () => {
    const navigate = useNavigate();

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                background: 'transparent',
                backdropFilter: 'none',
                borderBottom: 'none',
                boxShadow: 'none',
                py: 0.5
            }}
        >
            <Container maxWidth="lg">
                <Toolbar
                    disableGutters
                    sx={{
                        py: 1.5
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexGrow: 1,
                            cursor: 'pointer',
                            position: 'relative',
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
                        onClick={() => navigate("/")}
                    >
                        <FitnessCenterIcon
                            sx={{
                                color: '#ffb800',
                                mr: 1.5,
                                fontSize: '2rem',
                                transform: 'rotate(-10deg)',
                                filter: 'drop-shadow(0 0 8px rgba(255,184,0,0.5))'
                            }}
                        />
                        <Typography
                            variant="h5"
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

                    <Button
                        onClick={() => navigate("/login")}
                        variant="contained"
                        sx={{
                            background: 'rgba(255,184,0,0.15)',
                            backdropFilter: 'blur(5px)',
                            color: '#ffb800',
                            fontWeight: 600,
                            textTransform: 'none',
                            px: 3,
                            py: 1,
                            borderRadius: '50px',
                            border: '1px solid rgba(255,184,0,0.3)',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255,184,0,0.2), transparent)',
                                transition: 'all 0.4s ease'
                            },
                            '&:hover': {
                                background: 'rgba(255,184,0,0.25)',
                                borderColor: 'rgba(255,184,0,0.5)',
                                boxShadow: '0 0 20px rgba(255,184,0,0.3), inset 0 0 10px rgba(255,184,0,0.1)',
                                transform: 'translateY(-2px)',
                                '&::before': {
                                    left: '100%'
                                }
                            }
                        }}
                    >
                        Login
                    </Button>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;
