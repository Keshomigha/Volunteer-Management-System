import express from "express";
import {
  registerVolunteer,
  getVolunteers,
  getApplicationsForOrganizer,
  updateApplicationStatus,
  getStudentDashboardDetails,
  getStudentSettings,
  updateStudentSettings,
  changePassword,
} from "../controllers/volunteerController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Student dashboard stats & lists
router.get(
  "/student-dashboard",
  authMiddleware,
  roleMiddleware("student"),
  getStudentDashboardDetails
);

// Student Settings endpoints
router.get(
  "/settings",
  authMiddleware,
  roleMiddleware("student"),
  getStudentSettings
);

router.put(
  "/settings",
  authMiddleware,
  roleMiddleware("student"),
  updateStudentSettings
);

// Change Password endpoint
router.put(
  "/change-password",
  authMiddleware,
  changePassword
);

// Student applies for an event
router.post(
  "/register/:eventId",
  authMiddleware,
  roleMiddleware("student"),
  registerVolunteer
);

// Organizer — all applications across their events (Applications page)
router.get(
  "/applications",
  authMiddleware,
  roleMiddleware("organizer"),
  getApplicationsForOrganizer
);

// Organizer — approve or reject a single application
router.patch(
  "/applications/:id/status",
  authMiddleware,
  roleMiddleware("organizer"),
  updateApplicationStatus
);

// Organizer — approved volunteers for one event (Attendance page dropdown)
router.get(
  "/event/:eventId",
  authMiddleware,
  roleMiddleware("organizer"),
  getVolunteers
);

export default router;
