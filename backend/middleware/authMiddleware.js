import jwt from "jsonwebtoken";
import { getSettings } from "../services/settingsService.js";
import jwtConfig from "../config/jwt.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        message: "Access denied. No token provided",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      jwtConfig.secret
    );


    // Store user data
    req.user = decoded;

    // Check Maintenance Mode
    const settings = await getSettings();
    if (settings && settings.maintenanceMode && decoded.role !== "admin") {
      return res.status(503).json({
        message: "VolunteerHub is currently undergoing maintenance. Please try again later.",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

export default authMiddleware;