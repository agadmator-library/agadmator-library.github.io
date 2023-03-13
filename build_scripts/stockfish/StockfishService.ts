// @ts-ignore
import INIT_ENGINE from 'stockfish'
import path from 'path';
import {fileURLToPath} from 'url';
import {database, NAMESPACE_STOCKFISH_EVAL} from "../db.js";

class Engine {
    private engine: any
    private readonly _initialized
    private _evaluationInProgress = false
    private readonly messageListener = new StockfishMessageListener()

    get initialized(): Promise<void> {
        return this._initialized;
    }

    constructor() {
        let initializedResolve: () => void;
        this._initialized = new Promise<void>((resolve, reject) => initializedResolve = resolve)

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const wasmPath = path.join(__dirname, "../../node_modules/stockfish/src", "stockfish.wasm");

        if (typeof INIT_ENGINE === "function") {
            const Stockfish = INIT_ENGINE()
            Stockfish({
                locateFile: function (path: string) {
                    if (path.indexOf(".wasm") > -1) {
                        return wasmPath;
                    } else {
                        return __filename;
                    }
                }
            }).then((sf: any) => {
                this.engine = sf
                this.engine.addMessageListener((message: string) => this.messageListener.handleMessage(message))

                this.send("uci");
                this.messageListener
                    .waitFor('uciok')
                    .then(() => {
                            initializedResolve()
                        }
                    )
            })
        }
    }

    send(message: string) {
        this.assertInitialized()
        console.log(`-> ${message}`)
        this.engine.postMessage(message)
    }

    terminate() {
        this.assertInitialized()
        this.engine.terminate()
    }

    async evaluatePosition(fen: string): Promise<EvaluationResult> {
        this.assertInitialized()

        if (this._evaluationInProgress) {
            throw "Another evaluation in progress"
        }

        this.send('ucinewgame')
        await this.isReady()
        this.send(`position fen ${fen}`)
        let evaluationResult = this.messageListener.evaluateFromMessages();

        this.send('go infinite')

        return evaluationResult.finally(() => {
            this.send('stop')
            this._evaluationInProgress = false
        })
    }

    private assertInitialized() {
        if (!this.engine) {
            throw "Stockfish engine not initialized"
        }
    }

    private async isReady() {
        this.send('isready')
        await this.messageListener.waitFor('readyok')
    }
}

class StockfishMessageListener {

    private _listeners: Array<MessageListener> = []

    handleMessage(message: string) {
        console.log(`-> ${message}`)
        this._listeners.forEach(listener => listener(message))
    }

    waitFor(messageToWaitFor: string): Promise<string> {
        let promiseResolve: (result: string) => void
        let promise = new Promise<string>((resolve, reject) => promiseResolve = resolve)

        let listener = (message: string) => {
            if (message == messageToWaitFor) {
                promiseResolve(message)
            }
        }
        this._listeners.push(listener)

        return Promise.race([promise, new Promise<string>((resolve, rej) => setTimeout(() => rej(), 10000))])
            .finally(() => {
                this._listeners = this._listeners.splice(this._listeners.indexOf(listener), 1)
            })
    }

    evaluateFromMessages(): Promise<EvaluationResult> {
        let promiseResolve: (result: EvaluationResult) => void
        let promise = new Promise<EvaluationResult>((resolve, reject) => promiseResolve = resolve)

        let depth: number | null
        let cp: number | null
        let mate: number | null

        let listener = (message: string) => {
            if (message.startsWith("info")) {
                let tokens = message.split(" ");

                if (tokens.includes("depth")) {
                    depth = Number.parseInt(tokens[tokens.indexOf("depth") + 1])
                    if (tokens.includes("score") && tokens.includes("cp")) {
                        cp = Number.parseInt(tokens[tokens.indexOf("cp") + 1])
                        mate = null
                    } else if (tokens.includes("mate")) {
                        cp = null
                        mate = Number.parseInt(tokens[tokens.indexOf("mate") + 1])
                    }


                    if (depth >= 20 || mate === 0) {
                        promiseResolve({
                            cp: cp,
                            mate: mate
                        })
                    }
                }
            }
        }
        this._listeners.push(listener)

        setTimeout(() => {
            if (depth && depth > 10 || depth == 0 && cp == 0) {
                promiseResolve({
                    cp: cp,
                    mate: mate
                })
            }
        }, 15000)

        return promise
            .finally(() => {
                this._listeners = this._listeners.splice(this._listeners.indexOf(listener), 1)
            })
    }
}

export interface EvaluationResult {
    cp: number | null,
    mate: number | null
}

interface MessageListener {
    (message: string): void
}

class StockfishService {
    async evaluate(ids: string[], force: boolean = false) {
        if (ids.length === 0) {
            return
        }

        const engine = new Engine()
        await engine.initialized

        for (const id of ids) {
            let games = database.readDescriptionGames(id)
            let currentEval = database.read(NAMESPACE_STOCKFISH_EVAL, id)
            if (currentEval && !force) {
                console.log('StockfishService: evaluation already performed')
                continue
            }

            let stockfishEval = []
            for (const game of games) {
                if (game.fen) {
                    console.log(`Evaluation ${id} | ${game.playerWhite} - ${game.playerBlack} | ${game.fen}`)
                    const evaluation = await engine.evaluatePosition(<string>game.fen)
                    console.error(evaluation)
                    stockfishEval.push(evaluation)
                } else {
                    stockfishEval.push(null)
                }
            }
            database.save(NAMESPACE_STOCKFISH_EVAL, id, stockfishEval)
        }

        engine.terminate()
    }
}

export const stockfishService = new StockfishService()


await stockfishService.evaluate(database.getAllIds(), true)