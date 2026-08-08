import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { 
  validateStudentRegistration, 
  validateOrganizerRegistration,
  validateForgotPassword,
  validateResetPassword,
  validateVerifyOtp,
  validateResetPasswordWithOtp
} from "../middleware/validationMiddleware.js";
import { 
  registerStudent, 
  registerOrganizer, 
  login, 
  getMe, 
  forgotPassword, 
  verifyOtp,
  resetPassword,
  resetPasswordWithOtp,
  googleLogin,
  googleRegisterOrganizer
} from "../controllers/authController.js";
import { authRateLimiter, resetRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register/student", authRateLimiter, validateStudentRegistration, registerStudent);
router.post("/register/organizer", authRateLimiter, validateOrganizerRegistration, registerOrganizer);
router.post("/login", authRateLimiter, login);
router.post("/google-login", authRateLimiter, googleLogin);
router.post("/google-register/organizer", authRateLimiter, googleRegisterOrganizer);
router.get("/me", authMiddleware, getMe);
router.post("/forgot-password", resetRateLimiter, validateForgotPassword, forgotPassword);
router.post("/verify-otp", resetRateLimiter, validateVerifyOtp, verifyOtp);
router.post("/reset-password/:token", resetRateLimiter, validateResetPassword, resetPassword);
router.post("/reset-password-otp", resetRateLimiter, validateResetPasswordWithOtp, resetPasswordWithOtp);

export default router;