const express = require("express");
const router = express.Router();
const summonerRequestController = require("../controllers/summonerRequests");
const { ensureAuth, ensureGuest, ensureAdmin } = require("../middleware/auth");
const summonerRequests = require("../controllers/summonerRequests");

router.get("/", ensureAuth, ensureAdmin, summonerRequestController.getRequests)

router.post("/:summonerName", ensureAuth, summonerRequestController.createSummonerRequest)

router.delete("/deleteRequest/:summonerName", ensureAuth, ensureAdmin, summonerRequestController.deleteSummonerRequest)


module.exports = router;