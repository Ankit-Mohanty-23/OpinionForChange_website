import { z } from "zod";
import mongoose from "mongoose";

const objectIdSchema = z.string().refine(
    (id) => mongoose.Schema.Types.ObjectId.isValid(id), {
        message: "Invalid mongoose Id"
    }
)

export const createCommentSchema = {
    user: z.object({
        _id: objectIdSchema,
    }),

    params: z.object({
        postId: objectIdSchema,
    }),

    body: z.object({
        content: z.string().trim().min(1, "Required comment content"),
        parentComment: objectIdSchema.optional().nullable(),
    })
};

export const getCommentSchema = {
    params: z.object({
        postId: objectIdSchema,
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
        commentId: objectIdSchema
    }),
}

export const deleteCommentSchema = {
    params: z.object({
        commentId: objectIdSchema
    }),

    user: z.object({
        _id: objectIdSchema,
    }),
}