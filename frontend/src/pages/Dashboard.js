import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button, Box } from "@mui/material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import NavbarLoggedIn from "../components/NavbarLoggedIn";

const Dashboard = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const navigate = useNavigate();

    const handleSelectDate = () => {
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split("T")[0]; // Format YYYY-MM-DD
            navigate(`/dashboard/${formattedDate}`);
        }
    };

    return (
        <>
            <NavbarLoggedIn />
            <Container sx={{ mt: 4, textAlign: "center" }}>
                <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>Select a Day</Typography>

                <Box sx={{ mt: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    {/* Enlarged Calendar with Proper Spacing */}
                    <Box sx={{ width: "100%", maxWidth: "450px", p: 2, "& .react-calendar": { width: "100%", fontSize: "1.2rem" } }}>
                        <Calendar
                            onChange={setSelectedDate}
                            value={selectedDate}
                        />
                    </Box>

                    <Button variant="contained" color="primary" sx={{ mt: 1 }} onClick={handleSelectDate}>
                        Select
                    </Button>
                </Box>
            </Container>
        </>
    );
};

export default Dashboard;
