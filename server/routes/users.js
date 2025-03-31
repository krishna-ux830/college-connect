import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import User from "../models/User.js"
import { auth } from "../middleware/auth.js"

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Set up multer storage for profile pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/profiles")

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, "profile-" + uniqueSuffix + ext)
  },
})

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb(new Error("Only image files are allowed!"))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
})

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", auth, upload.single("profilePic"), async (req, res, next) => {
  try {
    const { username, email } = req.body

    // Find user
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Validate email domain if email is being updated
    if (email && email !== user.email) {
      if (!email.endsWith("@iiitg.ac.in")) {
        return res.status(400).json({ message: "Only IIIT Guwahati email addresses (@iiitg.ac.in) are allowed" })
      }

      // Check if email is already taken
      const existingUser = await User.findOne({ email })
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "Email is already registered" })
      }

      user.email = email
    }

    // Update fields
    if (username) user.username = username

    // Update profile picture if uploaded
    if (req.file) {
      // Delete old profile picture if exists
      if (user.profilePic) {
        const oldPicPath = path.join(__dirname, "..", user.profilePic)
        if (fs.existsSync(oldPicPath)) {
          fs.unlinkSync(oldPicPath)
        }
      }

      // Set new profile picture path
      user.profilePic = `/uploads/profiles/${req.file.filename}`
    }

    await user.save()

    // Return updated user without password
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      createdAt: user.createdAt,
    }

    res.json(userResponse)
  } catch (error) {
    next(error)
  }
})

// @route   GET /api/users/search
// @desc    Search users by username
// @access  Private
router.get("/search", auth, async (req, res, next) => {
  try {
    const { query } = req.query

    if (!query) {
      return res.status(400).json({ message: "Search query is required" })
    }

    // Search users by username (case-insensitive)
    const users = await User.find({
      username: { $regex: query, $options: "i" }
    })
      .select("username profilePic role")
      .limit(10)
      .lean()

    res.json(users)
  } catch (error) {
    next(error)
  }
})

// @route   GET /api/users/:username
// @desc    Get user data by username
// @access  Private
router.get("/:username", auth, async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("-password")
      .lean()

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    next(error)
  }
})

export default router


// The /:username route was placed before the /search route
// When you made a request to /api/users/search, Express was treating "search" as a username parameter
// This caused the search functionality to fail
// I've fixed this by:
// Moving the /search route before the /:username route
// Now Express will match /api/users/search correctly before trying to match the username parameter