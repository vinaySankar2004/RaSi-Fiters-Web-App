import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();

    return (
        <AppBar position="static" color="primary">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }} onClick={() => navigate("/")}>
                    RASI FIT'ERS
                </Typography>
                <Button color="inherit" onClick={() => navigate("/login")}>
                    Login
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
