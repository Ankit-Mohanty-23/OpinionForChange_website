import express from "express";
import { login, signup, getUser, getUserId, SendOtp } from "../controller/userController.js";

const Router = express.Router();

Router.post('/signup', signup);
Router.post('/login', login);
Router.post('/', getUserId);
Router.get('/:id', getUser);
Router.post('/verify', SendOtp);

export default Router;
