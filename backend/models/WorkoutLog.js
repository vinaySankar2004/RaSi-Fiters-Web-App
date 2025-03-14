const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const WorkoutLog = sequelize.define("WorkoutLog", {
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
            model: "users",
            key: "id",
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
    member_name: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    tableName: "workout_logs",
    timestamps: false
});

module.exports = WorkoutLog;
