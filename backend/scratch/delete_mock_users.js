import sequelize from "../config/database.js";
import User from "../models/userModel.js";
import StudentProfile from "../models/studentProfileModel.js";
import OrganizerProfile from "../models/organizerProfileModel.js";
import VolunteerRegistration from "../models/volunteerRegistration.js";

const deleteMockUsers = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB.");

    const mockEmails = [
      "avishka@uni.lk",
      "dinithi@uni.lk",
      "kasun@uni.lk",
      "sanduni@uni.lk",
      "rotaract@uni.lk",
      "ieee@uni.lk",
      "leo@uni.lk"
    ];

    const usersToDelete = await User.findAll({
      where: {
        email: mockEmails
      }
    });

    console.log(`Found ${usersToDelete.length} mock users to delete.`);

    for (const user of usersToDelete) {
      await VolunteerRegistration.destroy({ where: { UserId: user.id } });
      await StudentProfile.destroy({ where: { userId: user.id } });
      await OrganizerProfile.destroy({ where: { userId: user.id } });
      await user.destroy();
      console.log(`Deleted mock user: ${user.email} (${user.name})`);
    }

    console.log("Mock users purge complete!");
    process.exit(0);
  } catch (err) {
    console.error("Error deleting mock users:", err);
    process.exit(1);
  }
};

deleteMockUsers();
