import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  contentType: {
    type: String,
    enum: ["Post", "Poll"],
    required: true,
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "contentType",
    required: true,
  },
  priority: {
    type: Boolean,
    default: false,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Notification = mongoose.model("Notification", notificationSchema)

export default Notification

