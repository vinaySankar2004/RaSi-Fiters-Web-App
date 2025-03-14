import React from "react";
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardTable from "./pages/DashboardTable";
import Members from "./pages/Members";
import Workouts from "./pages/Workouts";
import { AuthProvider, useAuth } from "./context/AuthContext";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return null; // Prevent rendering until check is complete

    return user ? children : <Navigate to="/login" replace />;
};

// Redirect authenticated users away from login page
const AuthRedirect = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return null;

    return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/:date" element={<ProtectedRoute><DashboardTable /></ProtectedRoute>} />
            <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
            <Route path="/workouts" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
            {/* Catch-all route for undefined routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
