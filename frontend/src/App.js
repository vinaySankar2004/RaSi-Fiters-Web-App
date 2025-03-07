import React from "react";
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardTable from "./pages/DashboardTable";
import Members from "./pages/Members";
import Workouts from "./pages/Workouts";

import { useEffect, useState } from "react";

const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        setIsAuthenticated(!!token);
        setIsAdmin(role === "admin");
        setLoading(false);
    }, []);

    if (loading) return null;  // Wait until check is done

    return isAuthenticated && isAdmin ? children : <Navigate to="/dashboard" />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/dashboard/:date" element={<ProtectedRoute><DashboardTable /></ProtectedRoute>} />
                <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
                <Route path="/workouts" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
            </Routes>
        </Router>
    );
}

export default App;
