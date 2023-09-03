const passport = require("passport");
const User = require("../models/user");
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const debug = require("debug")("app:jwtAccessToken");

passport.use(
    "jwtAccessToken",
    new JWTStrategy(
        {
            secretOrKey: process.env.ACCESS_TOKEN_SECRET,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        },
        async (payload, done) => {
            try {
                const user = await User.findById(payload.sub);

                if (user) {
                    debug("User is authenticated - proceeding...");
                    return done(null, user);
                } else {
                    debug("User is not authenticated - aborting...");
                    return done(null, false);
                }
            } catch (error) {
                done(error, null);
            }
        }
    )
);
