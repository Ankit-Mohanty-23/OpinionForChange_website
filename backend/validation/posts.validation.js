import { z } from "zod";
import mongoose from "mongoose";

const objectSchema = z.string().refine(
    (id) => mongoose.Types.ObjectId.isValid(id), {
        message: "Invalid ObjectId format",
      });

export const createPostSchema = {
    body: z.object({
        title: z.string().trim().min(1, "Title is missing"),
        content: z.string().trim().min(1, "Content is missing"),
    }),

    params: getWaveId.waveId,
    user: getUserId._id,
};

export const deletePostSchema = {
    user: getUserId._id,
    params: getPostId.params
}

export const getUserId = {
    user: z.object({
        _id: objectSchema,
    }),
};

export const getPostId = {
    params: z.object({
        postId: objectSchema,
    }),
};

export const getWaveId = {
    params: z.object({
        waveId: objectSchema,
    })
}