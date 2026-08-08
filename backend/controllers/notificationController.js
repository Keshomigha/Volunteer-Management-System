import Notification from "../models/notificationModel.js";
import { getSettings } from "../services/settingsService.js";
import * as notificationService from "../services/notificationService.js";

// Admin send (for backward compatibility)
export const sendNotification = async (req, res) => {
  try {
    const { userId, title, message, role } = req.body;
    const notification = await notificationService.createNotification({ userId, title, message, role });
    if (!notification) {
      return res.status(400).json({ message: "Notifications are currently disabled in system settings." });
    }
    res.status(201).json({
      message: "Notification sent",
      notification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin view (returns all role=admin notifications for dashboard)
export const getAdminNotifications = async (req, res) => {
  try {
    const settings = await getSettings();
    if (!settings.notificationsEnabled) {
      return res.status(200).json([]);
    }
    const list = await Notification.findAll({
      where: { role: "admin" },
      order: [["createdAt", "DESC"]]
    });
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// For backward compatibility of previous getNotifications
export const getNotifications = getAdminNotifications;

// User view (returns authenticated user's notifications only, latest first)
export const myNotifications = async (req, res) => {
  try {
    const settings = await getSettings();
    if (!settings.notificationsEnabled) {
      return res.status(200).json([]);
    }
    const list = await Notification.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]]
    });
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const settings = await getSettings();
    if (!settings.notificationsEnabled) {
      return res.status(200).json({ unreadCount: 0 });
    }
    const unreadCount = await Notification.count({
      where: { userId: req.user.id, isRead: false }
    });
    res.status(200).json({ unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark read
export const markRead = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    // Ownership check: must match userId OR be admin role acting on admin notification
    if (notification.userId !== req.user.id && !(notification.role === "admin" && req.user.role === "admin")) {
      return res.status(403).json({ message: "Access denied" });
    }

    await notification.update({ isRead: true });
    res.status(200).json({
      message: "Marked as read",
      notification
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all read
export const markAllRead = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      await Notification.update(
        { isRead: true },
        { where: { role: "admin", isRead: false } }
      );
    } else {
      await Notification.update(
        { isRead: true },
        { where: { userId: req.user.id, isRead: false } }
      );
    }
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Ownership check: must match userId OR be admin role acting on admin notification
    if (notification.userId !== req.user.id && !(notification.role === "admin" && req.user.role === "admin")) {
      return res.status(403).json({ message: "Access denied" });
    }

    await notification.destroy();
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
