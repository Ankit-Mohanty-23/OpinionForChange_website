import express from "express";
import LoginRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import logger from "./util/logger.js";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import setupUser from "./services/passport.js";
import authRouter from "./controller/google.auth.controller.js";
import globalErrorHandler from "./middleware/error.middleware.js";
import AppError from "./util/AppError.js";

console.log = (...args) => logger.debug(args.join(" "));
console.error = (...args) => logger.error(args.join(" "));
console.info = (...args) => logger.info(args.join(" "));
console.warn = (...args) => logger.warn(args.join(" "));

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: "GET, POST, PUT, DELETE",
    credentials: true,
  })
);

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET, // keep secret in .env in production
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Register Google OAuth strategy
setupUser();

app.use("/user", LoginRouter);
app.use("/posts", postRouter);
app.use("/auth", authRouter);

app.use(globalErrorHandler);

export default app;
