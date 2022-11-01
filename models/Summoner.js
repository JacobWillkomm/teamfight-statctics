const mongoose = require("mongoose");

const SummonerSchema = new mongoose.Schema({
    summonerName: {
        type: String,
        required: true
    },
    summonerId: {
        type: String,
        required: true
    },
    //TODO
    stats: {
        topFourPlacements: Number,
        weightedPlacements: Number,
        games: Number,
        augments : Map,
        champions: Map,
        traits: Map
    },


})

module.exports = mongoose.model("Summoner", SummonerSchema);