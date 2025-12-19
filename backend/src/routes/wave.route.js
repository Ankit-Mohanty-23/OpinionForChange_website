import { createWave, getWavePosts, getLocation } from "../controller/wave.controller.js";
import { createWaveSchema, getWavePostSchema, getLocationSchema } from "../validation/wave.validation.js"
import auth from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import upload from "../middleware/upload.middleware.js";
import express from "express";

const Router = express.Router();

Router.post("/create", auth, validate(createWaveSchema), createWave);
Router.get("/wave-posts", validate(getWavePostSchema), getWavePosts);
Router.patch("/location", auth, validate(getLocationSchema), getLocation);