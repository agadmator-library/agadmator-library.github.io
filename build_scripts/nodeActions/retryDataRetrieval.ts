import {
    database,
    NAMESPACE_CHESS365,
    NAMESPACE_CHESS_COM,
    NAMESPACE_CHESSTEMPO_COM,
    NAMESPACE_LICHESS_MASTERS,
    NAMESPACE_VIDEO_SNIPPET
} from "../db.js";
import {chessComService} from "../chessCom/ChessComService.js";
import {combine} from "../combine.js";
import _ from "lodash";
import {chesstempoService} from "../chesstempo/ChesstempoService.js";
import {chess365Service} from "../chess365/Chess365Service.js";
import {lichessMastersService} from "../lichessMasters/LichessMastersService.js";

function inDays(diffInMillis: number): number {
    return diffInMillis / (1000 * 60 * 60 * 24)
}

function inWeeks(diffInMillis: number): number {
    return inDays(diffInMillis) / 7
}

function inMonths(diffInMillis: number): number {
    return inDays(diffInMillis) / 30
}

function isEligible(namespace: string, id: string) {
    const videoSnippet = database.read(NAMESPACE_VIDEO_SNIPPET, id)
    const info = database.read(namespace, id)
    if (!info || info.reason !== "NOT_FOUND") {
        return false // noting to retry
    }

    const now = new Date().getTime()
    const videoPublishedAt = new Date(videoSnippet.publishedAt).getTime()
    const infoRetrievalDate = new Date(info.retrievedAt).getTime()

    return inWeeks(now - videoPublishedAt) < 2 && inDays(now - infoRetrievalDate) > 2
        || inMonths(now - videoPublishedAt) < 2 && inWeeks(now - infoRetrievalDate) > 2
        || inMonths(now - videoPublishedAt) < 6 && inMonths(now - infoRetrievalDate) > 1
        || inMonths(now - infoRetrievalDate) > 2
}

async function retryChessCom() {
    let eligible = database.getAllIds()
        .filter(id => isEligible(NAMESPACE_CHESS_COM, id))

    for (const id of _.shuffle(eligible).slice(0, 10)) {
        try {
            await chessComService.loadInfoForId(id, true)
        } catch (e) {
            console.error(`Failed to download chess.com info for video ${id}: ${e}`)
        }
    }
}

async function retryChesstempoCom() {
    let eligible = database.getAllIds()
        .filter(id => isEligible(NAMESPACE_CHESSTEMPO_COM, id))

    for (const id of _.shuffle(eligible).slice(0, 10)) {
        try {
            await chesstempoService.loadInfoForId(id, true)
        } catch (e) {
            console.error(`Failed to download chess.com info for video ${id}: ${e}`)
        }
    }
}

async function retryChess365Com() {
    let eligible = database.getAllIds()
        .filter(id => isEligible(NAMESPACE_CHESS365, id))

    for (const id of _.shuffle(eligible).slice(0, 10)) {
        try {
            await chess365Service.loadInfoForId(id, true)
        } catch (e) {
            console.error(`Failed to download 365chess.com info for video ${id}: ${e}`)
        }
    }
}

async function retryLichessMasters() {
    let eligible = database.getAllIds()
        .filter(id => isEligible(NAMESPACE_LICHESS_MASTERS, id))

    for (const id of _.shuffle(eligible).slice(0, 10)) {
        try {
            await lichessMastersService.loadInfoForId(id, true)
        } catch (e) {
            console.error(`Failed to download lichess masters info for video ${id}: ${e}`)
        }
    }
}

await Promise.all([retryChessCom(), retryChesstempoCom(), retryChess365Com()])

combine()
