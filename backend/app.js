import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import volunteerRoutes from "./routes/volunteerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";  
import notificationRoutes from "./routes/notificationRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import organizerRoutes from "./routes/organizerRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import { getSettings, updateSettings, reports } from "./controllers/adminController.js";
import { getPublicSettings, getPublicStats } from "./controllers/settingsController.js";
import { getLeaderboard } from "./controllers/certificateController.js";
import authMiddleware from "./middleware/authMiddleware.js";
import roleMiddleware from "./middleware/roleMiddleware.js";
import errorHandler from "./middleware/errorHandler.js";
import xssSanitizer from "./middleware/xssSanitizer.js";
import { checkMaintenanceMode } from "./middleware/maintenanceMiddleware.js";

const app = express();
app.set("trust proxy", 1);

// Global Middlewares
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(",").map(url => url.trim().replace(/\/$/, ""))
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, "");
    if (
      cleanOrigin.includes("localhost") || 
      cleanOrigin.includes("127.0.0.1") ||
      cleanOrigin.endsWith(".vercel.app") ||
      allowedOrigins.includes(cleanOrigin) ||
      allowedOrigins.includes("*") ||
      allowedOrigins.length === 0
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(xssSanitizer);

// Unauthenticated public settings and stats endpoints
app.get("/api/public-settings", getPublicSettings);
app.get("/api/public-stats", getPublicStats);

// Maintenance Mode middleware check
app.use(checkMaintenanceMode);


// API Route Bindings
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/admin/logs", auditRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/organizer", organizerRoutes);
app.use("/api", reportRoutes);

// Direct mappings for settings and administrative dashboards
app.get("/api/reports/dashboard", authMiddleware, roleMiddleware("admin"), reports);
app.get("/api/settings", authMiddleware, roleMiddleware("admin"), getSettings);
app.put("/api/settings", authMiddleware, roleMiddleware("admin"), updateSettings);
app.get("/api/leaderboard", authMiddleware, getLeaderboard);

// Default status root page
app.get("/", (req, res) => {
  res.send("VolunteerHub Backend Running...");
});

// Mount the global centralized error handler
app.use(errorHandler);

export default app;
