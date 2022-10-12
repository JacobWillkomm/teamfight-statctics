const Api = require('twisted')
const SummonerMatch = require("../models/SummonerMatch");
require("dotenv").config({ path: "./config/.env" });

module.exports = {
    getSummonerMatch: async (req, res) => {
        try {
          const match = await Match.findById({ user: req.params.id });
          res.render("TODO", { match: match, user: req.user });
        } catch (err) {
          console.log(err);
        }
      },
    createSummonerMatch : async (req, res) => {
      try{
        await SummonerMatch.create({
          summonerId: req.body.summonerId,
          summonerName: req.params.summonerName,
          matchId: req.body.matchId,
        })
        console.log("Match added to player");
        res.redirect("/summoner/"+req.params.summonerName)
      } catch (err) {
        console.log(err);
      }
    },
}