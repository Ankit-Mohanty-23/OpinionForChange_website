import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import sendMail from "../services/sendEmails.js";
import { v2 as cloudinary } from "cloudinary";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import Vote from "../models/vote.model.js";
import logger from "../util/logger.js";

/**
 * @desc    Create new User
 * @route   POST /user/signup
 * @access  Public
 */

export async function signup(req, res) {
  const { email, fullname, password } = req.body;

  const logContext = {
    action: "SIGNUP",
    email,
  };

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exits",
      });
    }

    await User.create({
      googleId: "Custom Signup",
      email,
      fullname,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "New User Created",
    });
  } catch (error) {
    logger.error("User signup failed", {
      ...logContext,
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

/**
 * @desc    Get Login
 * @route   POST /user/login
 * @access  Protected
 */

export async function login(req, res) {
  const { email, password } = req.body;

  const logContext = {
    action: "LOGIN",
    email: email,
  };

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Always cast password to string before comparing
    const isPasswordValid = await user.comparePassword(String(password));
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
      issuer: "opinara-api",
      audience: "opinara-client",
    });

    return res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    logger.error("User login failed: ", {
      ...logContext,
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

/**
 * @desc    Get user details
 * @route   GET /user/data
 * @access  Protected
 */

export async function getUser(req, res) {
  const userId = req.user?._id;

  const logContext = {
    action: "GET_USER",
    userId: userId,
  };

  try {
    const UserData = await User.findOne({ _id: userId })
      .select(" fullname email wave profilePic bio isDeleted ")
      .lean()
      .exec();

    if (!UserData) {
      return res.status(404).json({
        success: false,
        message: "User Data not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: UserData,
    });
  } catch (error) {
    logger.error("Error getting user: ", {
      ...logContext,
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

/**
 * @desc    Get email verification
 * @route   POST /user/verify
 * @access  Protected
 */

export async function sendOtp(req, res) {
  const { email, fullname } = req.body;

  const logContext = {
    action: "SEND_OTP",
    email: email,
  };

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    console.info("sending email.."); // 6-digit OTP
    const sentEmail = await sendMail(fullname, email, otp);

    if (!sentEmail.success) {
      return res.status(502).json({
        success: false,
        message: sentEmail.message,
        error: sentEmail.error,
        mail: email,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    logger.error("Error sending OTP: ", {
      ...logContext,
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

/**
 * @desc    Add bio for profile
 * @route   POST /user/bio
 * @access  Protected
 */

export async function addBio(req, res) {
  const userId = req.user?._id;
  const { bio } = req.body;

  const logContext = {
    action: "UPDATE_BIO",
    userId: userId,
  };

  try {
    const newBio = await User.findByIdAndUpdate(userId, { bio }, { new: true });

    if (!newBio) {
      return res.status(404).json({
        success: false,
        message: "No user found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User bio updated",
    });
  } catch (error) {
    logger.error("Error adding user BIO: ", {
      ...logContext,
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

/**
 * @desc    Add profile picture
 * @route   POST /user/profile-pic
 * @access  Protected
 */

export async function addProfilePic(req, res) {
  const userId = req.user?._id;

  const logContext = {
    action: "UPDATE_PROFILE_PICTURE",
    userId: userId,
  };

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.profile_pic?.Protected_id) {
      try {
        await cloudinary.uploader.destroy(user.profile_pic.Protected_id);
      } catch (cloudinaryError) {
        console.error("Error deleting old profile picture:", cloudinaryError);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profile_pic: {
          type: "image",
          url: req.file.path,
          public_id: req.file.filename,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Failed to update profile picture",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      profile_pic: updatedUser.profile_pic,
    });
  } catch (error) {
    logger.error("Error adding profile pic: ", {
      ...logContext,
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

/**
 * @desc    Add profile picture
 * @route   POST /user/profile-pic
 * @access  Protected
 */

export async function deleteUser(req, res) {
  const userId = req.user?._id;

  const logContext = {
    action: "DELETE_USER",
    userId: userId,
  };

  try {
    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const [postCount, commentCount, voteCount] = await Promise.all([
      Post.countDocuments({ userId }),
      Comment.countDocuments({ userId }),
      Vote.countDocuments({ userId }),
    ]);

    const hasActivity = postCount > 0 || commentCount > 0 || voteCount > 0;

    /**
     * CASE 1: No activity → Hard delete
     */

    if (!hasActivity) {
      await User.findByIdAndDelete({ _id: userId });

      return res.status(200).json({
        success: true,
        message: "User account permanently deleted",
      });
    }

    /**
     * CASE 2: Has activity → Soft delete + cascade hide
     */

    const now = new Date();

    user.isDeleted = true;
    user.deletedAt = now;
    await user.save();

    await Post.updateMany(
      { userId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: now } }
    );

    await Comment.updateMany(
      { userId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: now } }
    );

    return res.status(200).json({
      success: true,
      message: "User account is deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting user: ", {
      ...logContext,
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
