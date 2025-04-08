import mongoose from "mongoose"

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: [true, "Post content is required"],
    trim: true,
  },
  image: {
    type: String,
    default: null,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      text: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  timer: {
    enabled: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number, // Duration in days
      default: 1,
    },
    expiresAt: {
      type: Date,
    },
  },
}, { timestamps: true })

// Add index for efficient querying of active posts
postSchema.index({ isActive: 1, "timer.expiresAt": 1 })

const Post = mongoose.model("Post", postSchema)

export default Post

