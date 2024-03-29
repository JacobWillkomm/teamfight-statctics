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
let rawTraitAssets = fs.readFileSync("./public/json/traitAssets.json")
let traitAssets = JSON.parse(rawTraitAssets)

const TftApi = new Api.TftApi({key: process.env.RIOT_API_KEY})

//Desc: Adds a match to the statsObject, both the overallStats and setStats
//Params: StatsObj, Match
//StatsObj is an object of objects with the key as the Set from the match
//Match is the match data from the database
//TODO: We should be able to instantiate the setStats inside this function so that the keys are not hardcoded
//TODO: This could be saved as its own model (SummonerName as FK), so that the server doesn't have to recalculate.
//      This woud require a list of games that have been added to the stats but we should be able to just use SummonerMatch
function addMatchToHeaderStats(statsObj, match){
  let set = "set_"+match.setNumber
  let score = match.data.placement
  //Ranked queue : 1100
  let setKeys = [set, "allSets"]
  setKeys.forEach(setTarget => {
    if(match.data.queueId === '1100') {
      statsObj[setTarget].rankedGames++;
      statsObj[setTarget].totalPlacementRanked += match.data.placement;
      statsObj[setTarget].winsRanked += (match.data.placement <= 4 ? 1 : 0);
    }
    //Normal and Bonus games
    else {
      statsObj[setTarget].normalGames++;
      statsObj[setTarget].totalPlacementNormal += match.data.placement;
      statsObj[setTarget].winsNormal += (match.data.placement <= 4 ? 1 : 0);
    }
    //Total number of games and place
    statsObj[setTarget].games++;
    statsObj[setTarget].totalPlacement += match.data.placement;
    statsObj[setTarget].wins += (match.data.placement <= 4 ? 1 : 0);

    //For each Unit in Units,
    //  check for unit in our stats obect, and add it if not
    match.data.units.map((unit) => {
      if(Object.hasOwn(statsObj[setTarget].units, unit.character_id)){
        statsObj[setTarget].units[unit.character_id].score += score
        statsObj[setTarget].units[unit.character_id].games++
        statsObj[setTarget].units[unit.character_id].rank = statsObj[setTarget].units[unit.character_id].score /statsObj[setTarget].units[unit.character_id].games
      }
      else{
        //TODO: Better fix for nomsy tracking
        //      --Nomsy's class for the game gets added to his name
        //      --"nomsyevoker"
        if(unit.character_id.split('_')[1].toLowerCase().slice(0,5) === "nomsy"){
          unit.character_id = "TFT7_nomsy"
        }
        statsObj[setTarget].units[unit.character_id] = {score: score, games: 1, rank: score, assetUrl: championAssets[set].champions[unit.character_id.split('_')[1].toLowerCase()].assetUrl}
        
        //TODO Set 8 assets
        if(Object.hasOwn(championAssets[set].champions[unit.character_id.split('_')[1].toLowerCase()], "name")){
          statsObj[setTarget].units[unit.character_id].name = championAssets[set].champions[unit.character_id.split('_')[1].toLowerCase()].name
        }else{
          statsObj[setTarget].units[unit.character_id].name = unit.character_id.split('_')[1]
        }
      }
    })

    //for each Augment in Augments
    //  check for augment in stats object, add if not
    match.data.augments.map((aug) => {
      if(Object.hasOwn(statsObj[setTarget].augments, aug)){
        statsObj[setTarget].augments[aug].score += score
        statsObj[setTarget].augments[aug].games++
        statsObj[setTarget].augments[aug].rank = statsObj[setTarget].augments[aug].score / statsObj[setTarget].augments[aug].games
      }else{
        statsObj[setTarget].augments[aug] = {score: score, games: 1, rank: score}
      }
    })

    //for each trait in Traits
    //  check for trait in our stats object
    //TODO: Improve stats calculation:
    //      -Traits have a tier
    match.data.traits.map((trait) => {
      if(Object.hasOwn(statsObj[setTarget].traits, trait.name)){
        statsObj[setTarget].traits[trait.name].score += score
        statsObj[setTarget].traits[trait.name].games++
        statsObj[setTarget].traits[trait.name].rank = statsObj[setTarget].traits[trait.name].score/statsObj[setTarget].traits[trait.name].games
      }else{
        statsObj[setTarget].traits[trait.name] = {score: score, games: 1, rank: score}
      }
    })
  })
}

//Desc: Sorts the Traits, Augments, and Units and add them to new values in the object 
//Params: statsObj
//statsObj is a object of Objects with the setNumber as the key
//TODO: Sort the units
function sortHeaderStats(statsObj){
  let statValues = Object.values(statsObj)
  statValues.forEach(setStats => {
    setStats.traitArray = Object.entries(setStats.traits).filter(ele => ele[1].games > 4).sort((a,b) => a[1].rank - b[1].rank)
    setStats.augmentArray = Object.entries(setStats.augments).filter(ele => ele[1].games > 1).sort((a,b) => a[1].rank - b[1].rank)
    setStats.unitArray = Object.entries(setStats.units).sort()
  })
}

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

          let allHeaderStats = {
            set_9 : JSON.parse(JSON.stringify(stats)),
            set_8 : JSON.parse(JSON.stringify(stats)),
            set_7 : JSON.parse(JSON.stringify(stats)),
            allSets : JSON.parse(JSON.stringify(stats))
          }

          //For each match, track the stats
          summonerMatches.map((ele) => {
            //console.log(ele.data.units)
            addMatchToHeaderStats(allHeaderStats, ele)
          })
          sortHeaderStats(allHeaderStats)
          
          console.log("RENDER summonerProfile.ejs")
          res.render("summonerProfile.ejs", { summoner: summoner, summonerMatches: summonerMatches, headerStats: allHeaderStats, user: req.user, assets: championAssets, itemAssets: itemAssets, traitAssets: traitAssets });
        } catch (err) {
          if(err instanceof TypeError){
            res.render("summonerNotFound.ejs", {user: req.user, summonerName: req.params.summonerName})
          }
          else{
            res.render("404.ejs", {user: req.user})
            console.log(err);
          }


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
        res.render("feed.ejs", {user: req.user, summoners: summoners });
      } catch (err) {
        console.log(err);
      }
    },
    getSearch: async (req, res) => {
      try {
        console.log("REQ: ",req.body)
        res.render("search.ejs", {user: req.user});
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
          match.data.units.forEach(unit => {
            console.log(unit, match)

            //"Head" Unit tracking includes three types of tracking: 
            // Descrete Unit; count the unit regardless of tier & item
            // Unit + Tier; count the unit and it's respective tier
            // Unit + Item; count the unit and its item; Each unit can have up to 3 items and each will be tracked separately
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
              headUnitStats[unit.character_id] = {character_id: unit.character_id, unit: unit, games: 1, rank: match.data.placement, wins: (match.data.placement <= 4) ? 1 : 0, tier: {}, items: {}}
              headUnitStats[unit.character_id].tier[unit.tier] = {games: 1, rank: match.data.placement, wins: (match.data.placement <= 4) ? 1 : 0}
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
        res.render("summonerStats.ejs", {user: req.user, unitStats: headUnitStats, itemStats: itemStats, championAssets: championAssets, itemAssets: itemAssets})
      } catch (err){
        console.log(err)
      }
    }
}