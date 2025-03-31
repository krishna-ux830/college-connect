import express from "express"
import mongoose from "mongoose"
import Notification from "../models/Notification.js"
import { auth } from "../middleware/auth.js"

const router = express.Router()

// @route   GET /api/notifications
// @desc    Get all notifications for the current user
// @access  Private
router.get("/", auth, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
    .sort({ priority: -1, createdAt: -1 })
    .populate({
      path: "contentId",
      populate: {
        path: "author",
        select: "username profilePic role",
      },
    })
    // Format notifications for client
    const formattedNotifications = notifications.map((notification) => ({
      _id: notification._id,
      type: notification.contentType,
      content: notification.contentId,
      priority: notification.priority,
      read: notification.read,
      createdAt: notification.createdAt,
    }))

    res.json(formattedNotifications)
  } catch (error) {
    next(error)
  }
})

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.put("/:id/read", auth, async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id)

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    // Check if notification belongs to the user
    if (notification.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" })
    }

    // Mark as read
    notification.read = true
    await notification.save()

    res.json(notification)
  } catch (error) {
    next(error)
  }
})

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put("/read-all", auth, async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { $set: { read: true } })

    res.json({ message: "All notifications marked as read" })
  } catch (error) {
    next(error)
  }
})

export default router

