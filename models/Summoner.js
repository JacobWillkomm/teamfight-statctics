const mongoose = require("mongoose");

const SummonerSchema = new mongoose.Schema({
    summonerName: {
        type: String,
        required: true
    },
    summonerId: {
        type: String,
        required: true
    }

})

module.exports = mongoose.model("Summoner", SummonerSchema);