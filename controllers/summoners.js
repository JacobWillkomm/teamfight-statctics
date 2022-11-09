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
          //Object used to calculate stats here instead of front
          let stats = {
            wins: 0,
            winsRanked: 0,
            winsNormal: 0,
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
          //For each match, track the stats
          //      Placement represents the place the player got, 1 first, 8 last
          //      So a lower ratio between # games & total score is better but data quality is limited by the # of games
          //TODO: This could be saved as its own model (SummonerName as FK), so that the server doesn't have to recalculate.
          //      This woud require a list of games that have been added to the stats
          summonerMatches.map((ele) => {
            let score = ele.data.placement
            //Ranked queue : 1100
            if(ele.data.queueId === '1100') {
              stats.rankedGames++;
              stats.totalPlacementRanked += ele.data.placement;
              stats.winsRanked += (ele.data.placement <= 4 ? 1 : 0);
            }
            //Normal and Bonus games
            else {
              stats.normalGames++;
              stats.totalPlacementNormal += ele.data.placement;
              stats.winsNormal += (ele.data.placement <= 4 ? 1 : 0);
            }
            //Total number of games and place
            stats.games++;
            stats.totalPlacement += ele.data.placement;
            stats.wins += (ele.data.placement <= 4 ? 1 : 0);

            //For each Unit in Units,
            //  check for unit in our stats obect, and add it if not
            ele.data.units.map((unit) => {
              if(Object.hasOwn(stats.units, unit.character_id)){
                stats.units[unit.character_id].score += score
                stats.units[unit.character_id].games++
                stats.units[unit.character_id].rank = stats.units[unit.character_id].score /stats.units[unit.character_id].games
              }
              else{
                stats.units[unit.character_id] = {score: score, games: 1, rank: score}
              }
            })

            //for each Augment in Augments
            //  check for augment in stats object, add if not
            ele.data.augments.map((aug) => {
              if(Object.hasOwn(stats.augments, aug)){
                stats.augments[aug].score += score
                stats.augments[aug].games++
                stats.augments[aug].rank = stats.augments[aug].score / stats.augments[aug].games
              }else{
                stats.augments[aug] = {score: score, games: 1, rank: score}
              }
            })

            //for each trait in Traits
            //  check for trait in our stats object
            //TODO: Improve stats calculation:
            //      -Traits have a teir
            ele.data.traits.map((trait) => {
              if(Object.hasOwn(stats.traits, trait.name)){
                stats.traits[trait.name].score += score
                stats.traits[trait.name].games++
                stats.traits[trait.name].rank = stats.traits[trait.name].score/stats.traits[trait.name].games
              }else{
                stats.traits[trait.name] = {score: score, games: 1, rank: score}
              }
            })
          })

          console.log(stats.wins/stats.games, stats.winsNormal/stats.normalGames, stats.winsRanked/stats.rankedGames)
          stats.traitArray = Object.entries(stats.traits).filter(ele => ele[1].games > 4).sort((a,b) => a[1].rank - b[1].rank)
          stats.augmentArray = Object.entries(stats.augments).filter(ele => ele[1].games > 1).sort((a,b) => a[1].rank - b[1].rank)
          console.log(stats.traitArray, stats.augmentArray)

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