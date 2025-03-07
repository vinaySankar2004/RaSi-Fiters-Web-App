import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardTable from "./pages/DashboardTable";
import Members from "./pages/Members";
import Workouts from "./pages/Workouts";

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("role") === "admin";

    return isAuthenticated && isAdmin ? children : <Navigate to="/login" />;
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
