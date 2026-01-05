import mongoose from "mongoose";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import sendMail from "../services/sendEmails.js";
import { v2 as cloudinary } from "cloudinary";
import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";
import Vote from "../models/vote.model.js";
import AppError from "../util/AppError.js";
import { asyncHandler } from "../util/asyncHandler.js";

/**
 * @desc    Create new User
 * @route   POST /user/signup
 * @access  Public
 */

export const signup = asyncHandler(async (req, res) => {
  const { email, fullname, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("User already exists, Login instead.", 409);
  }

  await User.create({
    googleId: "Custom Signup",
    email,
    fullname,
    password,
  });

  res.status(201).json({
    success: true,
    message: "New User Created",
  });
});

/**
 * @desc    Get Login
 * @route   POST /user/login
 * @access  Protected
 */

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Invalid Credentials", 401);
  }

  // Always cast password to string before comparing
  const isPasswordValid = await user.comparePassword(String(password));
  if (!isPasswordValid) {
    throw new AppError("Invalid Credentials", 401);
  }

  const token = jwt.sign(
    { id: user._id }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: "30d",
      issuer: "opinara-api",
      audience: "opinara-client",
    }
  );

  res.status(200).json({
    success: true,
    token,
  });
});

/**
 * @desc    Get user details
 * @route   GET /user/data
 * @access  Protected
 */

export const getUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const UserData = await User.findById(userId)
    .select(" fullname email wave profilePic bio isDeleted ")
    .lean()
    .exec();

  if (!UserData) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    data: UserData,
  });
});

/**
 * @desc    Get email verification
 * @route   POST /user/verify
 * @access  Protected
 */

export const sendOtp = asyncHandler(async (req, res) => {
  const { email, fullname } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await sendMail(fullname, email, otp);

  res.status(200).json({
    success: true,
    message: "Verification email sent successfully",
  });
});

/**
 * @desc    Add bio for profile
 * @route   POST /user/bio
 * @access  Protected
 */

export const addBio = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { bio } = req.body;

  const newBio = await User.findByIdAndUpdate(
    userId,
    { bio }, 
    { new: true, runValidators: true },
  );

  if (!newBio) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "User bio updated",
  });
});

/**
 * @desc    Add profile picture
 * @route   POST /user/profile-pic
 * @access  Protected
 */

export const addProfilePic = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not Found", 404);
  }

  if (user.profile_pic?.public_id) {
    await cloudinary.uploader.destroy(user.profile_pic.public_id);
  }

  user.profile_pic = {
    type: "image",
    url: req.file.path,
    public_id: req.file.filename,
  };
  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile picture updated successfully",
    profile_pic: user.profile_pic,
  });
});

/**
 * @desc    Delete user account
 * @route   DELETE /user
 * @access  Protected
 */

export const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user || user.isDeleted) {
    throw new AppError("User not Found", 404);
  }

  const [postCount, commentCount, voteCount] = await Promise.all([
    Post.countDocuments({ userId }),
    Comment.countDocuments({ userId }),
    Vote.countDocuments({ userId }),
  ]);

  const hasActivity = postCount > 0 || commentCount > 0 || voteCount > 0;
  const session = await mongoose.startSession();
  const now = new Date();

  try{
    session.startTransaction();

    /**
     * CASE 1: No activity → Hard delete
     */

    if (!hasActivity) {
      await User.findByIdAndDelete({ _id: userId }, { session });
      await Vote.deleteMany({ userId }, { session }); // defensive
      await Post.deleteMany({ userId }, { session });
      await Comment.deleteMany({ userId }, { session });

      await session.commitTransaction();

      return res.status(200).json({
        success: true,
        message: "User account permanently deleted",
      });
    }

    /**
     * CASE 2: Has activity → Soft delete + cascade hide
     */


    await User.updateOne(
      { _id: userId },
      { $set: { isDeleted: true, deletedAt: now } },
      { session }
    );

    await Post.updateMany(
      { userId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: now } }
    );

    await Comment.updateMany(
      { userId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: now } }
    );
    
    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "User account is deleted successfully",
    });
  }catch(error){
    await session.abortTransaction();
    throw error;
  } finally{
    session.endSession();
  }
});