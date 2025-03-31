import User from "../models/User.js"
import Notification from "../models/Notification.js"

/**
 * Create notifications for all users when a new post or poll is created
 * @param {string} contentId - ID of the post or poll
 * @param {string} contentType - Type of content ('post' or 'poll')
 * @param {boolean} isPriority - Whether this is a priority notification (faculty content)
 */
export const createNotification = async (contentId, contentType, isPriority) => {
  try {
    // Get all users
    const users = await User.find().select("_id")

    // Create a notification for each user
    const notifications = users.map((user) => ({
      user: user._id,
      contentType,
      contentId,
      priority: isPriority,
    }))

    // Insert all notifications
    await Notification.insertMany(notifications)
  } catch (error) {
    console.error("Error creating notifications:", error)
  }
}

