import passport from "passport";
import express from "express";
import auth from "../middleware/auth.middleware.js";
import jwt from "jsonwebtoken";

const router = express.Router();

/**
 * @desc   Start Google Login (Redirect to Google)
 * @route  GET /auth/google
 * @access Public
 */

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @desc   Google callback URL (After Google Auth)
 * @route  GET /auth/google/callback
 * @access Public
 */

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/fail" }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  }
);

/**
 * @desc   Login failed response
 * @route  GET /auth/fail
 * @access Public
 */

router.get("/fail", (req, res) => {
  res.status(401).json({
    success: false,
    message: "login Failure",
  });
});

/**
 * @desc   Profile Route - Get Logged In User
 * @route  GET /auth/profile
 * @access Protected (Needs session)
 */

router.get("/profile", auth, (req, res) => {
  res.status(200).json({
    success: true,
    message: "User Profile",
    user: req.user,
  });
});

/**
 * @desc   Get Current User (JWT-based)
 * @route  GET /auth/me
 * @access Protected (Needs JWT token)
 */

router.get("/me", auth, (req, res) => {
  res.status(200).json({
    success: true,
    message: "User Profile",
    user: req.user,
  });
});

/**
 * @desc   Logout User (Destroy Session)
 * @route  GET /auth/logout
 * @access Public
 */

router.get("/logout", (req, res) => {
  req.logOut((err) => {
    if (err)
      return res.status(500).json({
        message: "Logout Error",
      });
  });
  res.redirect(process.env.CLIENT_URL || "/");
});

export default router;
