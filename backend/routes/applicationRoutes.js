import express from "express";
import {
  applyToEvent,
  getMyApplications,
  getApplicationById,
  getOrganizerApplications,
  approveApplication,
  rejectApplication,
  getApplicationStats
} from "../controllers/applicationController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { validateApplication } from "../middleware/validationMiddleware.js";

const router = express.Router();

// All application routes require authentication
router.use(authMiddleware);

// Student only: apply for event
router.post("/", roleMiddleware("student"), validateApplication, applyToEvent);

// Student only: retrieve own applications
router.get("/my-applications", roleMiddleware("student"), getMyApplications);

// Organizer only: retrieve statistics
router.get("/stats", roleMiddleware("organizer"), getApplicationStats);

// Organizer only: retrieve applications for a specific event
router.get("/event/:eventId", roleMiddleware("organizer"), getOrganizerApplications);

// Organizer only: approve application
router.put("/:id/approve", roleMiddleware("organizer"), approveApplication);

// Organizer only: reject application
router.put("/:id/reject", roleMiddleware("organizer"), rejectApplication);

// Authenticated (Student, Organizer, Admin): view application details by ID (resource ownership checked internally)
router.get("/:id", getApplicationById);

export default router;
