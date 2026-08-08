import { Op } from "sequelize";
import * as settingsService from "../services/settingsService.js";
import AuditLog from "../models/auditLogModel.js";
import User from "../models/userModel.js";
import Event from "../models/eventModel.js";
import Certificate from "../models/certificateModel.js";
import Attendance from "../models/attendanceModel.js";

export const getSettings = async (req, res) => {
  try {
    const settings = await settingsService.getSettings();
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const settings = await settingsService.updateSettings(req.body);
    
    // Log the update action to the AuditLog table
    await AuditLog.create({
      action: "SETTINGS_CHANGED",
      performedById: req.user.id,
      details: `Updated settings fields: ${Object.keys(req.body).join(", ")}`,
    });

    res.status(200).json({
      message: "Settings updated",
      settings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPublicSettings = async (req, res) => {
  try {
    const settings = await settingsService.getSettings();
    res.status(200).json({
      siteName: settings.siteName,
      adminEmail: settings.adminEmail,
      eventApprovalRequired: settings.eventApprovalRequired,
      notificationsEnabled: settings.notificationsEnabled,
      registrationOpen: settings.registrationOpen,
      maintenanceMode: settings.maintenanceMode,
      darkModeEnabled: settings.darkModeEnabled,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPublicStats = async (req, res) => {
  try {
    const activeVolunteers = await User.count({ where: { role: 'student' } });
    const eventsHosted = await Event.count({ where: { status: { [Op.ne]: 'Archived' } } });
    const partnerClubs = await User.count({ where: { role: 'organizer' } });
    const certHours = (await Certificate.sum('hours')) || 0;
    const attCount = await Attendance.count({ where: { status: 'Present' } });
    const volunteerHours = certHours + (attCount * 4);

    res.status(200).json({
      activeVolunteers,
      eventsHosted,
      partnerClubs,
      volunteerHours,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

