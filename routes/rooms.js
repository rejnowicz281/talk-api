const express = require("express");
const passport = require("passport");
const messageRouter = require("./messages");
const chatterRouter = require("./chatters");

const router = express.Router();

const { update, destroy, index, show, create } = require("../controllers/roomsController");

router.use("/:roomId/messages", messageRouter);
router.use("/:roomId/chatters", chatterRouter);
router.get("/", passport.authenticate("jwtAccessToken", { session: false }), index);
router.get("/:id", passport.authenticate("jwtAccessToken", { session: false }), show);
router.post("/", passport.authenticate("jwtAccessToken", { session: false }), create);
router.delete("/:id", passport.authenticate("jwtAccessToken", { session: false }), destroy);
router.put("/:id", passport.authenticate("jwtAccessToken", { session: false }), update);

module.exports = router;
