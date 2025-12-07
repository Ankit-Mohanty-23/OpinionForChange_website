import express from "express";
import upload from "../middleware/upload.middleware.js";
import auth from "../middleware/auth.middleware.js";
import {
  createPost,
  getAllPosts,
  getPost,
  deletePost,
  toggleVote,
  addComment,
} from "../controller/post.controller.js";
import {
  getUserId,
  getPostId,
  getWaveId,
  createPostSchema,
  deletePostSchema,
} from "../validation/posts.validation.js";
import validatePost from "../middleware/post.middleware.js";

const Router = express.Router();

Router.post(
  "/create",
  auth,
  validatePost(createPostSchema),
  upload.array("media", 5),
  createPost
);
Router.get("/posts", auth, validatePost(createPostSchema), getAllPosts);
Router.get("/:postId", auth, validatePost(getPostId), getPost);
Router.delete("/:postId", auth, validatePost(deletePostSchema), deletePost);
Router.patch("/:postId/vote", auth, toggleVote);
Router.patch("/:postId/comment", auth, addComment);

export default Router;