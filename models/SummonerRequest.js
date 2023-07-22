const mongoose = require("mongoose");

const SummonerRequestSchema = new mongoose.Schema({
    summonerName: {
        type: String,
        required: true
    }
 }, { timestamps: true });

 module.exports = mongoose.model("SummonerRequest", SummonerRequestSchema);