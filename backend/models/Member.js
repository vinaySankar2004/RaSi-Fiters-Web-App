const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Member = sequelize.define("Member", {
    member_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
        set(value) {
            // Automatically trim spaces when setting the value
            this.setDataValue('member_name', value.trim());
        }
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "users",
            key: "id"
        }
    }
}, {
    tableName: "members",
    timestamps: false
});

module.exports = Member;
