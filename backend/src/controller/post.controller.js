import mongoose from "mongoose";
import Comment from "../models/comment.model.js";
import Vote from "../models/vote.model.js";
import Post from "../models/post.model.js";
import { v2 as cloudinary } from "cloudinary";
import checkToxicity from "../../Llama-setup/toxicity-check.js";
import AppError from "../util/AppError.js";
import { asyncHandler } from "../middleware/error.middleware.js";

/**
 * @desc    Create new post
 * @route   POST /:waveId/create-post
 * @access  Private
 */

export const createPost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user?._id;
  const { waveId } = req.params;

  let media = [];
  if (req.files && req.files.length > 0) {
    media = req.files.map((file) => ({
      url: file.path,
      type: file.mimetype.startsWith("video") ? "video" : "image",
      public_id: file.filename || file.public_id,
    }));
  }

  const response = await Post.create({
    userId,
    waveId,
    title,
    content,
    media,
  });

  return res.status(201).json({
    success: true,
    data: response,
  });
});

/**
 * @desc    Get user posts
 * @route   GET /posts?page=1
 * @access  Public
 */

export const getAllPosts = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const limit = 10;
  const page = Number(req.query.page) || 1;
  const skip = (page - 1)*limit;

  const posts = await Post.find({
    userId,
    isDeleted: false,
  })
  .sort({ createdAt: -1 })
  .skip(skip).limit(limit)
  .select("title content media upvoteCount downvoteCount commentCount isDeleted")
  .lean().exec();

  return res.status(200).json({
    success: true,
    data: posts,
  });
});

/**
 * @desc    Get any specific post
 * @route   GET /:postId
 * @access  Public
 */

export const getPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findOne({
    _id: postId,
    isDeleted: false,
  })
  .select("title content media upvoteCount downvoteCount commentCount isDeleted")
  .lean().exec();

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  return res.status(200).json({
    success: true,
    data: post,
  });
});

/**
 * @desc    Delete a post
 * @route   DELETE /post/:postId
 * @access  Private
 */

export const deletePost = asyncHandler(async (req, res)  => {
  const userId = req.user?._id;
  const { postId } = req.params;

  const post = await Post.findById(postId).lean();

  if (!post || post.isDeleted) {
    throw new AppError("Post not found", 404);
  }

  if (post.userId.toString() !== userId.toString()) {
    throw new AppError("Invalid User, You are not allowed to delete this post", 403);
  }

  const [commentCount, voteCount] = await Promise.all([
    Comment.countDocuments({ postId }),
    Vote.countDocuments({ targetId: postId, targetType: "Post" }),
  ]);

  const hasEngagement = commentCount > 0 || voteCount > 0;
  //Create new mongoose session
  const session = await mongoose.startSession();
  const now = new Date();
  
  try{
    session.startTransaction();

    //hard delete a post
    if(!hasEngagement){
      await Post.deleteOne({ _id: postId }, { session });
      await Comment.deleteMany({ postId }, { session });
      await Vote.deleteMany(
        { targetId: postId, targetType: "Post" },
        { session }
      );

      await session.commitTransaction();

        //Delete all media files from Cloudinary
      if (post.media && post.media?.length > 0) {
        for (const item of post.media) {
          if (item.public_id) {
            try{
              await cloudinary.uploader.destroy(item.public_id, {
                resource_type: item.type === "video" ? "video" : "image",
              });
            }catch(err){
              logger.error({
                message: "Cloudinary cleanup failed",
                postId,
                publicId: item.public_id,
                error: err.message,
              });
            }
          }
        }
      }      

      return res.status(200).json({
        success: true,
        message: "Post permanently deleted"
      });
    }

    await Post.updateOne(
      { _id: postId },
      { $set: { isDeleted: true, deletedAt: now } },
      { session }
    );

    await Comment.updateMany(
      { postId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: now } },
      { session }
    );

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  }catch(error){
    await session.abortTransaction();
    throw error;
  }finally{
    session.endSession();
  }
});

/**
 * @desc    strict toxicity classifier
 * @route   POST post/:postId/classify
 * @access  Public
 */

export const classifier = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findOne({
    _id: postId,
    isDeleted: false,
  });

  if (!post) {
    throw new AppError("Post not found for classifying", 404);
  }

  const [titleResult, contentResult] = await Promise.all([
    checkToxicity(post.title),
    checkToxicity(post.content),
  ]);

  if (!titleResult || !contentResult) {
    throw new AppError("Classification failed", 400);
  }

  const isToxic =
    titleResult.status === "rejected" &&
    contentResult.status === "rejected";

  // Persist moderation result
  await Post.updateOne(
    { _id: postId },
    {
      $set: {
        isToxic,
        toxicityReason: isToxic
          ? `Toxic content: ${titleResult.topCategory}`
          : null,
      },
    }
  );
  
  return res.status(200).json({
    success: true,
    isToxic,
    results: {
      title: titleResult,
      content: contentResult,
    },
  });
});

