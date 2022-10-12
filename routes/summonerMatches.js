const express = require("express");
const router = express.Router();
const summonerMatchController = require("../controllers/summonerMatch");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now
router.post("/createSummonerMatch", summonerMatchController.createSummonerMatch);

module.exports = router;
