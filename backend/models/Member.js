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
        allowNull: true, // Allow null for existing records
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: true, // Make age optional since we'll calculate it
        get() {
            // If date_of_birth is set, calculate age dynamically
            const dob = this.getDataValue('date_of_birth');
            if (dob) {
                const today = new Date();
                const birthDate = new Date(dob);
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                
                // Adjust age if birthday hasn't occurred yet this year
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                
                return age;
            }
            
            // Fall back to stored age if date_of_birth not available
            return this.getDataValue('age');
        }
    }
}, {
    tableName: "members",
    timestamps: false
});

module.exports = Member;
