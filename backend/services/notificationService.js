import Notification from "../models/notificationModel.js";
import { getSettings } from "./settingsService.js";

/**
 * Centrally creates a notification checking system setting.
 * Supports passing extra sequelize options such as a transaction.
 */
export const createNotification = async ({ userId, title, message, role }, options = {}) => {
  const settings = await getSettings();
  if (!settings.notificationsEnabled) {
    return null;
  }
  return await Notification.create({
    userId,
    title,
    message,
    role,
    isRead: false
  }, options);
};
