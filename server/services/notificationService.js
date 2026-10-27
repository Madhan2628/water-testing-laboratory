import Notification from '../models/Notification.js';

export const createNotification = async ({
  recipient,
  targetRole,
  title,
  message,
  type,
  sample,
  report
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      targetRole,
      title,
      message,
      type,
      sample,
      report
    });
    return notification;
  } catch (error) {
    console.error('[NotificationService] Error creating notification:', error.message);
    return null;
  }
};
