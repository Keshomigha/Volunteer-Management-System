import sequelize from "../config/database.js";
import User from "../models/userModel.js";

const listUsers = async () => {
  try {
    await sequelize.authenticate();
    const users = await User.findAll({ attributes: ["id", "name", "email", "role"] });
    console.log("Total users in DB:", users.length);
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (err) {
    console.error("Error listing users:", err);
    process.exit(1);
  }
};

listUsers();
