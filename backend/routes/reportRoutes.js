import express from "express";
import {
  getOverviewStats,
  getUserGrowth,
  getEventReport,
  getApplicationReport,
  getCertificateReport,
  getTopOrganizations,
  getOrganizerDashboard,
  getEventPerformance,
  getLeaderboardReport
} from "../controllers/reportController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// All reports and analytics endpoints require authentication
router.use(authMiddleware);

// Admin Analytics Reports
router.get("/admin/reports/overview", roleMiddleware("admin"), getOverviewStats);
router.get("/admin/reports/user-growth", roleMiddleware("admin"), getUserGrowth);
router.get("/admin/reports/events", roleMiddleware("admin"), getEventReport);
router.get("/admin/reports/applications", roleMiddleware("admin"), getApplicationReport);
router.get("/admin/reports/certificates", roleMiddleware("admin"), getCertificateReport);
router.get("/admin/reports/top-organizations", roleMiddleware("admin"), getTopOrganizations);

// Organizer Analytics Reports
router.get("/organizer/reports/dashboard", roleMiddleware("organizer"), getOrganizerDashboard);
router.get("/organizer/reports/event/:eventId", roleMiddleware("organizer"), getEventPerformance);

// Leaderboard Reports (Admin and Organizer access, Student excluded)
router.get("/reports/leaderboard", roleMiddleware("admin", "organizer"), getLeaderboardReport);

export default router;
