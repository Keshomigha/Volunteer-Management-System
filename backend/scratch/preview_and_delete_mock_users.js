import sequelize from "../config/database.js";
import User from "../models/userModel.js";
import StudentProfile from "../models/studentProfileModel.js";
import OrganizerProfile from "../models/organizerProfileModel.js";
import VolunteerRegistration from "../models/volunteerRegistration.js";

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
      email === "ieee@sab.edu") {
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
    const mockUsers = [];

    for (const u of users) {
      if (isRealUser(u)) {
        realUsers.push(u);
      } else {
        mockUsers.push(u);
      }
    }

    console.log("--- KEEPING REAL USERS ---");
    realUsers.forEach(u => console.log(`[KEEP] ID: ${u.id} | ${u.name} | ${u.email} (${u.role})`));

    console.log(`\n--- PURGING ${mockUsers.length} MOCK USERS ---`);
    for (const u of mockUsers) {
      console.log(`[PURGE] ID: ${u.id} | ${u.name} | ${u.email} (${u.role})`);
      await VolunteerRegistration.destroy({ where: { UserId: u.id } });
      await StudentProfile.destroy({ where: { userId: u.id } });
      await OrganizerProfile.destroy({ where: { userId: u.id } });
      await u.destroy();
    }

    console.log("\nPurge complete!");
    process.exit(0);
  } catch (err) {
    console.error("Purge error:", err);
    process.exit(1);
  }
};

purgeMockUsers();
