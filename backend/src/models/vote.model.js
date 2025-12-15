import mongoose from "mongoose";

const voteSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ["Post", "Comment"],
      required: true,
    },
    type: {
      type: String,
      enum: ["Upvote", "downVote"],
      required: true,
    },
  },
  { timestamps: true }
);

// Query speed
voteSchema.index({ targetId: 1, type: 1 });
voteSchema.index({ userId: 1, targetId: 1 });

export default mongoose.model("Vote", voteSchema);
