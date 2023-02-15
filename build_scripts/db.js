import * as fs from "fs";
import path from 'path';
import {fileURLToPath} from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const NAMESPACE_VIDEO_SNIPPET = "videoSnippet"
export const NAMESPACE_VIDEO_GAME = "videoGame"
export const NAMESPACE_CHESS_COM = "chessCom"
export const NAMESPACE_CHESSTEMPO_COM = "chesstempoCom"

const ALLOWED_NAMESPACES = [
    NAMESPACE_VIDEO_SNIPPET,
    NAMESPACE_VIDEO_GAME,
    NAMESPACE_CHESS_COM,
    NAMESPACE_CHESSTEMPO_COM
]

function getDir() {
    return `${__dirname}/../db`
}

function getFilePath(id) {
    return `${getDir()}/${id}.json`;
}

function assertNamespace(namespace) {
    if (ALLOWED_NAMESPACES.indexOf(namespace) < 0) {
        throw `not allowed namespace: ${namespace}`
    }
}

function assertRequired(obj) {
    if (obj === null || obj === undefined) {
        throw "null or undefined object is not allowed"
    }
}

export function dbGetAllIds() {
    return fs.readdirSync(getDir())
        .map(fileName => fileName.replaceAll(".json", ""))
}

export function dbRead(namespace, id) {
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

export function dbSave(namespace, id, object) {
    assertNamespace(namespace)
    assertRequired(id)
    assertRequired(object)

    let filePath = getFilePath(id)
    let toSave = {
        _id: id
    }
    if (fs.existsSync(filePath)) {
        toSave = JSON.parse(fs.readFileSync(filePath, {encoding: 'utf8'}));
    }
    toSave[namespace] = object

    fs.writeFileSync(filePath, JSON.stringify(toSave, null, 2))
}
