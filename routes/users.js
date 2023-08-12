const express = require("express");

const router = express.Router();

const { show } = require("../controllers/usersController");

router.get("/:username", show);

module.exports = router;
