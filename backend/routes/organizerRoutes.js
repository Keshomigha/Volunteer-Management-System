import express from "express";
import {
  getOrganizerSettings,
  updateOrganizerSettings,
} from "../controllers/organizerController.js";
import { changePassword } from "../controllers/volunteerController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// GET  /api/organizer/settings  — load profile for Settings page
router.get(
  "/settings",
  authMiddleware,
  roleMiddleware("organizer"),
  getOrganizerSettings
);

// PUT  /api/organizer/settings  — save Settings page changes
router.put(
  "/settings",
  authMiddleware,
  roleMiddleware("organizer"),
  updateOrganizerSettings
);

// PUT /api/organizer/change-password — update organizer password
router.put(
  "/change-password",
  authMiddleware,
  roleMiddleware("organizer"),
  changePassword
);

export default router;
