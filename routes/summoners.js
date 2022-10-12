const express = require("express");
const router = express.Router();
const summonerController = require("../controllers/summoners");
const matchController = require("../controllers/matchs")
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now
router.get("/:summonerName", ensureAuth, summonerController.getSummonerProfile);

router.post("/:summonerName/importMatches", ensureAuth, matchController.importMatches);

router.post("/createSummoner", summonerController.createSummoner);

module.exports = router;
