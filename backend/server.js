const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/database");
// Import models to ensure associations are set up
require("./models/index");
const authRoutes = require("./routes/auth");
const memberRoutes = require("./routes/members");
require("dotenv").config();
const workoutRoutes = require("./routes/workouts");
const workoutLogRoutes = require("./routes/workoutLogs");

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
    res.json({ message: "API is working!" });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
