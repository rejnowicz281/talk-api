const express = require("express");
const passport = require("passport");

const router = express.Router({ mergeParams: true });

const { create } = require("../controllers/messagesController");

router.post("/", passport.authenticate("jwt", { session: false }), create);

module.exports = router;
