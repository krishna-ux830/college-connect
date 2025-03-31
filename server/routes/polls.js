import express from "express"
import Poll from "../models/Poll.js"
import User from "../models/User.js"
import { auth } from "../middleware/auth.js"
import { createNotification } from "../utils/notifications.js"

const router = express.Router()

// @route   GET /api/polls
// @desc    Get all polls
// @access  Private
router.get("/", auth, async (req, res, next) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 }).populate("author", "username profilePic role")

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
    const { question, options } = req.body

    // Validate input
    if (!question) {
      return res.status(400).json({ message: "Question is required" })
    }

    if (!options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: "At least two options are required" })
    }

    // Create new poll
    const newPoll = new Poll({
      author: req.user.id,
      question,
      options,
    })

    const poll = await newPoll.save()

    // Get author details for response
    const author = await User.findById(req.user.id).select("username profilePic role")

    // Create notifications for all users
    await createNotification(poll._id, "Poll", author.role === "faculty")

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
    const { optionId } = req.body

    if (!optionId) {
      return res.status(400).json({ message: "Option ID is required" })
    }

    const poll = await Poll.findById(req.params.id)

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" })
    }

    // Check if user has already voted
    if (poll.votes.includes(req.user.id)) {
      return res.status(400).json({ message: "You have already voted on this poll" })
    }

    // Find the option
    const optionIndex = poll.options.findIndex((option) => option._id.toString() === optionId)

    if (optionIndex === -1) {
      return res.status(404).json({ message: "Option not found" })
    }

    // Increment vote count for the option
    poll.options[optionIndex].voteCount += 1

    // Add user to votes array
    poll.votes.push(req.user.id)

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

    // Delete pollait poll.remove();

    // Delete associated notifications
    await Notification.deleteMany({ contentType: "Poll", contentId: poll._id })

    res.json({ message: "Poll removed" })
  } catch (error) {
    next(error)
  }
})

export default router

