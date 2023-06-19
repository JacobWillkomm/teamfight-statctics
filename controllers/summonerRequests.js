const SummonerRequest = require('../models/SummonerRequest')
require("dotenv").config({ path: "./config/.env" });

module.exports = {
    createSummonerRequest: async(req, res) => {
        try{
            const summonerRequests = await SummonerRequest.find({ summonerName: req.params.summonerName })
        
        }catch(err){
            //Create a request if no summonerRequest found

        }
    }
}