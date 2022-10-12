const express = require("express");
const router = express.Router();
const matchController = require("../controllers/matchs");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now
router.get("/:id", ensureAuth, matchController.getMatch);

router.post("/createMatch", matchController.createMatch);

//router.post("/:summonerName/importMatches", matchController.importMatches);

module.exports = router;