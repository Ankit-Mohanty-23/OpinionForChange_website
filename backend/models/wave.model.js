import mongoose from "mongoose";

const waveSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: function () {
        return `Welcome to ${this.name}'s wave.`;
      },
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [1000, "Summary cannot exceed 1000 characters"],
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
      index: true,
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
        validate: {
          validator: function (v) {
            // For Point type, coordinates must be [longitude, latitude]
            return (
              !v ||
              (Array.isArray(v) &&
                v.length === 2 &&
                v.every((coord) => typeof coord === "number"))
            );
          },
          message:
            "Coordinates must be an array of exactly 2 numbers [longitude, latitude]",
        },
      },
    },
    isVerified: {
      type: Boolean,
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
waveSchema.index({ createdAt: -1 });

export default mongoose.model("Wave", waveSchema);
