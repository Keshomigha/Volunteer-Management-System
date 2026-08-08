import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getOrganizerStats,
} from "../controllers/eventController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { validateEvent } from "../middleware/validationMiddleware.js";

const router = express.Router();

// Public — student browse page sees all approved events
router.get("/", getEvents);

// Organizer — dashboard stats
router.get("/organizer/stats", authMiddleware, roleMiddleware("organizer"), getOrganizerStats);

// Organizer — only their own events (Manage Events page)
router.get("/my-events", authMiddleware, roleMiddleware("organizer"), getMyEvents);
router.get("/organizer/mine", authMiddleware, roleMiddleware("organizer"), getMyEvents);

// GET by ID must be placed after static routes to avoid routing parameters conflict
router.get("/:id", getEventById);

// Organizer — create, update, delete
router.post("/", authMiddleware, roleMiddleware("organizer"), validateEvent, createEvent);
router.put("/:id", authMiddleware, roleMiddleware("organizer", "admin"), validateEvent, updateEvent);
router.delete("/:id", authMiddleware, roleMiddleware("organizer", "admin"), deleteEvent);


export default router;
