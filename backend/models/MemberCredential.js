const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const MemberCredential = sequelize.define("MemberCredential", {
    member_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: "member_credentials",
    timestamps: false,
    underscored: true
});

module.exports = MemberCredential;
