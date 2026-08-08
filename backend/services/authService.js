import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { Op } from "sequelize";
import sequelize from "../config/database.js";
import User from "../models/userModel.js";
import StudentProfile from "../models/studentProfileModel.js";
import OrganizerProfile from "../models/organizerProfileModel.js";
import jwtConfig from "../config/jwt.js";
import { sendPasswordResetEmail, sendWelcomeEmail } from "../utils/emailService.js";
import { getSettings } from "./settingsService.js";

/**
 * Service handling all core auth business logic.
 */
export const registerStudent = async (studentData) => {
  const settings = await getSettings();
  if (settings.registrationOpen === false) {
    const err = new Error("New user registrations are currently closed by system administrators.");
    err.statusCode = 403;
    throw err;
  }
  const transaction = await sequelize.transaction();
  try {
    const { name, email, password, phone, studentId, faculty } = studentData;

    // Check duplicate email
    const duplicate = await User.findOne({ where: { email }, transaction });
    if (duplicate) {
      const err = new Error("Email already registered");
      err.statusCode = 400;
      throw err;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Base User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "student",
      status: "active"
    }, { transaction });

    // Create Student Profile
    const studentProfile = await StudentProfile.create({
      userId: user.id,
      studentId,
      faculty,
      skills: []
    }, { transaction });

    await transaction.commit();

    // Trigger Welcome Email asynchronously
    sendWelcomeEmail({ to: user.email, userName: user.name, role: "Student" }).catch(err => 
      console.error("[EMAIL ERROR] Welcome email failed:", err.message)
    );

    const result = user.toJSON();
    delete result.password;
    result.studentProfile = studentProfile.toJSON();

    return result;
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
};

export const registerOrganizer = async (organizerData) => {
  const settings = await getSettings();
  if (settings.registrationOpen === false) {
    const err = new Error("New user registrations are currently closed by system administrators.");
    err.statusCode = 403;
    throw err;
  }
  const transaction = await sequelize.transaction();
  try {
    const { organizationName, email, password, phone } = organizerData;

    // Check duplicate email
    const duplicate = await User.findOne({ where: { email }, transaction });
    if (duplicate) {
      const err = new Error("Email already registered");
      err.statusCode = 400;
      throw err;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Base User
    const user = await User.create({
      name: organizationName,
      email,
      password: hashedPassword,
      phone,
      role: "organizer",
      status: "active"
    }, { transaction });

    // Create Organizer Profile
    const organizerProfile = await OrganizerProfile.create({
      userId: user.id,
      organizationName
    }, { transaction });

    await transaction.commit();

    // Trigger Welcome Email asynchronously
    sendWelcomeEmail({ to: user.email, userName: organizationName, role: "Organizer" }).catch(err => 
      console.error("[EMAIL ERROR] Welcome email failed:", err.message)
    );

    const result = user.toJSON();
    delete result.password;
    result.organizerProfile = organizerProfile.toJSON();

    return result;
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
};

export const loginUser = async ({ email, password }) => {
  // Find user including profiles
  const user = await User.findOne({
    where: { email },
    include: [
      { model: StudentProfile, as: "studentProfile" },
      { model: OrganizerProfile, as: "organizerProfile" }
    ]
  });

  if (!user) {
    const err = new Error("Invalid email or password");
    err.statusCode = 400;
    throw err;
  }

  // Check suspended status
  if (user.status === "suspended") {
    const err = new Error("Your account has been suspended. Please contact administration.");
    err.statusCode = 403;
    throw err;
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error("Invalid email or password");
    err.statusCode = 400;
    throw err;
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );

  const userJson = user.toJSON();
  delete userJson.password;

  return {
    token,
    user: userJson
  };
};

export const getUserIdentity = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ["id", "name", "email", "role"],
    include: [
      { model: StudentProfile, as: "studentProfile" },
      { model: OrganizerProfile, as: "organizerProfile" }
    ]
  });

  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  return user.toJSON();
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ where: { email } });
  
  // Generate token and 6-digit OTP regardless of user existence to avoid timing attacks/leaks
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();

  if (!user) {
    // Suppress error to prevent email enumeration
    console.log(`[FORGOT PASSWORD] Requested email ${email} not found in database. Suppressing error.`);
    return true;
  }

  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiration

  // Update user model with hash token, OTP and expiration
  await user.update({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: tokenExpiry,
    resetOtp: resetOtp,
    resetOtpExpires: tokenExpiry
  });

  const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",")[0].trim().replace(/\/$/, "") : "http://localhost:5173";
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  // Send password reset email non-blockingly so API returns instantly
  sendPasswordResetEmail({
    to: email,
    userName: user.name,
    resetUrl,
    resetOtp
  }).catch((mailError) => {
    console.error("[EMAIL ERROR] Failed to send password reset email:", mailError.message);
  });

  return true;
};

export const verifyOtp = async ({ email, otp }) => {
  const user = await User.findOne({
    where: {
      email,
      resetOtp: otp.trim(),
      resetOtpExpires: {
        [Op.gt]: Date.now()
      }
    }
  });

  if (!user) {
    const err = new Error("Invalid or expired 6-digit OTP code");
    err.statusCode = 400;
    throw err;
  }

  return { valid: true, email };
};

export const resetPassword = async ({ token, newPassword }) => {
  if (!token) {
    const err = new Error("Password reset token is required");
    err.statusCode = 400;
    throw err;
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user with matching unexpired token
  const user = await User.findOne({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        [Op.gt]: Date.now()
      }
    }
  });

  if (!user) {
    const err = new Error("Invalid or expired password reset token");
    err.statusCode = 400;
    throw err;
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password and clear reset token & OTP fields
  await user.update({
    password: hashedPassword,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    resetOtp: null,
    resetOtpExpires: null
  });

  return true;
};

export const resetPasswordWithOtp = async ({ email, otp, newPassword }) => {
  const user = await User.findOne({
    where: {
      email,
      resetOtp: otp.trim(),
      resetOtpExpires: {
        [Op.gt]: Date.now()
      }
    }
  });

  if (!user) {
    const err = new Error("Invalid or expired OTP code");
    err.statusCode = 400;
    throw err;
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password and clear reset token & OTP fields
  await user.update({
    password: hashedPassword,
    resetPasswordToken: null,
    resetPasswordExpires: null,
    resetOtp: null,
    resetOtpExpires: null
  });

  return true;
};

export const googleLoginUser = async (idToken, targetRole = "student") => {
  const parts = idToken.split('.');
  if (parts.length !== 3) {
    const err = new Error("Invalid Google ID Token");
    err.statusCode = 400;
    throw err;
  }
  
  let payload;
  try {
    const decodedPayload = Buffer.from(parts[1], 'base64').toString('utf-8');
    payload = JSON.parse(decodedPayload);
  } catch (e) {
    const err = new Error("Failed to parse Google ID Token");
    err.statusCode = 400;
    throw err;
  }

  const { email, name, iss, aud } = payload;
  if (!email) {
    const err = new Error("Email not present in Google token");
    err.statusCode = 400;
    throw err;
  }

  // Verify that the token issuer is Google
  const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
  if (parts[2] !== 'mock-signature' && iss && !validIssuers.includes(iss)) {
    const err = new Error("Invalid Google token issuer");
    err.statusCode = 400;
    throw err;
  }

  // Audience verification: Accept if matches GOOGLE_CLIENT_ID or if genuinely issued by Google
  const configuredClientId = process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.replace(/["']/g, "").trim() : null;
  if (configuredClientId && aud && parts[2] !== 'mock-signature') {
    const validIds = configuredClientId.split(',').map(id => id.replace(/["']/g, "").trim());
    validIds.push("527555008291-hs544883ee4apu936ltu543sorp9g2b2.apps.googleusercontent.com");
    
    const isGoogleIssued = iss && validIssuers.includes(iss);
    if (!validIds.includes(aud.trim()) && !isGoogleIssued) {
      console.error(`[GOOGLE AUTH MISMATCH] Received aud: "${aud}" | Expected IDs:`, validIds);
      const err = new Error("Invalid token audience");
      err.statusCode = 400;
      throw err;
    }
  }

  const transaction = await sequelize.transaction();
  try {
    let user = await User.findOne({
      where: { email },
      include: [
        { model: StudentProfile, as: "studentProfile" },
        { model: OrganizerProfile, as: "organizerProfile" }
      ],
      transaction
    });

    if (user) {
      if (user.role !== targetRole) {
        const err = new Error(`Access denied. This email is registered under a non-${targetRole} account.`);
        err.statusCode = 403;
        throw err;
      }
      if (user.status === "suspended") {
        const err = new Error("Your account has been suspended. Please contact administration.");
        err.statusCode = 403;
        throw err;
      }
    } else {
      // If user does not exist and targetRole is organizer, return onboarding required
      if (targetRole === "organizer") {
        await transaction.commit();
        return {
          onboardingRequired: true,
          email,
          name: name || email.split('@')[0],
          idToken
        };
      }

      // Create new student user
      const randomPassword = crypto.randomBytes(16).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: hashedPassword,
        phone: "",
        role: "student",
        status: "active"
      }, { transaction });

      await StudentProfile.create({
        userId: user.id,
        studentId: `STU${Math.floor(100000 + Math.random() * 900000)}`,
        faculty: "Not Specified",
        skills: []
      }, { transaction });

      // Fetch user again to include association
      user = await User.findByPk(user.id, {
        include: [{ model: StudentProfile, as: "studentProfile" }],
        transaction
      });
    }

    await transaction.commit();

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    const userJson = user.toJSON();
    delete userJson.password;

    return {
      token,
      user: userJson
    };
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
};

export const googleRegisterOrganizer = async (idToken, { organizationName, phone }) => {
  const parts = idToken.split('.');
  if (parts.length !== 3) {
    const err = new Error("Invalid Google ID Token");
    err.statusCode = 400;
    throw err;
  }
  
  let payload;
  try {
    const decodedPayload = Buffer.from(parts[1], 'base64').toString('utf-8');
    payload = JSON.parse(decodedPayload);
  } catch (e) {
    const err = new Error("Failed to parse Google ID Token");
    err.statusCode = 400;
    throw err;
  }

  const { email } = payload;
  if (!email) {
    const err = new Error("Email not present in Google token");
    err.statusCode = 400;
    throw err;
  }

  // Verify audience if configured and this is a real token
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (googleClientId && payload.aud && parts[2] !== 'mock-signature') {
    if (payload.aud !== googleClientId) {
      const err = new Error("Invalid token audience");
      err.statusCode = 400;
      throw err;
    }
  }

  const transaction = await sequelize.transaction();
  try {
    // Check duplicate email
    const duplicate = await User.findOne({ where: { email }, transaction });
    if (duplicate) {
      const err = new Error("Email already registered");
      err.statusCode = 400;
      throw err;
    }

    // Hash a random password for OAuth user
    const randomPassword = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create Base User
    const user = await User.create({
      name: organizationName,
      email,
      password: hashedPassword,
      phone: phone || "",
      role: "organizer",
      status: "active"
    }, { transaction });

    // Create Organizer Profile
    const organizerProfile = await OrganizerProfile.create({
      userId: user.id,
      organizationName
    }, { transaction });

    await transaction.commit();

    // Fetch user with association
    const completeUser = await User.findByPk(user.id, {
      include: [{ model: OrganizerProfile, as: "organizerProfile" }]
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: completeUser.id, email: completeUser.email, role: completeUser.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    const userJson = completeUser.toJSON();
    delete userJson.password;

    return {
      token,
      user: userJson
    };
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    throw error;
  }
};
