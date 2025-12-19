import mongoose from "mongoose";

const waveSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
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
      ref: "User",
      required: true,
      index: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: function (v) {
            // For Point type, coordinates must be [longitude, latitude]
            return (
              Array.isArray(v) &&
              v.length === 2 &&
              v[0] >= -180 && v[0] <= 180 &&
              v[1] >= -90 && v[1] <= 90
            );
          },
          message:
            "Coordinates must be [longitude, latitude]",
        },
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Boolean,
      default: null,
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

waveSchema.pre("save", function(next){
  if(
    this.createdBy && 
    !this.members.some(
      (id) => id.toString() === this.createdBy.toString
    )
  ){
    this.members.push(this.createdBy);
  }
  next();
});

waveSchema.index({ location: "2dsphere" });
waveSchema.index({ createdAt: -1 });

export default mongoose.model("Wave", waveSchema);
