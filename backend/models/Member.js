const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Member = sequelize.define("Member", {
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
            model: "users",
            key: "id"
        }
    },
    member_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
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
    }
}, {
    tableName: "members",
    timestamps: false
});

module.exports = Member;
