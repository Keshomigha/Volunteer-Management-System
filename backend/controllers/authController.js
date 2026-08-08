import * as authService from "../services/authService.js";

export const registerStudent = async (req, res, next) => {
  try {
    const student = await authService.registerStudent(req.body);
    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      user: student
    });
  } catch (error) {
    next(error);
  }
};

export const registerOrganizer = async (req, res, next) => {
  try {
    const organizer = await authService.registerOrganizer(req.body);
    res.status(201).json({
      success: true,
      message: "Organizer registered successfully",
      user: organizer
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const data = await authService.loginUser({ email, password });
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: data.token,
      user: {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        studentProfile: data.user.studentProfile,
        organizerProfile: data.user.organizerProfile
      }
    });
  } catch (error) {
    // If invalid credentials, make sure status is 400
    if (error.message === "Invalid email or password") {
      error.statusCode = 400;
    }
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    // req.user is populated by authMiddleware.js
    const userId = req.user.id;
    const user = await authService.getUserIdentity(userId);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    await authService.forgotPassword(email);
    res.status(200).json({
      success: true,
      message: "If an account exists, a password reset email has been sent."
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    await authService.verifyOtp({ email, otp });
    res.status(200).json({
      success: true,
      message: "OTP verified successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const token = req.params.token || req.body.token;
    const { newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Token and newPassword are required" });
    }

    await authService.resetPassword({ token, newPassword });
    res.status(200).json({
      success: true,
      message: "Password has been reset successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordWithOtp = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    await authService.resetPasswordWithOtp({ email, otp, newPassword });
    res.status(200).json({
      success: true,
      message: "Password has been reset successfully using OTP"
    });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const { idToken, targetRole } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: "ID Token is required" });
    }

    const data = await authService.googleLoginUser(idToken, targetRole || "student");

    if (data.onboardingRequired) {
      return res.status(200).json({
        success: true,
        status: "needs_onboarding",
        email: data.email,
        name: data.name,
        idToken: data.idToken
      });
    }

    res.status(200).json({
      success: true,
      message: "Google login successful",
      token: data.token,
      user: {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        studentProfile: data.user.studentProfile,
        organizerProfile: data.user.organizerProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

export const googleRegisterOrganizer = async (req, res, next) => {
  try {
    const { idToken, organizationName, phone } = req.body;
    if (!idToken || !organizationName) {
      return res.status(400).json({ success: false, message: "ID Token and Organization Name are required" });
    }

    const data = await authService.googleRegisterOrganizer(idToken, { organizationName, phone });
    res.status(201).json({
      success: true,
      message: "Google organizer registration successful",
      token: data.token,
      user: {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        organizerProfile: data.user.organizerProfile
      }
    });
  } catch (error) {
    next(error);
  }
};