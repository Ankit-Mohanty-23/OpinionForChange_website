import express from "express";
import upload from "../middleware/upload.js";
import auth from "../middleware/auth.js";
import { createPost ,getAllPosts, getPost, deletePost, toggleVote, addComment} from "../controller/postController.js";

const Router = express.Router();

Router.post("/create", auth, upload.array("media", 5), createPost);
Router.get("/all/:userId", getAllPosts);
Router.get("/one/:postId", getPost);
Router.delete("/:postId", auth, deletePost);
Router.patch("/:postId/vote", auth, toggleVote);
Router.patch("/:postId/comment", auth, addComment);

export default Router;  