import express from "express";
import auth from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { postVoteSchema } from "../validation/vote.validation.js";
import { postVote, commentVote } from "../controller/vote.controller.js";

const Router = express.Router();

Router.patch("/:postId/vote", auth, validate(postVoteSchema), postVote);
Router.patch("/:postId/vote", auth, validate(postVoteSchema), postVote);

export default Router;