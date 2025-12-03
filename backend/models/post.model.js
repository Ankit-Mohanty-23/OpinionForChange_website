import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    wave: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        trim: true,
        required: true,
    },
    content: {
        type: String,
        trim: true,
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
            }
        }
    ],
    upvotes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users"
        }
    ],
    downvotes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users"
        }
    ],
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Users",
            },
            text: String,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
},{
    timestamps: true,
})

// Save readable timestamps
postSchema.pre("save", function (next) {
    const readable = new Date().toLocaleString("en-IN", {
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  
    // If document newly created
    if (!this.createdAt) this.createdAt = readable;
  
    // Always update updatedAt
    this.updatedAt = readable;
  
    next();
  });

export default mongoose.model("Post", postSchema);