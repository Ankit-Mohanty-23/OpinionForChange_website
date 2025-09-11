import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
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
                requied: true,
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
                ref: "User",
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

export default mongoose.model("Post", postSchema);