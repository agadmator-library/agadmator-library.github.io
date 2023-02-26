import * as fs from "fs";
import path from 'path';
import {fileURLToPath} from 'url';
import {Game} from "./extractPGN";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NAMESPACE_VIDEO_GAME = "videoGame"

export const NAMESPACE_VIDEO_SNIPPET = "videoSnippet"
export const NAMESPACE_VIDEO_CONTENT_DETAILS = "videoContentDetails"
export const NAMESPACE_CHESS_COM = "chessCom"
export const NAMESPACE_CHESS365 = "chess365"
export const NAMESPACE_CHESSTEMPO_COM = "chesstempoCom"
export const NAMESPACE_LICHESS_MASTERS = "lichessMasters"

const ALLOWED_NAMESPACES = [
    NAMESPACE_VIDEO_SNIPPET,
    NAMESPACE_VIDEO_CONTENT_DETAILS,
    NAMESPACE_VIDEO_GAME,
    NAMESPACE_CHESS_COM,
    NAMESPACE_CHESSTEMPO_COM,
    NAMESPACE_CHESS365,
    NAMESPACE_LICHESS_MASTERS
]

function getDir() {
    return `${__dirname}/../db`
}

function getFilePath(id: string) {
    return `${getDir()}/${id}.json`;
}

function assertNamespace(namespace: string) {
    if (ALLOWED_NAMESPACES.indexOf(namespace) < 0) {
        throw `not allowed namespace: ${namespace}`
    }
}

function assertRequired(obj: string) {
    if (obj === null || obj === undefined) {
        throw "null or undefined object is not allowed"
    }
}

class Database {
    public getAllIds(): string[] {
        return fs.readdirSync(getDir())
            .map(fileName => fileName.replaceAll(".json", ""))
    }

    public readVideoGames(id: string): Game[] {
        return this.read(NAMESPACE_VIDEO_GAME, id) as Game[]
    }

    public saveVideoGames(id: string, games: Game[]) {
        this.save(NAMESPACE_VIDEO_GAME, id, games)
    }


    public read(namespace: string, id: string) {
        assertNamespace(namespace)
        assertRequired(id)

        let filePath = getFilePath(id);
        if (!fs.existsSync(filePath)) {
            return null
        } else {
            let entry = JSON.parse(fs.readFileSync(filePath, {encoding: 'utf8'}));
            return entry[namespace]
        }
    }

    public save(namespace: string, id: string, object: any) {
        assertNamespace(namespace)
        assertRequired(id)
        assertRequired(object)

        let filePath = getFilePath(id)
        let toSave: any = {
            _id: id
        }
        if (fs.existsSync(filePath)) {
            toSave = JSON.parse(fs.readFileSync(filePath, {encoding: 'utf8'}));
        }
        toSave[namespace] = object

        fs.writeFileSync(filePath, JSON.stringify(toSave, null, 2))
    }

    public delete(id: string) {
        fs.unlinkSync(getFilePath(id))
    }
}

export const database = new Database()
