const mongoose = require("mongoose");

const SummonerRequestSchema = new mongoose.Schema({
    summonerName: {
        type: String,
        required: true
    }
 })

 module.exports = mongoose.model("SummonerRequest", SummonerRequestSchema);