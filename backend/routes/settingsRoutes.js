import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Restrict all settings endpoints to authenticated admins
router.use(authMiddleware, roleMiddleware("admin"));

router.get("/", getSettings);
router.put("/", updateSettings);

export default router;
