const express = require("express");
const router = express.Router();
const summonerController = require("../controllers/summoners");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now
router.get("/:id", ensureAuth, summonerController.getSummonerProfile);

router.post("/createSummoner", summonerController.createSummoner);

module.exports = router;
