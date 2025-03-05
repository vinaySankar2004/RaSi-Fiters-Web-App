const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const WorkoutLog = sequelize.define("WorkoutLog", {
    member_name: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        references: {
            model: "members",
            key: "member_name",
        },
    },
    workout_name: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        references: {
            model: "workouts",
            key: "workout_name",
        },
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        primaryKey: true,
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: "workout_logs",
    timestamps: false
});

module.exports = WorkoutLog;
