import express from "express";
import {
  getAttendeesForEvent,
  markAttendance,
  bulkMarkAttendance,
  getMyAttendance,
  getAttendanceById,
  getAttendanceStats
} from "../controllers/attendanceController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
  validateMarkAttendance,
  validateBulkMarkAttendance
} from "../middleware/validationMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Organizer: statistics
router.get("/stats", roleMiddleware("organizer"), getAttendanceStats);

// Student: retrieve own attendance history
router.get("/my-attendance", roleMiddleware("student"), getMyAttendance);

// Organizer: list approved attendees for an event
router.get("/event/:eventId", roleMiddleware("organizer"), getAttendeesForEvent);

// Organizer: mark single volunteer attendance
router.post("/mark", roleMiddleware("organizer"), validateMarkAttendance, markAttendance);

// Organizer: bulk mark attendance
router.post("/bulk-mark", roleMiddleware("organizer"), validateBulkMarkAttendance, bulkMarkAttendance);

// Detail view (Student / Organizer / Admin)
router.get("/:id", getAttendanceById);

export default router;
