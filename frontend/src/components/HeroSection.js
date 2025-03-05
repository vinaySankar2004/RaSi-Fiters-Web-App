import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="lg">
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: "80vh",
                }}
            >
                {/* Left Side Text */}
                <Box>
                    <Typography variant="h3" gutterBottom>
                        Track Your Fitness Journey
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Log workouts, monitor progress, and achieve your fitness goals with ease.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </Button>
                </Box>

                {/* Right Side Placeholder for Image */}
                <Box
                    sx={{
                        width: "40%",
                        height: "300px",
                        bgcolor: "grey.300",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "8px",
                    }}
                >
                    <Typography variant="h6">[Picture Placeholder]</Typography>
                </Box>
            </Box>
        </Container>
    );
};

export default HeroSection;
