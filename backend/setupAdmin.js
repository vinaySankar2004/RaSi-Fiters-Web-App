const { sequelize } = require("./config/database");
const User = require("./models/User");

const createAdminUsers = async () => {
    await sequelize.sync({ alter: true }); // Resets DB, use { alter: true } to keep data
    await User.create({ username: "geetha", password: "geetha1978" });
    // await User.create({ username: "admin2", password: "password456" });
    console.log("✅ Admin users created.");
};

createAdminUsers();
