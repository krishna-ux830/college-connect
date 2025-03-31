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
    const { username } = req.body

    // Find user
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
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

export default router

