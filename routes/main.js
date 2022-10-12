const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const summonerController = require("../controllers/summoners");
const matchController = require("../controllers/matchs");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Main Routes - simplified for now
router.get("/", homeController.getIndex);
router.get("/profiles", ensureAuth, summonerController.getProfiles);
router.get("/feed", ensureAuth, summonerController.getSummoners);
router.get("/matchfeed", ensureAuth, matchController.getMatches);
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);


module.exports = router;
