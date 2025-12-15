import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },
    waveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wave",
      index: true,
    },
    title: {
      type: String,
      trim: true,
      required: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      trim: true,
      maxlength: [5000, "Content cannot exceed 5000 characters"],
    },
    media: [
      {
        type: {
          type: String,
          enum: ["image", "video"],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// Add index for sorting by newest posts
postSchema.index({ createdAt: -1 });

export default mongoose.model("Post", postSchema);
