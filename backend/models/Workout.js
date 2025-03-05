const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Workout = sequelize.define("Workout", {
    workout_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
    }
}, {
    tableName: "workouts",
    timestamps: false
});

module.exports = Workout;
