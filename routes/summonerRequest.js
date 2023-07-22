const express = require("express");
const router = express.Router();
const summonerRequestController = require("../controllers/summonerRequests");
const { ensureAuth, ensureGuest } = require("../middleware/auth");
const summonerRequests = require("../controllers/summonerRequests");

router.get("/", ensureAuth, summonerRequestController.getRequests)

router.post("/:summonerName", ensureAuth, summonerRequestController.createSummonerRequest)




module.exports = router;