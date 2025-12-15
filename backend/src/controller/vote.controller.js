import Vote from "../models/vote.model.js";

/**
 * @desc    Handle Vote for a post
 * @route   PATCH /:postId/vote
 * @access  Private
 */

export async function postVote(req, res) {
  try {
    const userId = req.user?._id;
    const { postId } = req.params;
    const { action } = req.body;

    const existingVote = await Vote.findOne({
      targetId: postId,
      userId,
    }).exec();

    let updatedVote;

    if (existingVote) {
      // If same vote → remove it (toggle)
      if (existingVote.type === action) {
        await existingVote.deleteOne();
        updatedVote = null;
      } else {
        // Update to opposite vote
        const voteId = existingVote._id;
        updatedVote = await Vote.findByIdAndUpdate(
          voteId,
          { type: action },
          { new: true }
        );
      }
    } else {
      updatedVote = await Vote.create({
        userId,
        targetId: postId,
        targetType: "Post",
        type: action,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vote Updated!",
      data: updatedVote,
    });
  } catch (error) {
    console.log("Error adding vote: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while voting post",
    });
  }
}

/**
 * @desc    Handle Vote for a post
 * @route   PATCH /:commentId/vote
 * @access  Private
 */

export async function commentVote(req, res) {
  try {
    const userId = req.user?._id;
    const { commentId } = req.params;
    const { action } = req.body;

    const existingVote = await Vote.findOne({
      userId,
      targetId: commentId,
      targetType: "Comment",
    }).exec();

    let updatedVote;
    if (existingVote) {
      if (existingVote.type === action) {
        await existingVote.deleteOne();
        updatedVote = null;
      } else {
        updatedVote = await Vote.findByIdAndUpdate(
          existingVote._id,
          { type: action },
          { new: true }
        );
      }
    } else {
      updatedVote = await Vote.create({
        userId,
        targetId: commentId,
        targetType: "comment",
        type: action,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Comment vote updated.",
      data: updatedVote,
    });
  } catch (error) {
    console.error("Error voting on comment: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while voting comment",
    });
  }
}
