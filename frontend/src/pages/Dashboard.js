import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button, Box } from "@mui/material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import "../styles/Dashboard.css"; // Ensure CSS is properly linked

const Dashboard = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const navigate = useNavigate();

    useEffect(() => {
        const isAuthenticated = localStorage.getItem("token");
        const isAdmin = localStorage.getItem("role") === "admin";

        if (!isAuthenticated || !isAdmin) {
            navigate("/login");
        }
    }, [navigate]);

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
                <Typography variant="h3" className="dashboard-title">
                    Select a Day
                </Typography>

                <Box className="dashboard-calendar-wrapper">
                    <Calendar
                        onChange={setSelectedDate}
                        value={selectedDate}
                        className="dashboard-calendar"
                    />
                </Box>

                <Button className="dashboard-select-button" onClick={handleSelectDate}>
                    Select
                </Button>
            </Container>
        </>
    );
};

export default Dashboard;
