import mongoose from "mongoose"

const pollSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  question: {
    type: String,
    required: [true, "Poll question is required"],
    trim: true,
  },
  options: [
    {
      text: {
        type: String,
        required: true,
      },
      voteCount: {
        type: Number,
        default: 0,
      },
    },
  ],
  votes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Poll = mongoose.model("Poll", pollSchema)

export default Poll

