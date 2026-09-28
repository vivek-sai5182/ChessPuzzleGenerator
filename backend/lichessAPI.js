import {Chess} from 'chess.js'
import fs from "fs";


const numOfGames=20
const numOfPlayers = 7
const topLichessPlayers = [
  "mraquariyaz67",
  "Ediz_Gurel",
  "Arkadiy_Khromaev",
  "nihalsarin2004",
  "AbasovN",
  "Lintchevski_Daniil",
  "VincentKeymer2004",
  "cutemouse83",
  "MaratGilfanovYoutube",
  "Night-King96",
  "msb2",
  "RoDoSfAtiHi",
  "Yarebore",
  "KnightCheckShadow",
  "Tuzakli_Egitim", 
  "Aronyak1",
  "promove2500",
  "F1nal_Masquerade",
  "Lionchess2023",
  "indianstar",
  "gmbrewchess",
  "Secret_Magnus",
  "Funo09",
  "Lance5500",
  "Dr_Tiger",
  "Sparrow-J",
  "Old_school70",
  "aaryan_varshney",
  "mutdpro",
  "goofypenguin",
  "yoseph2013",
  "HomayooonT",
  "HowellHub",
  "IAmMateCheckMate",
  "mind1mover",
  "IgorKowalski",
  "RealDavidNavara",
  "Vladimirovich9000",
  "iamstraw",
  "Heisenberg01",
  "Mitrabha",
  "Yakov25",
  "Lu_Shanglei",
  "chess-art-us",
  "penguingim1",
  "FaustiOro",
  "Sergoy45",
  "athena-pallada",
  "Sigma_Tauri",
  "Nozdrachev_Vladislav",
  "Mlchael",
  "IVK88",
  "AngelitoRT",
  "anythingforchess",
  "Zkid",
  "Super_FanZhendong",
  "Kostik_Mostik",
  "AVS2000",
  "Fabsid",
  "SaraciNderim",
  "DiaryTraining",
  "NeverEnough",
  "KAPUTVSEMU",
  "Chesstoday",
  "S2Pac"
];


function pickRandomPlayers(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

async function fetchGames(username,numOfGames) {
  const url =
  `https://lichess.org/api/games/user/${username}` +
  `?rated=true` +
  `&perfType=blitz,bullet` +
  `&moves=true` +
  `&pgnInJson=true` +
  `&evals=false` +
  `&clocks=false` +
  `&opening=false` +
  `&max=${numOfGames}`;
  const res = await fetch(url, {
    headers: {
      "Accept": "application/x-ndjson"
    }
  });

  if(!res.ok){
    console.log("response error");
  }

  const text = await res.text();
  const games = text
    .trim()
    .split("\n")
    .map(line => JSON.parse(line));

  return games;
}

// pgn to fens func
function pgnToFens(movesStr) {
  const chess = new Chess();
  const fens = [];

  const moves = movesStr.split(" ");

  for (const move of moves) {
    chess.move(move, { sloppy: true });
    fens.push(chess.fen());
  }

  return fens;
}

function write(url,games,count){
  
  for(const game of games){
      // console.log(game.winner)
      if (!game.moves) {
          console.log("Skipping game without moves:", game);
          continue;
      }
      
      let movesray = game.moves.split(" ")
      if(movesray.length<30 || movesray.length >99 || !game.winner) continue;

      let fensray = pgnToFens(game.moves)
      fensray = fensray.slice(16)

      fs.appendFileSync(url,`Game ${count.value++}\n`)
      fs.appendFileSync(url,`white ${game.players.white.user.name}\nblack ${game.players.black.user.name}\n`)
      for(const fen of fensray){
        fs.appendFileSync(url,`${fen}\n`)
      }
      fs.appendFileSync(url,"End\n")
  }
  
}

async function run(names,numOfGames){
  fs.writeFileSync("gamesFens.txt","")
  const count ={value:0}
  for(const name of names){
    let games = await fetchGames(name,numOfGames);
    write("gamesFens.txt",games,count)
  }
  console.log("writing ok")
}
const names = pickRandomPlayers(topLichessPlayers,numOfPlayers)
run(names,numOfGames)

