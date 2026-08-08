import express from "express";
import {
  sendNotification,
  myNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification,
} from "../controllers/notificationController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Admin Send (if needed for testing/compatibility)
router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  sendNotification
);

// User Get My Notifications (Both GET / and GET /my)
router.get(
  "/my",
  authMiddleware,
  myNotifications
);

router.get(
  "/",
  authMiddleware,
  myNotifications
);

// User Get Unread Count
router.get(
  "/unread-count",
  authMiddleware,
  getUnreadCount
);

// Mark a single notification as read (supports PUT and PATCH for compatibility)
router.put("/:id/read", authMiddleware, markRead);
router.patch("/:id/read", authMiddleware, markRead);

// Mark ALL unread notifications for this user as read (supports PUT and PATCH for compatibility)
router.put("/read-all", authMiddleware, markAllRead);
router.patch("/read-all", authMiddleware, markAllRead);

// Delete notification
router.delete("/:id", authMiddleware, deleteNotification);

export default router;