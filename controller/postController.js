import Post from "../models/postModel.js";
import { v2 as cloudinary } from "cloudinary";

/**
 * @desc    Create new post
 * @route   POST /post/create
 * @access  Public
 */

export async function createPost(req, res) {
  try {
    const title = req.body?.title || "";
    const content = req.body?.content || "";
    const author = req.user?._id || "";

    if (!author || !title || !content) {
      return res.status(400).json({
        success: false,
        msg: "Please provide author, title and content",
      });
    }

    let media = [];
    if (req.files && req.files.length > 0) {
      media = req.files.map((file) => ({
        url: file.path,
        type: file.mimetype.startsWith("video") ? "video" : "image",
        public_id: file.filename || file.public_id,
      }));
    }

    const newPost = new Post({
      author,
      title,
      content,
      media,
    });

    const savedPost = await newPost.save();

    res.status(201).json({
      success: true,
      msg: "new post created",
      post: savedPost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      msg: "Failed in creating new post",
      error: error.message,
    });
  }
}

/**
 * @desc    Get all posts
 * @route   GET /post/all/:userId
 * @access  Public
 */

export async function getAllPosts(req, res) {
  try {
    const author = req.params.userId;

    const posts = await Post.find({author});
    if (posts.length === 0) {
      return res.status(404).json({
        success: false,
        msg: "No posts found! ",
      });
    }

    res.status(200).json({
      success: true,
      posts: posts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      msg: "Failed in fetching posts",
      error: error.message,
    });
  }
}

/**
 * @desc    Get any specific post
 * @route   GET /post/one/:postId
 * @access  Public
 */

export async function getPost(req, res) {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        msg: "Post not found! ",
      });
    }
    res.status(200).json({
      success: true,
      post: post,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      msg: "Failed in fetching post",
      error: error.message,
    });
  }
}

/**
 * @desc    Delete post
 * @route   DELETE post/:postId
 * @access  Public
 */

export async function deletePost(req, res) {
  try {
    const validUser = req.user?._id;
    const postId = req.params.postId;
    const deletedPost = await Post.findById({ _id: postId });

    if (!deletedPost) {
      return res.status(400).json({
        success: false,
        msg: "Post not found",
      });
    }

    if (validUser === deletedPost.author) {
      return res.status(400).json({
        success: false,
        msg: "Invalid User",
      });
    }

    // Delete all media files from Cloudinary
    if (deletedPost.media && deletedPost.media.length > 0) {
      for (const item of deletedPost.media) {
        if (item.public_id) {
          await cloudinary.uploader.destroy(item.public_id, {
            resource_type: item.type === "video" ? "video" : "image",
          });
        }
      }
    }

    await Post.findByIdAndDelete({ _id: postId });

    res.status(200).json({
      success: true,
      msg: "Post Deleted",
      post: deletedPost,
    });
  } catch (error) {
    console.log("error in deleting post: ", error);
    res.status(500).json({
      success: false,
      msg: "Server Error",
      error: error.message,
    });
  }
}

/**
 * @desc    Handle Vote for a post
 * @route   POST post/:postId/vote
 * @access  Public
 */

export async function toggleVote(req, res) {
  try {
    const userId = req.user?._id;
    const postId = req.params.postId;
    const { action } = req.body;

    const post = await Post.findById({ _id: postId });
    if (!post) {
      return res.status(404).json({
        success: false,
        msg: "Post not found",
      });
    }

    let updatedPost;
    if (action === "upvote") {
      if (post.upvotes.includes(userId)) {
        updatedPost = await Post.findByIdAndUpdate(
          post,
          { $pull: { upvotes: userId } },
          { new: true }
        );
      } else {
        updatedPost = await Post.findByIdAndUpdate(
          post,
          { $addToSet: { upvotes: userId }, $pull: { downvotes: userId } },
          { new: true }
        );
      }
    } else if (action === "downvote") {
      if (post.downvotes.includes(userId)) {
        updatedPost = await Post.findByIdAndUpdate(
          post,
          { $pull: { downvotes: userId } },
          { new: true }
        );
      } else {
        updatedPost = await Post.findByIdAndUpdate(
          post,
          { $addToSet: { downvotes: userId }, $pull: { upvotes: userId } },
          { new: true }
        );
      }
    } else {
      return res.status(400).json({
        success: false,
        msg: "Invalid vote action",
      });
    }

    res.status(201).json({
      success: true,
      msg: "Vote updated successfully",
      upvote: updatedPost.upvotes.length,
      downvotes: updatedPost.downvotes.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error updating vote",
      error: error.message,
    });
  }
}

/**
 * @desc    Comments for a post
 * @route   POST post/:postId/comment/
 * @access  Public
 */

export async function addComment(req, res){
    try{
        const userId = req.user?._id;
        const postId = req.params.postId;
        const { content } = req.body;

        const post = await Post.findById({ _id: postId });
        if(!post){
            return res.status(404).json({
                success: false,
                msg: "Post not found"
            });
        }

        post.comments.push({
            user: userId,
            text: content,
        });
        await post.save();

        res.status(200).json({
            msg: "Comment added",
            post: post
        })
    }catch(error){
        res.status(500).json({
            msg: "Error in commenting",
            error: error.message
        });
    }
}