import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardTable from "./pages/DashboardTable";
import Members from "./pages/Members";
import Workouts from "./pages/Workouts";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/:date" element={<DashboardTable />} />
                <Route path="/members" element={<Members />} />
                <Route path="/workouts" element={<Workouts />} />
            </Routes>
        </Router>
    );
}

export default App;
