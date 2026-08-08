import dotenv from "dotenv";
import app from "./app.js";
import sequelize from "./config/database.js";
import { seedDatabase } from "./config/seed.js";

// Import all models to ensure they are registered with Sequelize prior to sync
import User from "./models/userModel.js";
import StudentProfile from "./models/studentProfileModel.js";
import OrganizerProfile from "./models/organizerProfileModel.js";
import Event from "./models/eventModel.js";
import VolunteerRegistration from "./models/volunteerRegistration.js";
import SystemSetting from "./models/systemSetting.js";
import Notification from "./models/notificationModel.js";
import AuditLog from "./models/auditLogModel.js";
import Attendance from "./models/attendanceModel.js";
import Certificate from "./models/certificateModel.js";

dotenv.config();

// Connect to the MySQL database via Sequelize
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

// Sync database schema structure and seed default data tables
sequelize
  .sync()
  .then(async () => {
    console.log("Database synced");
    // Ensure new columns exist on existing tables if sync alter was skipped
    await sequelize.query("ALTER TABLE Users ADD COLUMN resetOtp VARCHAR(255) NULL;").catch(() => {});
    await sequelize.query("ALTER TABLE Users ADD COLUMN resetOtpExpires DATETIME NULL;").catch(() => {});
    await sequelize.query("ALTER TABLE Events ADD COLUMN eventType ENUM('In-Person', 'Online') DEFAULT 'In-Person';").catch(() => {});
    await sequelize.query("ALTER TABLE Events ADD COLUMN meetingLink TEXT NULL;").catch(() => {});
    await sequelize.query("ALTER TABLE Events ADD COLUMN time VARCHAR(255) DEFAULT '10:00 AM';").catch(() => {});
    await sequelize.query("ALTER TABLE Events ADD COLUMN reputationPoints INT DEFAULT 10;").catch(() => {});
    await sequelize.query("ALTER TABLE Events ADD COLUMN category VARCHAR(255) NULL;").catch(() => {});
    await sequelize.query("ALTER TABLE Events ADD COLUMN skills TEXT NULL;").catch(() => {});
    await sequelize.query("ALTER TABLE Events MODIFY COLUMN image LONGTEXT NULL;").catch(() => {});
    await sequelize.query("ALTER TABLE Events ALTER COLUMN image TEXT NULL;").catch(() => {});
    await seedDatabase();
  })
  .catch((err) => {
    console.error("Database sync failed:", err);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});