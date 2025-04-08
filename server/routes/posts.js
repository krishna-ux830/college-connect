import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import Post from "../models/Post.js"
import User from "../models/User.js"
import Notification from "../models/Notification.js"
import { auth } from "../middleware/auth.js"
import { createNotification } from "../utils/notifications.js"

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Set up multer storage for post images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/posts")

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, "post-" + uniqueSuffix + ext)
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

// @route   GET /api/posts
// @desc    Get all posts
// @access  Private
router.get("/", auth, async (req, res, next) => {
  try {
    const posts = await Post.find({
      isActive: true,
      $or: [
        { "timer.enabled": false },
        {
          "timer.enabled": true,
          "timer.expiresAt": { $gt: new Date() },
        },
      ],
    })
      .populate("author", "username profilePic role")
      .populate("comments")
      .sort({ createdAt: -1 })

    res.json(posts)
  } catch (error) {
    next(error)
  }
})

// @route   POST /api/posts
// @desc    Create a post
// @access  Private
router.post("/", auth, upload.single("image"), async (req, res, next) => {
  try {
    const { content, timer } = req.body

    // Validate content
    if (!content && !req.file) {
      return res.status(400).json({ message: "Post must have content or an image" })
    }

    const postData = {
      author: req.user.id,
      content: content || "",
      image: req.file ? `/uploads/posts/${req.file.filename}` : null,
    }

    if (timer && timer.enabled) {
      postData.timer = {
        enabled: true,
        duration: timer.duration,
        expiresAt: new Date(Date.now() + timer.duration * 24 * 60 * 60 * 1000), // Convert days to milliseconds
      }
    }

    const post = new Post(postData)
    await post.save()

    // Get author details for response
    const author = await User.findById(req.user.id).select("username profilePic role")

    // Create notifications for all users
    await createNotification(post._id, "Post", author.role === "faculty")

    // Emit new post notification
    try {
      const io = req.app.get("io")
      if (io) {
        io.emit("newPost", post)
      }
    } catch (error) {
      console.error("Error emitting new post notification:", error)
    }

    // Return post with author details
    const postResponse = {
      ...post.toObject(),
      author,
    }

    res.status(201).json(postResponse)
  } catch (error) {
    next(error)
  }
})

// @route   GET /api/posts/:id
// @desc    Get a post by ID
// @access  Private
router.get("/:id", auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username profilePic role")
      .populate("comments.user", "username profilePic")

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    res.json(post)
  } catch (error) {
    next(error)
  }
})

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" })
    }

    // Delete post image if exists
    if (post.image) {
      const imagePath = path.join(__dirname, "..", post.image)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    // Delete post
    await post.deleteOne(); 

    // Delete associated notifications
    await Notification.deleteMany({ contentType: "Post", contentId: post._id })

    res.json({ message: "Post removed" })
  } catch (error) {
    next(error)
  }
})

// @route   POST /api/posts/:id/like
// @desc    Like a post
// @access  Private
router.post("/:id/like", auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    // Check if post has already been liked by this user
    if (post.likes.some((like) => like.toString() === req.user.id)) {
      return res.status(400).json({ message: "Post already liked" })
    }

    // Add user to likes array
    post.likes.unshift(req.user.id)
    await post.save()

    res.json(post.likes)
  } catch (error) {
    next(error)
  }
})

// @route   POST /api/posts/:id/unlike
// @desc    Unlike a post
// @access  Private
router.post("/:id/unlike", auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    // Check if post has been liked by this user
    if (!post.likes.some((like) => like.toString() === req.user.id)) {
      return res.status(400).json({ message: "Post has not yet been liked" })
    }

    // Remove user from likes array
    post.likes = post.likes.filter((like) => like.toString() !== req.user.id)
    await post.save()

    res.json(post.likes)
  } catch (error) {
    next(error)
  }
})

// @route   POST /api/posts/:id/comment
// @desc    Add a comment to a post
// @access  Private
router.post("/:id/comment", auth, async (req, res, next) => {
  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" })
    }

    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    // Add comment to post
    post.comments.unshift({
      user: req.user.id,
      text,
    })

    await post.save()

    // Populate user details for the new comment
    await post.populate("comments.user", "username profilePic")

    res.json(post.comments)
  } catch (error) {
    next(error)
  }
})

// @route   DELETE /api/posts/:id/comment/:comment_id
// @desc    Delete a comment
// @access  Private
router.delete("/:id/comment/:comment_id", auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    // Find the comment
    const comment = post.comments.find((comment) => comment._id.toString() === req.params.comment_id)

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" })
    }

    // Check if user is the comment author
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" })
    }

    // Remove comment
    post.comments = post.comments.filter((comment) => comment._id.toString() !== req.params.comment_id)
    await post.save()

    res.json(post.comments)
  } catch (error) {
    next(error)
  }
})

// @route   GET /api/posts/user/:username
// @desc    Get all posts by a specific user
// @access  Private
router.get("/user/:username", auth, async (req, res, next) => {
  try {
    // Find user by username
    const user = await User.findOne({ username: req.params.username })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Get all posts by this user
    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate("author", "username profilePic role")

    res.json(posts)
  } catch (error) {
    next(error)
  }
})

// @route   PATCH /api/posts/:id/timer
// @desc    Update post timer
// @access  Private
router.patch("/:id/timer", auth, async (req, res, next) => {
  try {
    const { timer } = req.body
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: "Post not found" })
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" })
    }

    if (timer && timer.enabled) {
      post.timer = {
        enabled: true,
        duration: timer.duration,
        expiresAt: new Date(Date.now() + timer.duration * 24 * 60 * 60 * 1000), // Convert days to milliseconds
      }
    } else {
      post.timer = {
        enabled: false,
        duration: 24,
        expiresAt: null,
      }
    }

    await post.save()
    res.json(post)
  } catch (error) {
    next(error)
  }
})

export default router

