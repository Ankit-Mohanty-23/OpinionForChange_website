import { z } from "zod";
import mongoose from "mongoose";

const objectSchema = z.string().refine(
    (id) => mongoose.Schema.Types.ObjectId.isValid(id), {
        message: "Invalid mongoose Id"
    }
)

export const createCommentSchema = {
    user: z.object({
        _id: objectSchema,
    }),

    params: z.object({
        postId: objectSchema,
    }),

    body: z.object({
        content: z.string().trim().min(1, "Required comment content"),
        parentComment: objectSchema.optional().nullable(),
    })
};

export const getCommentSchema = {
    params: z.object({
        postId: objectSchema,
    }),

    query: z.object({
        limit: z.string().optional()
            .transform((val) => (val ? Number(val) : 20))
            .refine((val) => Number.isInteger(val) && val > 0, {
                message: "Limit must be a positive integer",
            }),

        page: z.string().optional()
            .transform((val) => (val? Number(val) : 1))
            .refine((val) => Number.isInteger(val) && val > 0, {
                message: "Page must be a positive integer",
            }),
    })

};

export const getRepliesSchema = {
    params: z.object({
        commentId: objectSchema
    }),
}
