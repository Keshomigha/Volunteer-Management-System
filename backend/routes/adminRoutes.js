import express from "express";

import authMiddleware
from "../middleware/authMiddleware.js";

import roleMiddleware
from "../middleware/roleMiddleware.js";

import {
dashboard,
getUsers,
getUserById,
createUser,
updateUser,
deleteUser,
getPendingEvents,
approveEvent,
rejectEvent,
reports,
updateUserStatus,
getOrganizations,
getOrganizationById,
getEvents,
getCertificateStats
}
from "../controllers/adminController.js";
import { getLogs } from "../controllers/auditController.js";
import settingsRoutes from "./settingsRoutes.js";
import { getAdminNotifications } from "../controllers/notificationController.js";

const router =
express.Router();



// Protect all admin routes
router.use(authMiddleware, roleMiddleware("admin"));

router.get(
"/dashboard",
dashboard
);

router.get(
"/users",
getUsers
);

router.get(
"/users/:id",
getUserById
);

router.post(
"/users",
createUser
);

router.put(
"/users/:id",
updateUser
);

router.delete(
"/users/:id",
deleteUser
);

router.get(
"/events/pending",
getPendingEvents
);

router.patch(
"/events/:id/approve",
approveEvent
);
router.put(
"/events/:id/approve",
approveEvent
);

router.patch(
"/events/:id/reject",
rejectEvent
);
router.put(
"/events/:id/reject",
rejectEvent
);

router.get(
"/reports",
reports
);

router.get(
"/reports/dashboard",
reports
);

router.use("/settings", settingsRoutes);

router.get("/notifications", getAdminNotifications);

// User status management
router.put("/users/:id/status", updateUserStatus);

// Organization management
router.get("/organizations", getOrganizations);
router.get("/organizations/:id", getOrganizationById);

// Event management listing
router.get("/events", getEvents);

// Audit logs
router.get("/audit-logs", getLogs);

// Certificate stats
router.get("/certificates/stats", getCertificateStats);

export default router;