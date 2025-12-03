import mongoose from "mongoose";

const waveSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    summary: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: {
        url: { type: String, trim: true },
        public_id: { type: String, trim: true },
      },
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    isVerified: {
      type: boolean,
      default: false,
    },
    postCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

waveSchema.index({ location: "2dsphere" });
export default mongoose.model("Wave", waveSchema);
