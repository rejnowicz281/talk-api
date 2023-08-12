const express = require("express");
const passport = require("passport");
const messageRouter = require("./messages");

const router = express.Router();

const { index, show, create } = require("../controllers/roomsController");

router.use("/:roomId/messages", messageRouter);
router.get("/", passport.authenticate("jwt", { session: false }), index);
router.get("/:id", passport.authenticate("jwt", { session: false }), show);
router.post("/", passport.authenticate("jwt", { session: false }), create);

module.exports = router;
