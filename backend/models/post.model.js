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
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
          required: true,
        },
        username: {
          type: String,
          required: true,
          trim: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: [1000, "Comment cannot exceed 1000 characters"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add index for sorting by newest posts
postSchema.index({ createdAt: -1 });

// Virtual for readable timestamps (doesn't store, computed on demand)
postSchema.virtual("readableCreatedAt").get(function () {
  return this.createdAt?.toLocaleString("en-IN", {
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
});

postSchema.virtual("readableUpdatedAt").get(function () {
  return this.updatedAt?.toLocaleString("en-IN", {
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
});

// Include virtuals in JSON output
postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

export default mongoose.model("Post", postSchema);
