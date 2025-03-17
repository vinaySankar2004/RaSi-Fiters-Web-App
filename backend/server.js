const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/database");
require("./models/index");
const authRoutes = require("./routes/auth");
const memberRoutes = require("./routes/members");
const workoutRoutes = require("./routes/workouts");
const workoutLogRoutes = require("./routes/workoutLogs");
require("dotenv").config();

const app = express();

app.use(cors({
    origin: ["http://localhost:3000", "https://rasifiters.netlify.app"],
    credentials: true
}));

app.get("/", (req, res) => {
    res.send("Rasi Fiters API is running!");
});

app.use(express.json());

// Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/workout-logs", workoutLogRoutes);

// for testing purposes
app.get("/api/test", (req, res) => {
    res.json({
        message: "API is working!",
        version: "2.0.0", // Updated version to reflect the database restructuring
        dbSchema: "Consolidated"
    });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
    try {
        await connectDB();
        console.log("Database connected successfully");

        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();
