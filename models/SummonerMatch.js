const mongoose = require("mongoose");

const SummonerMatchSchema = new mongoose.Schema({
    summonerId: {
        type: String,
        required: true
    },
    summonerName: {
        type: String,
        required: true
    },
    matchId: {
        type: String,
        required: true
    },
    data: {
        augments: [String],
        companion: {
            contentId: String,
            skinId: String,
            species: String
        },
        goldLeft: Number,
        lastRound: Number,
        level: Number,
        placement: Number,
        playerEliminations: Number,
        puuid: String,
        timeEliminated: Number,
        damageToPlayer: Number,
        traits: [mongoose.Schema.Types.Mixed],
        units: [mongoose.Schema.Types.Mixed]
        // traits: [{
        //     name: String,
        //     numberUnits: Number,
        //     style: Number,
        //     tierCurrent: Number,
        //     tierTotal: Number,
        // }],
        // units: [{
        //     charId: String,
        //     itemNames: [String],
        //     items: [Number],
        //     name: String,
        //     rarity: Number,
        //     tier: Number
        // }]
    }

});

module.exports = mongoose.model("SummonerMatch", SummonerMatchSchema);