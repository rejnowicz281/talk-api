const { generateAccessToken, generateRefreshToken } = require("../helpers/generateTokens");
const debug = require("debug")("app:authController");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const asyncHandler = require("../asyncHandler");
const imagekit = require("../imagekit");

const { body, validationResult } = require("express-validator");
const refreshTokenOptions = require("../helpers/refreshTokenOptions");

exports.register = [
    body("email")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Email must not be empty")
        .isEmail()
        .withMessage("Email must be a valid email address")
        .custom(async (value) => {
            const user = await User.findOne({ email: value });
            if (user) throw new Error("An account with that email already exists");
            return true;
        }),
    body("username")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Username must not be empty")
        .custom(async (value) => {
            const user = await User.findOne({ username: value });
            if (user) throw new Error("Username already in use");
            return true;
        }),
    body("password", "Password must not be empty").trim().isLength({ min: 1 }),
    body("password_confirm").custom((value, { req }) => {
        if (value !== req.body.password) throw new Error("Passwords do not match");
        return true;
    }),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

        let avatar;

        if (req.files && req.files.avatar) {
            const result = await imagekit.upload({
                file: req.files.avatar.data,
                fileName: req.files.avatar.name,
                folder: "/talk/avatars",
            });
            const url = imagekit.url({
                src: result.url,
                transformation: [
                    {
                        height: 100,
                        width: 100,
                        crop: "force",
                    },
                ],
            });
            debug("avatar url:", url);
            avatar = url;
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const userData = {
            email: req.body.email,
            password: hashedPassword,
            username: req.body.username,
            avatar: avatar || process.env.DEFAULT_AVATAR_URL,
        };

        const user = new User(userData);

        await user.save();

        const refresh_token = generateRefreshToken(user._id);
        const access_token = generateAccessToken(user);

        res.cookie("refresh_token", refresh_token, refreshTokenOptions)
            .status(200)
            .json({ message: "Register Successful", access_token });
    }),
];

exports.demoLogin = asyncHandler(async (req, res, next) => {
    let user = await User.findOne({ email: "demo@gmail.com" });

    if (!user) {
        debug("Demo user not found, creating new demo user...");
        user = new User({
            email: "demo@gmail.com",
            password: 123,
            username: "Demo User",
            avatar: process.env.DEFAULT_AVATAR_URL,
        });
        await user.save();
    }

    const refresh_token = generateRefreshToken(user._id);
    const access_token = generateAccessToken(user);

    res.cookie("refresh_token", refresh_token, refreshTokenOptions)
        .status(200)
        .json({ message: "Demo Login Successful", access_token });
});

exports.login = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const validPassword = await bcrypt.compare(req.body.password, user.password);

    if (!validPassword) return res.status(401).json({ message: "Invalid email or password" });

    const refresh_token = generateRefreshToken(user._id);
    const access_token = generateAccessToken(user);

    res.cookie("refresh_token", refresh_token, refreshTokenOptions)
        .status(200)
        .json({ message: "Login successful", access_token });
});

exports.refresh = async (req, res, next) => {
    const access_token = generateAccessToken(req.user);

    res.status(200).json({ message: "Token refresh successful", access_token });
};

exports.logout = async (req, res, next) => {
    res.clearCookie("refresh_token").status(200).json({ message: "Logout successful" });
};
