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
### Views:
##### Add summonerSearch to Header
##### Summoner Profile Stats
- ~~Champion Assets~~
- Borders based on Tier
- Star lv
- Detailed stats for match on summonerProfile
- Pagenation
- Store summonerStats so we can get them without recalculating
##### Detailed Champion, Augment, & Trait Stats
##### Match View
- Get all Summoners in Match
##### Global Stats View
### Flow:
##### ~~Fix login landing page~~
##### Get 10 matches for new Summoners (When Searched)
##### Add Summoners & SummonerMatches for all players in a match
##### Queue to handle requests to Riot
##### Loop through the players in a match and add each one
