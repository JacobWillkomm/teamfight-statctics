const Api = require('twisted')
const Match = require("../models/Match");
const Summoner = require('../models/Summoner');
const SummonerMatch = require("../models/SummonerMatch");
require("dotenv").config({ path: "./config/.env" });
const fs = require('fs');
let rawChampionAssets = fs.readFileSync("./public/json/championAssets.json")
let championAssets = JSON.parse(rawChampionAssets);
console.log(championAssets)

const TftApi = new Api.TftApi({key: process.env.RIOT_API_KEY})

module.exports = {
    getMatch: async (req, res) => {
      console.log("GET MATCH")
        try {
          const match = await Match.findOne({ matchId: "NA1_"+req.params.id });
          console.log(match.info.participants)
          for(let i = 0; i < match.info.participants.length; i++){
            console.log("HERE", match.info.participants[i])
            
            //TODO: Better fix for nomsy tracking
            //      --Nomsy's class for the game gets added to his name
            //      --"nomsyevoker"
            for(let j = 0; j < match.info.participants[i].units.length; j++){
              if(match.info.participants[i].units[j].character_id.split('_')[1].toLowerCase().slice(0,5) === "nomsy"){
                match.info.participants[i].units[j].character_id = "TFT7_nomsy"
              }
            }
            //match.info.participants[i].units = Object.entries(match.info.participants[i].units)
          }
          //match.info.participants = Object.entries(match.info.participants).sort((a,b) => a[1].placement - b[1].placement)
          match.info.participants.sort((a,b) => a.placement - b.placement)
          res.render("match.ejs", { match: match, user: req.user, assets: championAssets.set_7.champions });
        } catch (err) {
          console.log(err);
        }
      },
    createMatch: async (req, res) => {
        console.log(req.body.matchId, "Consts:", Api.Constants.RegionGroups.AMERICAS)
        try {
          //riot API
          const result = await TftApi.Match.get(req.body.matchId, Api.Constants.RegionGroups.AMERICAS)
          //Checks for Match in DB and overwrites,
          console.log(result.response.info)
          await Match.findOneAndUpdate(
            {matchId: req.body.matchId},
            {
                matchId: req.body.matchId,
                metadata: result.response.metadata,
                info: result.response.info
            },
            {upsert: true, new: true}
          )
          console.log("Match Added");
          res.redirect("/matchfeed");
        } catch (err) {
          console.log(err);
        }
      },
    getMatches: async (req, res) => {
      try {
        console.log("getMatches()")
        const matches = await Match.find().sort().lean();
        //console.log(matches)
        res.render("matchfeed.ejs", { matches: matches });
      } catch (err) {
        console.log(err);
      }
    },
    //importMatches is triggered by a request, and includes summonerName as a parameter
    //   We get the puuid from Riot based on SummonerName
    //      TODO: just pass the puuid in the request?
    //   We get the list of matches from Riot API based on the puuid
    //   For each match:
    //      Check for the match in our DB:
    //          FALSE: -Make a Match request to riot
    //                 -Save Match request
    //                 -Create a SummonerMatch for the Summoner and the Match
    //
    //          TRUE:  -Create SummonerMatch if it doesn't already exist
    //      Redirect back
    
    importMatches: async (req, res) =>{
      function delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
      }
      try{
        //Get Matches from Riot api using puuid
        console.log(req.params)
        const result = await TftApi.Summoner.getByName( req.params.summonerName, Api.Constants.Regions.AMERICA_NORTH)
        console.log(result.response, result.response.puuid)
        const matchlistRequest = await TftApi.Match.list(result.response.puuid, Api.Constants.RegionGroups.AMERICAS, {count: 100})
        const matchlist = [...matchlistRequest.response]
        console.log(matchlist)
        await delay(3000)

        for(let i = 0; i < matchlist.length; i++){
          //Look for match in local database
          //TODO: can we improve checking the DB for a summonerMatch?
          //       -Get a list of Matches from both riot and DB and compare
          let matchInMongo = await Match.find({matchId: matchlist[i]}).limit(1);
          let summonerMatchInMongo = await SummonerMatch.find({summonerName: req.params.summonerName, matchId: matchlist[i]}).limit(1);
          if(matchInMongo.length === 0){ //not in local db
            //make a request to Riot
            await delay(500)
            const matchRequest = await TftApi.Match.get(matchlist[i], Api.Constants.RegionGroups.AMERICAS)
            //if we are in an older set, break
            if(matchRequest.response.info.tft_set_core_name !== "TFTSet7_2" && matchRequest.response.info.tft_set_core_name !== "TFTSet8"){
              console.log("break")
              console.log(matchRequest.response.info.tft_set_core_name)
              break;
            }
            //create db entry
            await Match.create({
              matchId: matchRequest.response.metadata.match_id,
              metadata: {
                dataVersion: matchRequest.response.metadata.data_version,
                matchId: matchRequest.response.metadata.match_id,
                participants: matchRequest.response.metadata.participants
              },
              info: {
                gameDate: matchRequest.response.info.game_datetime,
                gameLength: matchRequest.response.info.game_length,
                gameVersion: matchRequest.response.info.game_version,
                queueId: matchRequest.response.info.queue_id,
                tftGameType: matchRequest.response.info.tft_game_type,
                tftCoreSet: matchRequest.response.info.tft_set_core_name,
                tftSetNumber: matchRequest.response.info.tft_set_number,
                participants: matchRequest.response.info.participants,
              }
            })

            //Create summonerMatch Entry
            let matchStats = [...matchRequest.response.info.participants]
            let summonerMatchStats
            //loop through player stats and grab ours
            for(let j = 0; j < matchStats.length; j++){
              if(matchStats[j].puuid === result.response.puuid){
                summonerMatchStats = matchStats[j]
              }
            }

            //create summonerMatch in DB
            await SummonerMatch.create({
              summonerName: req.params.summonerName,
              summonerId: result.response.puuid,
              matchId: matchlist[i],
              setNumber: matchRequest.response.info.tft_set_number,
              data: {
                augments: summonerMatchStats.augments,
                goldLeft: summonerMatchStats.gold_left,
                lastRound: summonerMatchStats.last_round,
                level: summonerMatchStats.level,
                placement: summonerMatchStats.placement,
                playerEliminations: summonerMatchStats.playersEliminated,
                puuid: summonerMatchStats.puuid,
                timeEliminated: summonerMatchStats.time_eliminated,
                damageToPlayer: summonerMatchStats.total_damage_to_players,
                queueId: matchRequest.response.info.queue_id,
                traits: summonerMatchStats.traits,
                units: summonerMatchStats.units
              }
            })

          }else if (summonerMatchInMongo.length === 0){ //if match exists && new summoner requests
            let matchStats = [...matchInMongo[0].info.participants]
            let summonerMatchStats

            for(let j = 0; j < matchStats.length; j++){
              if(matchStats[j].puuid === result.response.puuid){
                summonerMatchStats = matchStats[j]
              }
            }
            //create summonerMatch
            await SummonerMatch.create({
              summonerName: req.params.summonerName,
              summonerId: result.response.puuid,
              matchId: matchlist[i],
              setNumber: matchInMongo[0].info.tftSetNumber,
              
              data: {
                augments: summonerMatchStats.augments,
                goldLeft: summonerMatchStats.gold_left,
                lastRound: summonerMatchStats.last_round,
                level: summonerMatchStats.level,
                placement: summonerMatchStats.placement,
                playerEliminations: summonerMatchStats.playersEliminated,
                puuid: summonerMatchStats.puuid,
                timeEliminated: summonerMatchStats.time_eliminated,
                damageToPlayer: summonerMatchStats.total_damage_to_players,
                queueId: matchInMongo[0].info.queueId,
                traits: summonerMatchStats.traits,
                units: summonerMatchStats.units
              }
            })
          }
        }
        res.redirect('back');
        
      } catch (err){
        console.log(err)
      }
    }
}