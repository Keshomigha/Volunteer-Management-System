import sequelize from "../config/database.js";

async function testConnection() {
  try {
    console.log("Attempting database authentication...");
    await sequelize.authenticate();
    console.log("✅ Database connection successful!");
    
    // Check tables
    const [results] = await sequelize.query("SHOW TABLES;");
    console.log("Tables in database:", results);
    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

testConnection();
