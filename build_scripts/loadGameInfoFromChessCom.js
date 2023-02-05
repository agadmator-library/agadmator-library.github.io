import * as fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

fs.readdirSync(__dirname + '/../db/video-games').slice(0, 5).forEach(fileName => {
    if (!fs.existsSync(__dirname + '/../db/chess-com-games/' + fileName)) {
        const videoGames = JSON.parse(fs.readFileSync(__dirname + '/../db/video-games/' + fileName, {encoding: 'utf8'}));

        videoGames.map(async game => {
            console.log(game.fen)

            let url = 'https://www.chess.com/games/search?fen=' + encodeURIComponent(game.fen)

            let result = await fetch()
            if (!result.ok) {
                throw "failed to fetch"
            }

           let text = await result.text();


            setTimeout(1000)
        })
    }
})
