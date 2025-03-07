import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

import "../styles/HeroSection.css";

const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="lg">
            <Box className="hero-container">
                <Box className="hero-text">
                    <Typography variant="h3" gutterBottom className="hero-title">
                        <span className="highlight">Track Your</span> <span className="highlight-yellow">Fitness Journey</span>
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }} className="hero-description">
                        Log workouts, monitor progress, and achieve your fitness goals with ease.
                    </Typography>
                    <Button className="hero-button" onClick={() => navigate("/login")}>
                        Login
                    </Button>
                </Box>

                <Box className="hero-image-container">
                    <img src={"../assets/rasi_fiters_img.JPG"} alt="Fitness Motivation" className="hero-image" />
                </Box>
            </Box>
        </Container>
    );
};

export default HeroSection;
