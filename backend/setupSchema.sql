-- Database Schema: RaSi Fit'ers Web App

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE users OWNER TO rasi_fiters_db_user;

-- Members Table
CREATE TABLE IF NOT EXISTS members (
    member_name VARCHAR(255) PRIMARY KEY NOT NULL,
    gender VARCHAR(10),
    age INTEGER CHECK (age > 0)
);

ALTER TABLE members OWNER TO rasi_fiters_db_user;

-- Workouts Table
CREATE TABLE IF NOT EXISTS workouts (
    workout_name VARCHAR(255) PRIMARY KEY NOT NULL
);

ALTER TABLE workouts OWNER TO rasi_fiters_db_user;

-- Workout Logs Table (Tracks member workouts)
CREATE TABLE IF NOT EXISTS workout_logs (
    member_name VARCHAR(255) NOT NULL,
    workout_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    duration INTEGER NOT NULL,
    PRIMARY KEY (member_name, workout_name, date),
    FOREIGN KEY (member_name) REFERENCES members(member_name) ON DELETE CASCADE,
    FOREIGN KEY (workout_name) REFERENCES workouts(workout_name) ON DELETE CASCADE
);

ALTER TABLE workout_logs OWNER TO rasi_fiters_db_user;
