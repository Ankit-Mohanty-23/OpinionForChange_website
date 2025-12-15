import GoogleStrategy from "passport-google-oauth20";
import passport from "passport";
import Users from "../models/user.model.js";

export default function setupUser() {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await Users.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
            const email =
                profile.emails?.[0]?.value || profile._json?.email || null;
            const fullname =
                profile.displayName || profile._json?.name || "No Name";
            const avatarUrl =
                profile.photos?.[0]?.value || profile._json?.picture || "";

          if (!email) return done(new Error("No email found from Google"));

          let user = await Users.findOne({ googleId: profile.id });

          if (user) {
            if (!user.googleId) {
              user.googleId = profile.id;
              await user.save();
            }
            return done(null, user);
          }

          if (!user) {
            user = await new Users({
              googleId: profile.id,
              email,
              fullname,
              avatar: {
                type: "image",
                url: avatarUrl,
                public_id: "",
              },
            }).save();
          }
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}
