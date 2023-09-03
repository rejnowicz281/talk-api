const express = require("express");
const passport = require("passport");

const router = express.Router();

const { githubLogin, getToken } = require("../controllers/githubController");
const { register, login, demoLogin, refresh, logout } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/demo", demoLogin);
router.post("/refresh", passport.authenticate("jwtRefreshToken", { session: false }), refresh);
router.post("/logout", logout);
router.post("/github/token", getToken);
router.post("/github/login", passport.authenticate("github-token", { session: false }), githubLogin);

module.exports = router;
