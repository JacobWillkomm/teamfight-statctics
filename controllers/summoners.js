const Api = require('twisted')
const Summoner = require("../models/Summoner");
const SummonerMatch = require("../models/SummonerMatch");
const Match = require("../models/Match");
const { StatusApi } = require('twisted/dist/apis/lol/status/status');
require("dotenv").config({ path: "./config/.env" });

const TftApi = new Api.TftApi({key: process.env.RIOT_API_KEY})

module.exports = {
    getSummonerProfile: async (req, res) => {
        try {
          const summoner = await Summoner.find({ summonerName: req.params.summonerName });
          const summonerMatches = await SummonerMatch.find({summonerId: summoner[0].summonerId}).lean();

          let stats = {
             
            winrate: 0,
            winrateRanked: 0,
            winrateNormal: 0,
            totalPlacement: 0,
            totalPlacementNormal: 0,
            totalPlacementRanked: 0,
            games: 0, 
            normalGames: 0,
            rankedGames: 0,
            augments: {},
            units: {},
            traits: {},
          }
          summonerMatches.map((ele) => {
            console.log(ele)
            let score = ele.data.placement
            if(ele.data.queueId === '1090') {//Ranked queue
              stats.rankedGames++;
              stats.totalPlacementRanked += ele.data.placement;
              stats.winrateRanked += (ele.data.placement <= 4 ? 1 : 0);
            }else { //Normal and Bonus games
              stats.normalGames++;
              stats.totalPlacementNormal += ele.data.placement;
              stats.winrateNormal += (ele.data.placement <= 4 ? 1 : 0);
            }
            stats.games++;
            stats.totalPlacement += ele.data.placement;
            stats.winrate += (ele.data.placement <= 4 ? 1 : 0);

            ele.data.units.map((unit) => {
              console.log(unit.character_id)
              if(Object.hasOwn(stats.units, unit.character_id)){
                stats.units[unit.character_id].score += score
                stats.units[unit.character_id].games++
                stats.units[unit.character_id].rank = stats.units[unit.character_id].score /stats.units[unit.character_id].games
              }
              else{
                stats.units[unit.character_id] = {score: score, games: 1, rank: score}
              }
            })
            ele.data.augments.map((aug) => {
              if(Object.hasOwn(stats.augments, aug)){
                stats.augments[aug].score += score
                stats.augments[aug].games++
                stats.augments[aug].rank = stats.augments[aug].score / stats.augments[aug].games
              }else{
                stats.augments[aug] = {score: score, games: 1, rank: score}
              }
            })
            ele.data.traits.map((trait) => {
              if(Object.hasOwn(stat.traits, trait)){
                stats.traits[trait].score += score
                stats.traits[trait].games++
                stats.traits[trait].rank = stats.traits[trait].score/stats.traits[trait].games
              }else{
                stats.traits[trait] = {score: score, games: 1, rank: score}
              }
            })
          })

          console.log(stats.winrate/stats.games, stats.winrateRanked/stats.games, stats.units, stats.augments, stats.traits)


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