import { getSettings } from "../services/settingsService.js";
import jwt from "jsonwebtoken";
import jwtConfig from "../config/jwt.js";

/**
 * Middleware that blocks non-admin API requests when system maintenance mode is enabled.
 */
export const checkMaintenanceMode = async (req, res, next) => {
  try {
    const settings = await getSettings();

    if (settings.maintenanceMode) {
      const path = req.originalUrl || req.path || "";

      // Always allow public settings endpoint
      if (path.includes("/public-settings")) {
        return next();
      }

      // Check if user is an authenticated Admin
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
          const decoded = jwt.verify(token, jwtConfig.secret);
          if (decoded && decoded.role === "admin") {
            return next();
          }
        } catch (err) {
          // invalid token
        }
      }

      // Allow admin login and admin routes
      if (path.includes("/admin") || path.includes("/auth/login/admin")) {
        return next();
      }

      return res.status(503).json({
        maintenance: true,
        message: "VolunteerHub is currently undergoing scheduled maintenance. Please check back soon."
      });
    }

    next();
  } catch (error) {
    next();
  }
};
