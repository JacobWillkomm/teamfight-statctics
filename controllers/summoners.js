const Api = require('twisted')
const Summoner = require("../models/Summoner");
const SummonerMatch = require("../models/SummonerMatch");
const Match = require("../models/Match")
require("dotenv").config({ path: "./config/.env" });

const TftApi = new Api.TftApi({key: process.env.RIOT_API_KEY})

module.exports = {
    getSummonerProfile: async (req, res) => {
        try {
          const summoner = await Summoner.find({ summonerName: req.params.summonerName });
          const summonerMatches = await SummonerMatch.find({summonerId: summoner[0].summonerId}).lean();
          const objSummonerMatches = summonerMatches
          let stats = {}
          let test = objSummonerMatches.reduce((sum, ele) => sum + (ele.data.placement <= 4 ? 1 : 0), 0)
          stats.winrate = test/summonerMatches.length
          console.log(test, stats)


          res.render("summonerProfile.ejs", { summoner: summoner, summonerMatches: summonerMatches, stats: stats, user: req.user });
        } catch (err) {
          console.log(err);
        }
      },
    getProfiles: async (req, res) => {
      try {
        console.log("getProfiles in SummonerController")
        const summoners = await Summoner.find().sort().lean();
        console.log(summoners)
        res.render("profile.ejs", { summoners: summoners, user: req.user });
      } catch (err) {
        console.log(err);
      }
    },
    createSummoner: async (req, res) => {
        console.log(req.body.summonerName, "Consts:", Api.Constants.Regions.AMERICA_NORTH)
        try {
          //riot API
          const result = await TftApi.Summoner.getByName( req.body.summonerName, Api.Constants.Regions.AMERICA_NORTH)
          console.log(result.response)
          //Checks for SummonerName in DB and overwrites
          await Summoner.findOneAndUpdate(
            {summonerName: req.body.summonerName},
            {
              summonerName: req.body.summonerName,
              summonerId: result.response.puuid,
            },
            {upsert: true, new: true}
          )
          console.log("Summoner Added");
          res.redirect("/feed");
        } catch (err) {
          console.log(err);
        }
      },
    getSummoners: async (req, res) => {
      try {
        const summoners = await Summoner.find().sort().lean();
        console.log(summoners)
        res.render("feed.ejs", { summoners: summoners });
      } catch (err) {
        console.log(err);
      }
    }
}