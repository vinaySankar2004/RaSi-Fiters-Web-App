const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Member = sequelize.define("Member", {
    member_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: "members",
    timestamps: false
});

module.exports = Member;
