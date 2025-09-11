import Users from "../models/userModel.js";
import jwt from "jsonwebtoken";
import sendMail from "../utils/sendEmails.js";

/**
 * @desc    Create new User
 * @route   POST /user/signup
 * @access  Public
 */

export async function signup(req, res) {
  try {
    const { email, fullname, password } = req.body;
    if (!email || !fullname || !password) {
      return res.status(400).json({
        msg: "Please provide email, fullName and password correctly",
      });
    }
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(200).json({
        msg: "user already exits",
      });
    }
    console.log("Creating new User..");
    const newUser = new Users({
      email,
      fullname,
      password,
    });
    await newUser.save();
    res.status(200).json({
      msg: "New User Created",
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: error.message,
      });
    }
    res.status(400).json({
      msg: "Server error: Error in Signup API:",
      error: error.message,
    });
  }
}

/**
 * @desc    Get Login
 * @route   POST /user/login
 * @access  Public
 */

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        msg: "Please provide email and password correctly",
      });
    }
    const user = await Users.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        status: "fail",
        msg: "Invalid credentials",
      });
    }

    if (!user.password) {
      return res.status(401).json({
        status: "fail",
        msg: "User password not found",
      });
    }

    // Ensure both password and stored password are strings
    let passwordToCompare = password;
    if (typeof password !== "string") {
      console.log("Password is not a string, converting...");
      passwordToCompare = String(password);
    }

    if (typeof user.password !== "string") {
      console.log("Stored password is not a string, converting...");
      user.password = String(user.password);
    }

    const isPasswordValid = await user.comparePassword(passwordToCompare);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "fail",
        msg: "Invalid credentials",
      });
    }

    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    res.status(200).json({
      status: "success",
      token,
    });
  } catch (error) {
    console.log("Error: ", error);
    res.status(500).json({
      msg: "Server error: Error in Login API",
      error: error.message,
    });
  }
}

/**
 * @desc    Get user Id
 * @route   POST /user
 * @access  Public
 */

export async function getUserId(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({
        msg: "Email not given",
      });
    }
    const userId = await Users.findOne({ email });
    if (!userId) {
      res.status(400).json({
        msg: "User not found",
      });
    }
    res.status(200).json({
      id: userId._id,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Server error: Error in getUserId API",
      error: error,
    });
  }
}

/**
 * @desc    Get user details
 * @route   GET /user/:id
 * @access  Public
 */

export async function getUser(req, res) {
  try {
    const userId = req.params.id;
    if (!userId) {
      res.status(400).json({
        msg: "Id not found",
      });
    }
    const UserData = await Users.findOne({ _id: userId });
    if (!UserData) {
      res.status(400).json({
        msg: "User Data not found",
      });
    }
    res.status(200).json({
      data: UserData,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Server error: Error in getUser API",
    });
  }
}

/**
 * @desc    Get email verification
 * @route   POST /user/verify
 * @access  Public
 */

export async function SendOtp(req, res) {
  try {
    const { email, fullname } = req.body;
    if (!email || !fullname) {
      res.status(400).json({
        msg: "Please provide email and name correctly",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("sending email.."); // 6-digit OTP
    const sentEmail = sendMail(fullname, email, otp);

    if (!sentEmail) {
      return res.status(500).json({
        msg: "Failed to send verification email",
        email,
      });
    }
    res.status(200).json({
      msg: "Verification email sent successfully",
      otp: otp,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Server error: Error in verification API",
      error: error,
    });
  }
}
