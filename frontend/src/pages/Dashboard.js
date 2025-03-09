import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button, Box } from "@mui/material";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import NavbarLoggedIn from "../components/NavbarLoggedIn";
import "../styles/Dashboard.css"; 

const Dashboard = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const navigate = useNavigate();

    useEffect(() => {
    }, []);

    const handleSelectDate = () => {
        if (selectedDate) {
            // Format date in YYYY-MM-DD format without timezone conversion
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0'); 
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            
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
