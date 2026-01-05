import mongoose from "mongoose";
import Vote from "../models/vote.model.js";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import AppError from "../util/AppError.js";
import { asyncHandler } from "../middleware/error.middleware.js";

/**
 * @desc    Handle Vote for a post
 * @route   PATCH /:postId/vote
 * @access  Private
 */

export const postVote = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { postId } = req.params;
  const { action } = req.body; // "upvote" | "downvote"

  const post = await Post.findById(postId).lean();

  if(!post){
    throw new AppError("Post not found", 404);
  }

  if (post.isDeleted || post.isOrphaned) {
    throw new AppError("Cannot vote on this post", 403);
  }

  const session = await mongoose.startSession();
  let updatedVote = null;

  try{
    session.startTransaction()

    const existingVote = await Vote.findOne(
      {
        targetId: postId,
        targetType: "Post",
        userId,
      },
      null,
      { session }
    );

    // CASE 1: Existing vote
    if (existingVote) {
      // Toggle same vote
      if (existingVote.type === action) {
        await existingVote.deleteOne(
          { _id: existingVote._id },
          { session }
        );

        await Post.updateOne(
          { _id: postId },
          {
            $inc: {
              upvoteCount: action === "upvote" ? -1 : 0,
              downvoteCount: action === "downvote" ? -1 : 0,
            },
          },
          { session }
        );
      }
      // Switch vote
      else {
        await Vote.updateOne(
          { _id: existingVote._id },
          { $set: { type: action } },
          { session }
        );

        await Post.updateOne(
          { _id: postId },
          {
            $inc: {
              upvoteCount: action === "upvote" ? 1 : -1,
              downvoteCount: action === "downvote" ? 1 : -1,
            },
          },
          { session }
        );

        updatedVote = { ...existingVote.toObject(), type: action };
      }
    }

    // CASE 2: First vote
    else {
      const vote = await Vote.create(
        [
          {
            userId,
            targetId: postId,
            targetType: "Post",
            type: action,
          },
        ],
        { session }
      );

      await Post.updateOne(
        { _id: postId },
        {
          $inc: {
            upvoteCount: action === "upvote" ? 1 : 0,
            downvoteCount: action === "downvote" ? 1 : 0,
          },
        },
        { session }
      );

      updatedVote = vote[0];
    }

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Vote updated successfully",
      data: updatedVote,
    });
  }catch(error){
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});


/**
 * @desc    Handle Vote for a post
 * @route   PATCH /:commentId/vote
 * @access  Private
 */

export const commentVote = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { commentId } = req.params;
  const { action } = req.body; // "upvote" | "downvote"

  // 2. Fetch comment
  const comment = await Comment.findById(commentId)
  if (!comment || comment.isDeleted || comment.isOrphaned) {
    throw new AppError("Cannot vote on this comment", 403);
  }

  // 3. Fetch parent post (to respect orphaned / deleted rules)
  const post = await Post.findById(comment.postId)
  if (!post || post.isDeleted || post.isOrphaned) {
    throw new AppError("Cannot vote on this comment", 403);
  }

  const session = await mongoose.startSession();
  let updatedVote = null;

  try{
    session.startTransaction()
    // 4. Find existing vote
    const existingVote = await Vote.findOne(
      {
        userId,
        targetId: commentId,
        targetType: "Comment",
      },
      null,
      { session }
    );

    /**
     * CASE 1: Existing vote
     */
    if (existingVote) {
      // Toggle same vote → remove
      if (existingVote.type === action) {
        await existingVote.deleteOne({ session });
      }
      // Switch vote
      else {
        await Vote.updateOne(
          { _id: existingVote._id },
          { $set: { type: action } },
          { session }
        );

        updatedVote = { ...existingVote.toObject(), type: action };
      }
    }

    /**
     * CASE 2: First-time vote
     */
    else {
       const vote = await Vote.create(
        [
          {
            userId,
            targetId: commentId,
            targetType: "Comment",
            type: action,
          },
        ],
        { session }
      );
      updatedVote = vote[0];
    }

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Comment vote updated successfully",
      data: updatedVote,
    });
  }catch(error){
    await session.abortTransaction()
    throw error;
  } finally {
    session.endSession();
  }
});
