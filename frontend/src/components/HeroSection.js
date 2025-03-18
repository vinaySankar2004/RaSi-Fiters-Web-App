import React from "react";
import {
    Box,
    Typography,
    Button,
    Container,
    Grid,
    Paper
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import fitnessImage from "../assets/rasi_fiters_img.JPG";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                pt: 8, // Added to account for the fixed navbar
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '15%',
                    left: '5%',
                    width: '40%',
                    height: '70%',
                    background: 'radial-gradient(circle, rgba(255,184,0,0.05) 0%, transparent 70%)',
                    zIndex: 0
                }
            }}
        >
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Grid
                    container
                    spacing={0}
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        px: { xs: 2, md: 6 },
                        py: { xs: 4, md: 0 }
                    }}
                >
                    <Grid item xs={12} md={5} sx={{ pr: { md: 4 } }}>
                        <Box
                            sx={{
                                textAlign: { xs: 'center', md: 'left' },
                                mb: { xs: 6, md: 0 }
                            }}
                        >
                            <Typography
                                variant="h2"
                                component="h1"
                                sx={{
                                    fontWeight: 800,
                                    mb: 2,
                                    letterSpacing: '-0.5px',
                                    lineHeight: 1.1
                                }}
                            >
                                <Typography
                                    variant="h2"
                                    component="span"
                                    sx={{
                                        color: '#fff',
                                        fontWeight: 800,
                                        display: 'block',
                                        mb: 0.5,
                                        textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    Track Your
                                </Typography>
                                <Typography
                                    variant="h2"
                                    component="span"
                                    sx={{
                                        background: 'linear-gradient(90deg, #ffb800 0%, #ff9d00 100%)',
                                        backgroundClip: 'text',
                                        textFillColor: 'transparent',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontWeight: 800,
                                        display: 'block',
                                        textShadow: '0 0 30px rgba(255,184,0,0.3)'
                                    }}
                                >
                                    Fitness Journey
                                </Typography>
                            </Typography>

                            <Typography
                                variant="h6"
                                component="p"
                                sx={{
                                    color: 'rgba(255,255,255,0.7)',
                                    mb: 4,
                                    fontWeight: 400,
                                    maxWidth: { xs: '100%', md: '85%' }
                                }}
                            >
                                Log workouts, monitor progress, and achieve your fitness goals with ease.
                            </Typography>

                            <Button
                                variant="contained"
                                size="large"
                                endIcon={<ArrowForwardIcon />}
                                onClick={() => navigate("/login")}
                                sx={{
                                    background: 'linear-gradient(45deg, #ffb800 30%, #ff9d00 90%)',
                                    color: '#111',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    fontSize: '1.1rem',
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: '50px',
                                    boxShadow: '0 4px 20px rgba(255, 184, 0, 0.25)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
                                        transform: 'translateX(-100%)'
                                    },
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #ffce00 30%, #ffb800 90%)',
                                        boxShadow: '0 6px 25px rgba(255, 184, 0, 0.35)',
                                        transform: 'translateY(-2px)',
                                        transition: 'all 0.2s',
                                        '&::after': {
                                            transform: 'translateX(100%)',
                                            transition: 'transform 0.7s ease'
                                        }
                                    }
                                }}
                            >
                                Get Started
                            </Button>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={7} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box
                            sx={{
                                position: 'relative',
                                width: { xs: '90%', sm: '80%', md: '90%' },
                                maxWidth: '550px',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    top: '-10px',
                                    left: '10px',
                                    background: 'linear-gradient(135deg, rgba(255,184,0,0.2) 0%, transparent 70%)',
                                    borderRadius: '16px',
                                    zIndex: 0
                                }
                            }}
                        >
                            <Paper
                                elevation={8}
                                sx={{
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    zIndex: 1,
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'linear-gradient(45deg, rgba(0,0,0,0.4) 0%, transparent 60%)',
                                        zIndex: 1
                                    },
                                    boxShadow: '0 15px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,184,0,0.1)',
                                    transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
                                    transition: 'all 0.5s ease',
                                    '&:hover': {
                                        transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg)',
                                        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,184,0,0.2)'
                                    }
                                }}
                            >
                                <Box
                                    component="img"
                                    src={fitnessImage}
                                    alt="Fitness Motivation"
                                    sx={{
                                        width: '100%',
                                        height: 'auto',
                                        display: 'block',
                                        transition: 'transform 0.5s ease',
                                        '&:hover': {
                                            transform: 'scale(1.05)'
                                        }
                                    }}
                                />
                            </Paper>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default HeroSection;
