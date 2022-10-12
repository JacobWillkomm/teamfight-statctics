const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema({
    matchId: String,
    metadata: {
        dataVersion: String,
        matchId: String,
        participants: [String]
    },
    info: {
        gameDate: Number,
        gameLength: Number,
        gameVersion : String,
        queueId: String,
        tftGameType: String,
        tftCoreSet: String,
        tftSetNumber: Number,
        participants: [mongoose.Schema.Types.Mixed],
        /*
        participants: [{
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
            traits: [{
                name: String,
                numberUnits: Number,
                style: Number,
                tierCurrent: Number,
                tierTotal: Number,
            }],
            units: [{
                charId: String,
                itemNames: [String],
                items: [Number],
                name: String,
                rarity: Number,
                tier: Number
            }]
        }],
        */
    }
})

module.exports = mongoose.model("Match", MatchSchema);
