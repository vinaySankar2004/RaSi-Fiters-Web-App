import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
    const navigate = useNavigate();

    return (
        <AppBar position="sticky" className="navbar">
            <Toolbar>
                <Typography
                    variant="h6"
                    sx={{ flexGrow: 1, cursor: "pointer" }}
                    onClick={() => navigate("/")}
                    className="navbar-logo"
                >
                    RASI FIT'ERS
                </Typography>
                <Button className="navbar-button" onClick={() => navigate("/login")}>
                    Login
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
