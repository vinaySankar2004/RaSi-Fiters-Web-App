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
    date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    }
}, {
    tableName: "members",
    timestamps: false
});

// Add virtual field for age
Member.prototype.getAge = function() {
    if (!this.date_of_birth) return null;
    
    const today = new Date();
    const birthDate = new Date(this.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
};

module.exports = Member;
