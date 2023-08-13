const express = require("express");
const passport = require("passport");

const router = express.Router({ mergeParams: true });

const { create, destroy } = require("../controllers/chattersController");

router.post("/join", passport.authenticate("jwt", { session: false }), create);
router.delete("/:id", passport.authenticate("jwt", { session: false }), destroy);

module.exports = router;
