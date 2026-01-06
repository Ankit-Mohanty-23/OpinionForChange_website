import mongoose from "mongoose";
import Wave from "../models/wave.model.js";
import { V2 as cloudinary } from "cloudinary";
import Post from "../models/post.model.js";
import summarize from "/Llama-setup/summarizer.js";
import AppError from "../util/AppError.js";
import { asyncHandler } from "../middleware/error.middleware.js";
import logger from "../util/logger.js";

/**
 * @desc    Create new wave
 * @route   POST /wave/create
 * @access  Public
 */

export const createWave = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { name, description } = req.body;

  const wave = await Wave.create({
    name,
    description,
    createdBy: userId,
  });

  res.status(201).json({
    success: true,
    data: wave,
  });
});

/**
 * @desc    Get all posts
 * @route   GET /wave/:waveId/posts?page=1
 * @access  Public
 */

export const getWavePosts = asyncHandler(async (req, res) => {
  const { waveId } = req.params;

  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * 10;

  const posts = await Post.find({ waveId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(10)
    .select("title content media") // field selection
    .populate({
      path: "userId",
      select: "fullname profilePic",
    })
    .lean();

  if (posts.length === 0) {
    throw new AppError("Post not found", 404);
  }

  res.status(200).json({
    success: true,
    page,
    data: posts,
  });
});

export const getLocation = asyncHandler(async (req, res) => {
  const { waveId } = req.params;
  const { longitude, latitude } = req.body;
  const userId = req.user?._id;

  const wave = await Wave.findOne({
    _id: waveId,
    creadtedBy: userId,
  })
    .lean()
    .exec();

  if (!wave) {
    throw new AppError("Wave not found", 404);
  }

  wave.location = {
    type: "Point",
    coordinates: [longitude, latitude],
  };
  await wave.save();

  return res.status(200).json({
    success: true,
    location: wave.location,
  });
});

/**
 * @desc    Deleting a wave
 * @route   DELETE /wave/delete/:waveId
 * @access  Public
 */

export const deleteWave = asyncHandler(async (req, res) => {
  const { waveId } = req.params;
  const userId = req.user?._id;

  const session = await mongoose.startSession();
  const now = new Date();

  try {
    session.startTransaction();

    const wave = await Wave.findById(waveId).session(session);

    if (!wave || wave.isDeleted) {
      throw new AppError("Wave not found", 404);
    }

    if (wave.createdBy.toString() !== userId.toString()) {
      throw new AppError(
        "Invalid user. You are not allowed to delete this wave",
        403
      );
    }

    const postCount = await Post.countDocuments({ waveId }).session(session);

    if (postCount === 0) {
      await Wave.deleteOne({ _id: waveId }, { session });

      await session.commitTransaction();

      return res.status(200).json({
        success: true,
        message: "Wave permanently deleted (no posts found)",
      });
    }

    await Wave.updateOne(
      { _id: waveId },
      { $set: { isDeleted: true, deletedAt: now } },
      { session }
    );

    await Post.updateMany(
      { waveId },
      { $set: { waveId: null, isOrphaned: true } },
      { session }
    );

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Wave deleted and posts preserved as orphaned content",
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

/**
 * @desc    Summarization of content
 * @route   POST /wave/summarize
 * @access  Public
 */

// export async function summary(req, res) {
//   try {
//     const postId = req.params.postId;

//     const posts = await Wave.find({   });
//     if (!post) {
//       return res.status(404).json({
//         success: false,
//         msg: "Post not found for summary!",
//       });
//     }

//     const content = post.content;
//     const title = post.title;
//     const result = await summarize(content);
//     if (!result) {
//       return res.status(400).json({
//         success: false,
//         msg: `summary failed for ${title}`,
//       });
//     }

//     res.status(200).json({
//       success: true,
//       summary: result,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       msg: "Failed in summaring the content",
//       error: error.message,
//     });
//   }
// }
