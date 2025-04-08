import express from "express"
import Poll from "../models/Poll.js"
import User from "../models/User.js"
import { auth } from "../middleware/auth.js"
import { createNotification } from "../utils/notifications.js"
import Notification from "../models/Notification.js"
const router = express.Router()

// @route   GET /api/polls
// @desc    Get all polls
// @access  Private
router.get("/", auth, async (req, res, next) => {
  try {
    const polls = await Poll.find({
      isActive: true,
      $or: [
        { "timer.enabled": false },
        {
          "timer.enabled": true,
          "timer.expiresAt": { $gt: new Date() },
        },
      ],
    }).populate("author", "username profilePic role")

    res.json(polls)
  } catch (error) {
    next(error)
  }
})

// @route   POST /api/polls
// @desc    Create a poll
// @access  Private
router.post("/", auth, async (req, res, next) => {
  try {
    const { question, options, timer } = req.body

    // Validate input
    if (!question) {
      return res.status(400).json({ message: "Question is required" })
    }

    if (!options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: "At least two options are required" })
    }

    const pollData = {
      author: req.user.id,
      question,
      options: options.map(option => ({ text: option, votes: [] })),
    }

    if (timer && timer.enabled) {
      pollData.timer = {
        enabled: true,
        duration: timer.duration,
        expiresAt: new Date(Date.now() + timer.duration * 24 * 60 * 60 * 1000), // Convert days to milliseconds
      }
    }

    const poll = new Poll(pollData)
    await poll.save()

    // Get author details for response
    const author = await User.findById(req.user.id).select("username profilePic role")

    // Create notifications for all users
    await createNotification(poll._id, "Poll", author.role === "faculty")

    // Emit new poll notification
    req.app.get("io").emit("newPoll", poll)

    // Return poll with author details
    const pollResponse = {
      ...poll.toObject(),
      author,
    }

    res.status(201).json(pollResponse)
  } catch (error) {
    next(error)
  }
})

// @route   GET /api/polls/:id
// @desc    Get a poll by ID
// @access  Private
router.get("/:id", auth, async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.id).populate("author", "username profilePic role")

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" })
    }

    res.json(poll)
  } catch (error) {
    next(error)
  }
})

// @route   POST /api/polls/:id/vote
// @desc    Vote on a poll
// @access  Private
router.post("/:id/vote", auth, async (req, res, next) => {
  try {
    const { optionIndex } = req.body

    if (!optionIndex) {
      return res.status(400).json({ message: "Option index is required" })
    }

    const poll = await Poll.findById(req.params.id)

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" })
    }

    if (!poll.isActive || (poll.timer.enabled && poll.timer.expiresAt < new Date())) {
      return res.status(400).json({ message: "Poll is no longer active" })
    }

    // Check if user has already voted
    const hasVoted = poll.options.some(option => 
      option.votes.includes(req.user.id)
    )

    if (hasVoted) {
      return res.status(400).json({ message: "You have already voted" })
    }

    poll.options[optionIndex].votes.push(req.user.id)
    await poll.save()

    res.json(poll)
  } catch (error) {
    next(error)
  }
})

// @route   DELETE /api/polls/:id
// @desc    Delete a poll
// @access  Private
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const poll = await Poll.findById(req.params.id)

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" })
    }

    // Check if user is the author
    if (poll.author.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" })
    }

    await poll.deleteOne(); 

    // Delete associated notifications
    await Notification.deleteMany({ contentType: "Poll", contentId: poll._id })

    res.json({ message: "Poll removed" })
  } catch (error) {
    next(error)
  }
})

// @route   GET /api/polls/user/:username
// @desc    Get all polls by a specific user
// @access  Private
router.get("/user/:username", auth, async (req, res, next) => {
  try {
    // Find user by username
    const user = await User.findOne({ username: req.params.username })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Get all polls by this user
    const polls = await Poll.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate("author", "username profilePic role")

    res.json(polls)
  } catch (error) {
    next(error)
  }
})

// @route   PATCH /api/polls/:id/timer
// @desc    Update poll timer
// @access  Private
router.patch("/:id/timer", auth, async (req, res, next) => {
  try {
    const { timer } = req.body
    const poll = await Poll.findById(req.params.id)

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" })
    }

    if (poll.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" })
    }

    if (timer && timer.enabled) {
      poll.timer = {
        enabled: true,
        duration: timer.duration,
        expiresAt: new Date(Date.now() + timer.duration * 24 * 60 * 60 * 1000), // Convert days to milliseconds
      }
    } else {
      poll.timer = {
        enabled: false,
        duration: 24,
        expiresAt: null,
      }
    }

    await poll.save()
    res.json(poll)
  } catch (error) {
    next(error)
  }
})

export default router

