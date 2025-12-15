import Comment from "../models/comment.model.js";

/**
 * @desc    Handle comment for a post
 * @route   POST /:postId/comment
 * @access  Private
 */

export async function createComment(req, res) {
  try {
    const userId = req.user?._id;
    const { postId } = req.params;
    const { content, parentComment } = req.body;

    const newComment = await Comment.create({
      postId,
      userId,
      text: content,
      parentCommentId: parentComment || null,
    });

    return res.status(201).json({
      success: true,
      data: newComment,
    });
  } catch (error) {
    console.error("Error creating new comment", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating comment",
    });
  }
}

/**
 * @desc    fetch comments for a post
 * @route   Get /:portId/comments
 * @access  Public
 */

export async function getRootComments(req, res) {
  try {
    const postId = req.params;
    const limit = Number(req.query.limit) || 20;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({
      postId,
      parentCommentId: null,
    })
      .sort({ vote: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const enriched = await promise.all(
      comments.map(async (c) => {
        const replyCount = await Comment.countDocuments({
          parentCommentId: c._id,
        });
        return { ...comments, replyCount };
      })
    );

    return res.status(200).json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    console.error("Error fetching parent comments: ", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching parent comments",
    });
  }
}

/**
 * @desc    fetch comments for a post
 * @route   Get /:commentId/comments
 * @access  Public
 */

export async function getReplies(req, res) {
  try {
    const { commentId } = req.params;

    const replies = await Comment.find({
      parentcommentId: commentId,
    })
      .sort({ vote: -1, createdAt: -1 })
      .lean();

    const enriched = await promise.all(
      replies.map(async (r) => {
        const replyCount = await Comment.countDocuments({
          parentCommentId: r._id,
        });
        return { ...r, replyCount };
      })
    );

    return res.status(200).json({
      success: false,
      data: enriched,
    });
  } catch (error) {
    console.error("Error getting replies: ", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching replies",
    });
  }
}

/**
 
1. Reddit Hotness Ranking — The Actual Formula
Reddit uses a ranking formula to sort posts/comments 
not just by votes or age, but a combination of both:
hotness = log10(max(votes, 1)) + (createdAt_in_seconds / 45000)

Meaning:
- Votes push a comment up
- Age pushes a comment down
- New comments with a few votes can beat old comments with many votes
This prevents old comments from staying at the top forever.

Final architecture:

- Load top-level comments only
parentCommentId = null

- Show reply count for each comment
countDocuments({ parentCommentId: id })

- When user opens replies, fetch:
Comment.find({ parentCommentId: id })

- For every reply, also return its own reply count

- Allow further expansion recursively

This is lazy loading + nested comments, 
and it is the same method used by FAANG because 
it's the only scalable pattern.

 */
