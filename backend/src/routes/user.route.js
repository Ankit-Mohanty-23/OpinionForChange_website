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
} from "../controller/user.controller.js";

const Router = express.Router();

Router.post("/signup", signup);
Router.post("/login", login);
Router.post("/verify", SendOtp);
Router.get("/data", auth, getUser);
Router.put("/bio", auth, addBio);
Router.post("/profile-pic", auth, upload.single("profile_pic"), addProfilePic);

export default Router;
