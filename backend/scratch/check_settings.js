import SystemSetting from "../models/systemSetting.js";
import sequelize from "../config/database.js";

async function check() {
  try {
    const settings = await SystemSetting.findByPk(1);
    console.log("Current SystemSetting id=1:", settings ? settings.toJSON() : "NOT FOUND");
    
    if (!settings || settings.registrationOpen === false) {
      console.log("Updating registrationOpen to TRUE...");
      if (!settings) {
        await SystemSetting.create({ id: 1, registrationOpen: true });
      } else {
        await settings.update({ registrationOpen: true });
      }
      console.log("✅ registrationOpen updated to true!");
    }
    process.exit(0);
  } catch (err) {
    console.error("Error checking settings:", err);
    process.exit(1);
  }
}

check();
