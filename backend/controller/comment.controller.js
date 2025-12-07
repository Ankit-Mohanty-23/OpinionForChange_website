import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";


/**
 * @desc    Comments for a post
 * @route   POST post/:postId/comment/
 * @access  Public
 */

export async function addComment(req, res) {
    try {
      const userId = req.user?._id;
      const postId = req.params.postId;
      const { content } = req.body;
  
      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          msg: "Comment content is required",
        });
      }
  
      const post = await Post.findById({ _id: postId });
      if (!post) {
        return res.status(404).json({
          success: false,
          msg: "Post not found",
        });
      }
  
      // Fetch user to get username
      const user = await Users.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          msg: "User not found",
        });
      }
  
      post.comments.push({
        user: userId,
        username: user.fullname,
        text: content.trim(),
      });
      await post.save();
  
      res.status(200).json({
        success: true,
        post: post,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        msg: "Error in commenting",
        error: error.message,
      });
    }
  }
  