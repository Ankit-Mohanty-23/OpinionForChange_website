import express from "express";
import upload from "../middleware/upload.middleware.js";
import auth from "../middleware/auth.middleware.js";
import {
  createPost,
  getAllPosts,
  getPost,
  deletePost,
} from "../controller/post.controller.js";
import {
  getUserId,
  getPostId,
  getWaveId,
  createPostSchema,
  deletePostSchema,
} from "../validation/posts.validation.js";
import validate from "../middleware/validate.middleware.js";

const Router = express.Router();

Router.post(
  "/create",
  auth,
  validate(createPostSchema),
  upload.array("media", 5),
  createPost
);
Router.get("/", auth, validate(createPostSchema), getAllPosts);
Router.get("/:postId", auth, validate(getPostId), getPost);
Router.delete("/:postId", auth, validate(deletePostSchema), deletePost);

export default Router;
