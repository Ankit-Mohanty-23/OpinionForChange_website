import Wave from "../models/wave.model.js";
import { V2 as cloudinary } from "cloudinary";
import Post from "../models/post.model.js";
import summarize from "/Llama-setup/summarizer.js";

/**
 * @desc    Create new wave
 * @route   GET /create/wave
 * @access  Public
 */

export async function createWave(req, res) {
  try {
    const { name, description } = req.body;
    const userId = req.user?._id;

    if (!name || !description || !userId) {
      return res.status(400).json({
        success: false,
        msg: "please provide Name, description and userId.",
      });
    }

    let media = null;
    if (req.file) {
      media = {
        url: req.file.path,
        public_id: req.file.filename || req.file.public_id,
      };
    }

    const response = await new Wave({
      name,
      description,
      coverImage: media,
      createdBy: userId,
    }).save();

    if (!response) {
      return res.status(400).json({
        success: false,
        msg: "Failed to save Wave",
      });
    }

    res.status(201).json({
      success: true,
      msg: "New Wave created!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to create new Wave",
      error: error.message,
    });
  }
}

/**
 * @desc    Get all posts
 * @route   GET /wave/:waveId/posts?page=1
 * @access  Public
 */

export async function getWavePosts(req, res) {
  try {
    const userId = req.user?._id;
    const waveId = req.params;

    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * 10;

    const posts = await Post.find({ waveId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(10)
      .select("title content media upvotes downvotes createdAt") // field selection
      .populate("userId", "fullname profilePic");

    if (posts.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "Posts not found!",
      });
    }

    res.status(200).json({
      success: true,
      page,
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
