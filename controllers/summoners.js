const Api = require('twisted')
const Summoner = require("../models/Summoner");
const SummonerMatch = require("../models/SummonerMatch");
const Match = require("../models/Match");
const { StatusApi } = require('twisted/dist/apis/lol/status/status');
require("dotenv").config({ path: "./config/.env" });
const fs = require('fs');
let rawChampionAssets = fs.readFileSync("./public/json/championAssets.json")
let championAssets = JSON.parse(rawChampionAssets);
let rawItemAssets = fs.readFileSync("./public/json/itemAssets.json")
let itemAssets = JSON.parse(rawItemAssets)

const TftApi = new Api.TftApi({key: process.env.RIOT_API_KEY})

module.exports = {
    getSummonerProfile: async (req, res) => {
        try {
          //From the Database, get the summoner
          const summoner = await Summoner.find({ summonerName: req.params.summonerName });
          //From the Database, get the summonerMatches
          const summonerMatches = await SummonerMatch.find({summonerId: summoner[0].summonerId}).sort({matchId: -1}).lean();
          //Object used to calculate stats here instead of frontend
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
          //      This woud require a list of games that have been added to the stats but we should be able to just use SummonerMatch
          summonerMatches.map((ele) => {
            console.log(ele)
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
                //TODO: Better fix for nomsy tracking
                //      --Nomsy's class for the game gets added to his name
                //      --"nomsyevoker"
                if(unit.character_id.split('_')[1].toLowerCase().slice(0,5) === "nomsy"){
                  unit.character_id = "TFT7_nomsy"
                }
                console.log("set_"+ele.setNumber, unit.character_id.split('_')[1].toLowerCase())
                stats.units[unit.character_id] = {score: score, games: 1, rank: score, assetUrl: championAssets["set_"+ele.setNumber].champions[unit.character_id.split('_')[1].toLowerCase()].assetUrl}
                
                //TODO Set 8 assets
                if(Object.hasOwn(championAssets["set_"+ele.setNumber].champions[unit.character_id.split('_')[1].toLowerCase()], "name")){
                  stats.units[unit.character_id].name = championAssets["set_"+ele.setNumber].champions[unit.character_id.split('_')[1].toLowerCase()].name
                }else{
                  stats.units[unit.character_id].name = unit.character_id.split('_')[1]
                }
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
            //      -Traits have a tier
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
          stats.unitArray = Object.entries(stats.units).sort()
          console.log("RENDER summonerProfile.ejs")
          res.render("summonerProfile.ejs", { summoner: summoner, summonerMatches: summonerMatches, stats: stats, user: req.user, assets: championAssets, itemAssets: itemAssets });
        } catch (err) {
          console.log("Summoner not Found")
          res.render("summonerNotFound.ejs")
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
    },
    getSearch: async (req, res) => {
      try {
        console.log("REQ: ",req.body)
        res.render("search.ejs");
      } catch (err){
        console.log(err);
      }
    },
    searchSummoners: async(req, res) => {
      try{
        console.log("At SearchSummoners ", req.query)
        res.redirect(req.query.summonerName.toString())
      } catch (err){
        console.log(err)
      }
    },
    getStats: async(req, res) =>{
      try{          

        /*
        {Character_id : {wins, games, rank, 
          {tier: {wins, games, rank}},
          {item: {wins, games, rank}}
        }}}

        {Character_id + tier : {wins: , games:, rank:,}}
        {Character_id : {wins: , games:, rank:,}}
        {Item_id : {wins:, games, rank,}}
        */
        let headUnitStats = {}
        let unitTierStats = {}
        let unitStats = {}
        let itemStats = {}
        console.log("Get Summoner Stats", req.params)
        //From the Database, get the summoner
        const summoner = await Summoner.find({ summonerName: req.params.summonerName });
        //From the Database, get the summonerMatches
        const summonerMatches = await SummonerMatch.find({summonerId: summoner[0].summonerId}).sort({matchId: -1}).lean();
        summonerMatches.forEach(match => {
          console.log(match)
          //TODO: Better tracking; this will double count units when you have 2 on same team
          match.data.units.forEach(unit => {
            console.log(unit, match)

            //"Head" Unit tracking:
            // Descrete Unit
            // Unit + Tier
            // Unit + Item
            if(Object.hasOwn(headUnitStats, unit.character_id)){
              //Descrete:
              headUnitStats[unit.character_id].games++
              headUnitStats[unit.character_id].rank += match.data.placement
              headUnitStats[unit.character_id].wins += (match.data.placement <= 4) ? 1 : 0

              //Unit + Tier tracking
              if(Object.hasOwn(headUnitStats[unit.character_id].tier, unit.tier)){
                headUnitStats[unit.character_id].tier[unit.tier].games++
                headUnitStats[unit.character_id].tier[unit.tier].rank += match.data.placement
                headUnitStats[unit.character_id].tier[unit.tier].wins += (match.data.placement <= 4) ? 1 : 0
              }else{
                headUnitStats[unit.character_id].tier[unit.tier] = {games: 1, rank: match.data.placement, wins: (match.data.placement <= 4) ? 1 : 0}
              }
            }else{
              headUnitStats[unit.character_id] = {games: 1, rank: match.data.placement, wins: (match.data.placement <= 4) ? 1 : 0, tier: {}, items: {}}
            }

            unit.itemNames.forEach(item => {
              //Unit + Item tracking
              if(Object.hasOwn(headUnitStats[unit.character_id].items, item)){
                headUnitStats[unit.character_id].items[item].games++
                headUnitStats[unit.character_id].items[item].rank += match.data.placement
                headUnitStats[unit.character_id].items[item].wins += (match.data.placement <= 4) ? 1 : 0
              }else{
                headUnitStats[unit.character_id].items[item] = {games: 1, rank: match.data.placement, wins: (match.data.placement <= 4) ? 1 : 0}
              }

              //Item tracking
              if(Object.hasOwn(itemStats, item)){
                itemStats[item].games++
                itemStats[item].rank += match.data.placement
                if(match.data.placement < 4){
                  itemStats[item].wins++
                }
              }else{
                itemStats[item] = {games: 1, rank: match.data.placement, wins: (match.data.placement <= 4) ? 1 : 0}
              }

            })
          })
        })

        console.log(headUnitStats)
        console.log(itemStats)
        
        console.log(summoner)
        res.render("summonerStats.ejs", {unitStats: headUnitStats, itemStats: itemStats})
      } catch (err){
        console.log(err)
      }
    }
}