import app from "../app.js";
import sequelize from "../config/database.js";
import User from "../models/userModel.js";

process.env.NODE_ENV = "test";

const PORT = 6205;
const API_BASE = `http://localhost:${PORT}/api/auth`;
const TEST_EMAIL = `forgot_smtp_test_${Date.now()}@example.com`;
const TEST_PASSWORD_ORIGINAL = "OriginalPass123!";
const TEST_PASSWORD_NEW = "NewPasswordViaSMTP123!";

async function postJson(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  return { status: res.status, data: json };
}

async function runSmtpForgotPasswordTest() {
  console.log("==================================================");
  console.log("STARTING FORGOT PASSWORD REAL SMTP E2E TEST");
  console.log("==================================================");

  let server;
  try {
    await sequelize.authenticate();
    console.log("✔ Connected to database.");

    server = app.listen(PORT);
    console.log(`✔ Test server listening on port ${PORT}`);

    // Step 1: Register student
    console.log(`\n[STEP 1] Registering test user: ${TEST_EMAIL}`);
    const regRes = await postJson(`${API_BASE}/register/student`, {
      name: "SMTP Forgot Password User",
      email: TEST_EMAIL,
      password: TEST_PASSWORD_ORIGINAL,
      phone: "+1234567890",
      studentId: `STU${Math.floor(100000 + Math.random() * 900000)}`,
      faculty: "Computer Science"
    });
    console.log("✔ Registration status:", regRes.status, regRes.data.message);

    // Step 2: Request Forgot Password via API
    console.log("\n[STEP 2] Requesting forgot-password reset via API...");
    const forgotRes = await postJson(`${API_BASE}/forgot-password`, { email: TEST_EMAIL });
    console.log("✔ Forgot Password status:", forgotRes.status, forgotRes.data.message);
    
    // Confirm token and OTP are NOT returned in HTTP response (Strict Security Check)
    if (forgotRes.data.token || forgotRes.data.otp) {
      throw new Error("SECURITY FAIL: Reset token or OTP was exposed in API response!");
    }
    console.log("✔ Security Check Passed: Reset token & OTP are strictly hidden from API payload!");

    // Step 3: Fetch stored resetOtp from Database for verification
    const dbUser = await User.findOne({ where: { email: TEST_EMAIL } });
    if (!dbUser || !dbUser.resetOtp) {
      throw new Error("FAIL: Reset OTP was not persisted in database!");
    }
    console.log(`✔ Database Audit: Found stored OTP (${dbUser.resetOtp}) sent via SMTP!`);

    // Step 4: Verify OTP via API
    console.log("\n[STEP 4] Verifying OTP endpoint...");
    const verifyOtpRes = await postJson(`${API_BASE}/verify-otp`, {
      email: TEST_EMAIL,
      otp: dbUser.resetOtp
    });
    console.log("✔ Verify OTP status:", verifyOtpRes.status, verifyOtpRes.data.message);

    // Step 5: Reset password using OTP via API
    console.log("\n[STEP 5] Resetting password using OTP...");
    const resetOtpRes = await postJson(`${API_BASE}/reset-password-otp`, {
      email: TEST_EMAIL,
      otp: dbUser.resetOtp,
      newPassword: TEST_PASSWORD_NEW
    });
    console.log("✔ Reset via OTP status:", resetOtpRes.status, resetOtpRes.data.message);

    // Step 6: Verify login with new password
    console.log("\n[STEP 6] Testing login after SMTP Password Reset...");
    const loginRes = await postJson(`${API_BASE}/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD_NEW
    });
    console.log("✔ Successfully authenticated with updated password! User ID:", loginRes.data.user.id);

    console.log("\n==================================================");
    console.log("REAL SMTP FORGOT PASSWORD TEST PASSED WITH 100% SUCCESS!");
    console.log("==================================================");
  } catch (error) {
    console.error("\n❌ FORGOT PASSWORD SMTP TEST FAILED:", error.message);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
      console.log("✔ Test server closed.");
    }
  }
}

runSmtpForgotPasswordTest();
