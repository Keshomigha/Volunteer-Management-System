import sequelize from "../config/database.js";
import User from "../models/userModel.js";
import StudentProfile from "../models/studentProfileModel.js";
import OrganizerProfile from "../models/organizerProfileModel.js";
import VolunteerRegistration from "../models/volunteerRegistration.js";
import AuditLog from "../models/auditLogModel.js";
import Notification from "../models/notificationModel.js";

const isRealUser = (user) => {
  const email = (user.email || "").toLowerCase();
  const name = (user.name || "").toLowerCase();

  // Admin users to keep
  if (email === "admin@volunteerhub.com" || email === "admin@gmail.com") return true;

  // Real user accounts to keep
  if (email === "udayaweerasinghe02@gmail.com" || 
      email === "avishkaweerasinghe@gmail.com" || 
      email === "avishkaweerasinghe02@gmail.com" || 
      email === "avishkaudaya02@gmail.com" || 
      email === "alice.smith@gmail.com" || 
      email === "ieee@sab.edu" ||
      email === "ieee@sab.ac.lk" ||
      email === "ieee@uni.edu" ||
      email === "johne02@gmail.com" ||
      email === "avishkaweerasinghe01@gmail.com" ||
      email === "admin123@gmail.com") {
    return true;
  }

  // Filter out mock/test pattern emails
  if (email.includes("178") || 
      email.includes("test") || 
      email.includes("notif") || 
      email.includes("absent") || 
      email.startsWith("student") || 
      email.startsWith("organizer") || 
      email.startsWith("admin_") || 
      email.startsWith("org_") || 
      name.includes("student one") || 
      name.includes("student two") || 
      name.includes("absent student") || 
      name.includes("notif student") || 
      name.includes("test ")) {
    return false;
  }

  return true;
};

const purgeMockUsers = async () => {
  try {
    await sequelize.authenticate();
    const users = await User.findAll();

    const realUsers = [];
    const mockUserIds = [];

    for (const u of users) {
      if (isRealUser(u)) {
        realUsers.push(u);
      } else {
        mockUserIds.push(u.id);
      }
    }

    console.log("--- KEEPING REAL USERS ---");
    realUsers.forEach(u => console.log(`[KEEP] ID: ${u.id} | ${u.name} | ${u.email} (${u.role})`));

    console.log(`\n--- PURGING ${mockUserIds.length} MOCK USERS ---`);

    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");

    for (const id of mockUserIds) {
      await AuditLog.destroy({ where: { performedBy: id } });
      await VolunteerRegistration.destroy({ where: { UserId: id } });
      await StudentProfile.destroy({ where: { userId: id } });
      await OrganizerProfile.destroy({ where: { userId: id } });
      await User.destroy({ where: { id } });
    }

    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");

    console.log("\nPurge completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Purge error:", err);
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
    process.exit(1);
  }
};

purgeMockUsers();
