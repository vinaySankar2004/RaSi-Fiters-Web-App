import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import heroImage from "../assets/hero-image.jpg"; // Ensure this file exists

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
                    flexWrap: "wrap",
                    gap: 4,
                }}
            >

                <Box sx={{ flex: 1, minWidth: "300px" }}>
                    <Typography variant="h3" gutterBottom>
                        Track Your <span style={{ color: "#FFCC00" }}>Fitness Journey</span>
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Log workouts, monitor progress, and achieve your fitness goals with ease.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate("/login")}
                        sx={{ fontWeight: "bold", fontSize: "1.1rem", padding: "10px 20px" }}
                    >
                        Login
                    </Button>
                </Box>

                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <img
                        src={"./assets/hero-image.jpg"}
                        alt="Fitness Motivation"
                        style={{
                            width: "100%",
                            maxWidth: "400px",
                            borderRadius: "10px",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
                        }}
                    />
                </Box>
            </Box>
        </Container>
    );
};

export default HeroSection;
