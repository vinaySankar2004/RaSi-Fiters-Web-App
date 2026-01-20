const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const RefreshToken = sequelize.define("RefreshToken", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    member_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    token_hash: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    client_type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    revoked_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    replaced_by_hash: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    tableName: "refresh_tokens",
    timestamps: false,
    underscored: true
});

module.exports = RefreshToken;
