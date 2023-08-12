const express = require("express");

const router = express.Router();

const { show } = require("../controllers/usersController");

router.get("/:id", show);

module.exports = router;
