import Notification from "../models/Notification.js"
import { io } from "../index.js"

// Create a new notification
export const createNotification = async (req, res) => {
  try {
    const { recipient, type, content, relatedId } = req.body

    const notification = new Notification({
      recipient,
      type,
      content,
      relatedId,
      read: false
    })

    await notification.save()

    // Emit notification to the recipient's room
    io.to(recipient).emit("newNotification", notification)

    res.status(201).json(notification)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(50)

    res.json(notifications)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    res.json(notification)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params
    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    )

    res.json({ message: "All notifications marked as read" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
} 