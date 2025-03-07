import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button, Box } from "@mui/material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import "../styles/Dashboard.css"; // Apply new styles

const Dashboard = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const navigate = useNavigate();

    const handleSelectDate = () => {
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split("T")[0];
            navigate(`/dashboard/${formattedDate}`);
        }
    };

    return (
        <>
            <NavbarLoggedIn />
            <Container className="dashboard-container">
                <Typography variant="h3" className="dashboard-title">Select a Day</Typography>

                <Box className="calendar-container">
                    <Calendar
                        onChange={setSelectedDate}
                        value={selectedDate}
                        className="custom-calendar"
                    />
                </Box>

                <Button className="dashboard-button" onClick={handleSelectDate}>
                    Select
                </Button>
            </Container>
        </>
    );
};

export default Dashboard;
