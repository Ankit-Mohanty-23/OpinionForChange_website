import { z } from "zod";
import mongoose from "mongoose";

const objectSchema = z.string().refine(
    (id) => mongoose.Types.ObjectId.isValid(id), {
        message: "Invalid ObjectId format",
    }
);

export const postVoteSchema = {
    user: z.object({
        _id: objectSchema,
    }),

    params: z.object({
        postId: objectSchema,
    }),

    body: z.object({
        action: z.enum(["upvote", "downvote"], {
            required_error: "Vote action is required",
            invalid_type_error: "Action must be upvote or downvote"
        }),
    }),
};

export const commentVoteSchema = {
    user: z.object({
        _id: objectSchema,
    }),

    params: z.object({
        commentId: objectSchema,
    }),

    body: z.object({
        action : z.enum(["upvote", "downvote"], {
            required_error: "Vote action is required",
            invalid_type_error: "Action must be upvote or downvote"
        }),
    }),
};