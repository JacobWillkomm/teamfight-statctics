# Teamfight Statctics:

Teamfight Statctics is a web app designed to help Teamfight Tacticts players track their stats and win rates. Teamfight Statctics is currently under development and pending review from Riot games before public consumption. 

Developed with Node.js and MongoDB, the front-end is currently using .ejs, and will be rebuilt using React.

Teamfight Statctics isn’t endorsed by Riot Games and doesn’t reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.


# Install:

`npm install`

---

# Setup:

- Create a `.env` file in config folder and add the following as `key = value`
  - PORT = 8000
  - DB_STRING = `your database URI`
  - RIOT_API_KEY = `your riot dev key`

---

# Run:


`npm start`


# TODO:
+ Views:
  + Add summonerSearch to Header
+ Summoner Profile Stats
  + ~~Champion Assets~~
  + Borders based on Tier
  + Star lv
  + Detailed stats for match on summonerProfile
  + Pagenation
  + Store summonerStats so we can get them without recalculating
+ Detailed Champion, Augment, & Trait Stats
+ Match View
  + Get all Summoners in Match
+ Global Stats View
+ Flow:
  + ~~Fix login landing page~~
  + Get 10 matches for new Summoners (When Searched)
  + Add Summoners & SummonerMatches for all players in a match
  + Queue to handle requests to Riot
  + Loop through the players in a match and add each one
