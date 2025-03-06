const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/database");
const authRoutes = require("./routes/auth");
const memberRoutes = require("./routes/members");
require("dotenv").config();
const workoutRoutes = require("./routes/workouts");
const workoutLogRoutes = require("./routes/workoutLogs");

const app = express();

app.use(cors({
    origin: "*", // Temporarily allow all origins for testing
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

const PORT = process.env.PORT || 5001;

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
};

startServer();
