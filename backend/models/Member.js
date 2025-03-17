const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const bcrypt = require("bcrypt");

const Member = sequelize.define("Member", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'member',
        validate: {
            isIn: [['admin', 'member']]
        }
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
    tableName: "members",
    timestamps: false,
    // Mapping the model fields to the actual column names in case the case is different
    underscored: true
});

// Hash password before saving (for both create and update)
Member.beforeSave(async (member) => {
    if (member.changed('password')) {
        member.password = await bcrypt.hash(member.password, 10);
    }
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

// Add method to verify password
Member.prototype.checkPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = Member;
