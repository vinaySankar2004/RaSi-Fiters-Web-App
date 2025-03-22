const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const WorkoutLog = sequelize.define("WorkoutLog", {
    member_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
            model: "members",
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
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: "workout_logs",
    timestamps: false,
    underscored: true
});

module.exports = WorkoutLog;
