import express from "express";
import auth from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import {
  login,
  signup,
  getUser,
  SendOtp,
  addBio,
  addProfilePic,
  deleteUser,
} from "../controller/user.controller.js";
import {
  loginSchema,
  signupSchema,
  getUserIdSchema,
  getOtpSchema,
  getBioSchema,
  profilepicSchema,
} from "../validation/user.validation.js";
import { validate, validateFile } from "../middleware/validate.middleware.js";

const Router = express.Router();

Router.post("/signup", validate(loginSchema), signup);
Router.post("/login", validate(signupSchema), login);
Router.post("/verify", validate(getOtpSchema), SendOtp);
Router.get("/data", auth, validate(getUserIdSchema), getUser);
Router.delete("/delete", auth, validate(getUserIdSchema), deleteUser);
Router.put("/bio", auth, validate(getBioSchema), addBio);
Router.post(
  "/profile-pic",
  auth,
  upload.single("profile_pic"),
  validateFile(profilepicSchema),
  addProfilePic
);

export default Router;
