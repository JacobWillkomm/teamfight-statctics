const SummonerRequest = require('../models/SummonerRequest')
require("dotenv").config({ path: "./config/.env" });

module.exports = {
    getRequests: async(req, res) => {
        try{
            const requests = await SummonerRequest.find().sort().lean()
            res.render("requests.ejs", {requests: requests});
        }catch(err){
            console.log(err)
        }
    },

    createSummonerRequest: async(req, res) => {
        try{
            console.log("At POST")
            const summonerRequests = await SummonerRequest.findOneAndUpdate({ summonerName: req.params.summonerName },{ summonerName: req.params.summonerName },{upsert: true, new: true})
            console.log("After Await summonerRequests")
            console.log(summonerRequests)
            
            res.sendStatus(204) //204 is 'No Content' response. Other option redirect: res.redirect('/'); This reloads page
        
        }catch(err){
            //Create a request if no summonerRequest found
            console.log(err)


        }
    }
}