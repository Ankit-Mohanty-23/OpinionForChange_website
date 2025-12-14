import Post from "../models/post.model.js";
import Users from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import checkToxicity from "/Llama-setup/toxicity-check.js";

/**
 * @desc    Create new post
 * @route   POST /:waveId/create-post
 * @access  Private
 */

export async function createPost(req, res) {
  try {
    const { title, content } = req.body;
    const userId = req.user?._id;
    const { waveId } = req.params || {};

    let media = [];
    if (req.files && req.files.length > 0) {
      media = req.files.map((file) => ({
        url: file.path,
        type: file.mimetype.startsWith("video") ? "video" : "image",
        public_id: file.filename || file.public_id,
      }));
    }

    const newPost = await Post.create({
      userId,
      waveId,
      title,
      content,
      media,
    });

    return res.status(201).json({
      success: true,
      data: newPost,
    });
  } catch (error) {
    console.error("Error creating post: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating post",
    });
  }
}

/**
 * @desc    Get all posts
 * @route   GET /posts
 * @access  Public
 */

export async function getAllPosts(req, res) {
  try {
    const userId = req.user?._id;

    const posts = await Post.find({ userId }).lean().exec();

    if (posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Posts not found! ",
      });
    }

    return res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error("Error getting all posts: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching posts",
    });
  }
}

/**
 * @desc    Get any specific post
 * @route   GET /:postId
 * @access  Public
 */

export async function getPost(req, res) {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId).lean().exec();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found! ",
      });
    }

    return res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("Error getting post: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching post",
    });
  }
}

/**
 * @desc    Delete post
 * @route   DELETE post/:postId
 * @access  Private
 */

export async function deletePost(req, res) {
  try {
    const userId = req.user?._id;
    const { postId } = req.params;

    const deletedPost = await Post.findById(postId).lean().exec();

    if (!deletedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (deletedPost.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Invalid User, You are not allowed to delete this post",
      });
    }

    //Delete all media files from Cloudinary
    if (deletedPost.media && deletedPost.media.length > 0) {
      for (const item of deletedPost.media) {
        if (item.public_id) {
          await cloudinary.uploader.destroy(item.public_id, {
            resource_type: item.type === "video" ? "video" : "image",
          });
        }
      }
    }

    await Post.findByIdAndDelete(postId);

    return res.status(200).json({
      success: true,
      data: deletedPost,
    });
  } catch (error) {
    console.log("Error deleting post: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting post",
    });
  }
}

/**
 * @desc    strict toxicity classifier
 * @route   POST post/:postId/classify
 * @access  Public
 */

export async function classifier(req, res) {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found for classifying!",
      });
    }

    const title = post.title;
    const context = post.content;

    const titleResult = await checkToxicity(title);
    const contextResult = await checkToxicity(context);

    if (!contextResult && !titleResult) {
      return res.status(400).json({
        success: false,
        message: `Classification failed for ${title}`,
      });
    }

    res.status(200).json({
      success: true,
      class: contextResult,
    });

    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error while classifying post",
    });
  }
}
