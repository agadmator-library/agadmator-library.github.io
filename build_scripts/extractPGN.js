import * as fs from "fs";
import {pgnRead, pgnWrite} from 'kokopu'
import _ from 'lodash'
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

var allPlayers = []

function extractGames(description, fileName) {
    const pgnRegex = /\n\s*1\..+\n/
    let matchArray = pgnRegex.exec(description)
    const games = []

    if (matchArray != null) {
        matchArray
            .filter(pgn => pgn !== undefined)
            .filter(pgn => pgn !== null)
            .forEach(pgn => {
                let fixedPgn = pgn
                    .replaceAll('000', 'O-O-O')
                    .replaceAll('OOO', 'O-O-O')
                    .replaceAll('OO', 'O-O')
                    .replaceAll('0-0', 'O-O')
                    .replaceAll('o-o', 'O-O')
                    .replaceAll('oO', 'O-O')
                    .replaceAll(';', '.')
                    .replaceAll("A", "a")
                    .replaceAll("C", "c")
                    .replaceAll("D", "d")
                    .replaceAll("E", "e")
                    .replaceAll("F", "f")
                    .replaceAll("G", "g")
                    .replaceAll("H", "h")
                    .replaceAll('e.p.+', '')
                    .replaceAll('e.p. ', '')
                    .replaceAll("+", '')
                    .replaceAll("=", "")
                    .replaceAll("...g4!!", "")
                    .replaceAll("He's Mid with yasuo ", "")
                    .replaceAll("31 .", "31.")
                    .replaceAll("for  ", "")
                    .replaceAll(". .", ".")
                    .replaceAll("19. Qa4 19 Qe7 ", "19. Qa4 Qe7 ") // 3KhcVkvYmzc.json
                    .replaceAll("23.  F4  Nc5 ", "23.  f4  Nc5 ") // 3w45AtUmxp8.json
                    .replaceAll("This game created a new world record when 9 year old Awonder Liang defeated GM Larry Kaufman, the youngest person ever to defeat a GM. 1... ", "") // 4C1sSM5ybP8.json
                    .replaceAll("33.  Fxe7  Re8 ", "33.  cxe7  Re8 ") // 02oTVq4H_5I.json
                    .replaceAll("104. B e3", "")
                    .replaceAll("1. e4 Notes by Lowenthal 1... d5 We consider this mode of evading an open game as decidedly inferior to either ...e6 or ...c5, (the French and Sicilian openings) though but some short time ago it was in high repute, and was even adopted by Mr. Staunton at the Birmingham meeting. 2. ed5 Qd5 3. Nc3 Qa5...Qd8 is frequently played, but the move in the text is preferable.", "1. e4 d5 2. ed5 Qd5 3. Nc3 Qa5") // 7h3yh2axWxo.json
                    .replaceAll("7. Nf3 Sacrificing a pawn to obtain a more speedy development of his pieces. 7... Bc3", "7. Nf3 Bc3") // 7h3yh2axWxo.json
                    .replaceAll("Attempting to defend the c pawn would only have led him into difficulty.", "") // 7h3yh2axWxo.json
                    .replaceAll(" There appears to be no other mode of saving the pawn. for if ...b6, White would have taken the h pawn with the knight, and won a pawn.", "") // 7h3yh2axWxo.json
                    .replaceAll(" This is an instructive position", "") // 7h3yh2axWxo.json
                    .replaceAll("Axb4", "axb4") // 89RtMGwRUxQ.json
                    .replaceAll("Rxc\n", "Rxc8\n") // 890OwB5tgjc.json
                    .replaceAll("...", "")
                    .replaceAll(" Notes by J. Lowenthal 1", "") // 7nrX28YLbiU.json
                    .replaceAll("This series of unusual moves was no doubt adopted with the view of embarrasing the blindfold player, in place of which it served to allow him to bring out his pieces and secure victory in a shorter space of time. ", "")  // 7nrX28YLbiU.json
                    .replaceAll("Black has indeed placed himself in a deplorable condition in vainly attempting to puzzle his antagonist.", "") // 7nrX28YLbiU.json
                    .replaceAll(" Nf6 would also have led to a speedy termination. 13", "") // 7nrX28YLbiU.json
                    .replaceAll(" Threatening mate in two moves. 19", "")// 7nrX28YLbiU.json
                    .replaceAll("Terminating the game in masterly style, and giving it an interest, from the nature of the opening, which we had not looked.", "")// 7nrX28YLbiU.json
                    .replaceAll(" - ", "")
                    .replaceAll("17. Qf3 17 Rb5", "17. Qf3 Rb5") // 9MUoC_6EesM.json
                    .replaceAll(" {Really Really Poor} 16", "") // 9dU6cbBgZqc.json
                    .replaceAll("draw", "")
                    .replaceAll(/{.*}/g, "") // AJSfADW1thI.json
                    .replaceAll("??", "")
                    .replaceAll("!!", "")
                    .replaceAll("–", "-")
                    .replaceAll("new move", "")
                    .replaceAll(" It is from this move that Black's defeat stems. Wilhelm Steinitz suggested in 1879 that a better move would be 18 Qxa1. likely moves to follow are 19. Ke2 Qb2 20. Kd2 Bxg1.", "") //AaKWUiiEHgA.json
                    .replaceAll(" Notes by Lowenthal 1", "") // CFvjytywYvA.json
                    .replaceAll(" a weak move and the cause of all subsequent embarrassment.", "") // CFvjytywYvA.json
                    .replaceAll(" Much stronger play then taking the Knight at once. 8", "") // CFvjytywYvA.json
                    .replaceAll(" The only correct reply. If h6 White can play either Re1 or exf6 and in each case win with ease.", "") // CFvjytywYvA.json
                    .replaceAll("gxf6 would have been equally bad, for White's reply would have been Qxd4, with a won game.", "") // CFvjytywYvA.json
                    .replaceAll(" Vigorously and ably followed up. 17", "") // CFvjytywYvA.json
                    .replaceAll(" apprehensive of the advance of the f pawn.", "") // CFvjytywYvA.json
                    .replaceAll("Losing the game offhand. it was previously, however, past all recovery. ", "")// CFvjytywYvA.json
                    .replaceAll("19.  B4", "19. b4") // DHMbwROL8JQ.json
                    .replaceAll(" pauseee 33", "") // EvXOC5BGQQQ.json
                    .replaceAll("Not 20 Rg1 Rxg1 21 Kxg1 Re1 20 ", "") // DAYCgMrmS8E.json
                    .replaceAll("B5", "b5")
                    .replaceAll("B6", "b6")
                    .replaceAll("(The delayed evans!)", "") // FFTxIq6l2KM.json
                    .replaceAll(" 3a", " a3")
                    .replaceAll(", ", "")
                    .replaceAll("White Loss on Time", "")
                    .replaceAll("Notes by Blackburne. 1", "") // GShlaa4KEGY.json
                    .replaceAll("Mr. Bird and I played many games at this openingand many followed the same lines. 13 ", "") // GShlaa4KEGY.json
                    .replaceAll("Stronger than Qxd4.", "") // GShlaa4KEGY.json
                    .replaceAll(" followed by Bd7", "")
                    .replaceAll("e4 1 e5 ", "e4 e5")
                    .replaceAll("The piece sacrifice is a positional onesince it has been used to erect an invisible barrier on the e-file. a number of squares on it (e5 and e6) are controlled by white pawnsand a white rook will soon be moved to e1. -- Iakov damsky 17", "") // GTREDZ4qf4I.json
                    .replaceAll(" With this simple tactic 29 Bxd5 30. Re8 White keeps his two extra pawns. The finish is straightforward. -- damsky 29", "") // GTREDZ4qf4I.json
                    .replaceAll("eee 8", "")
                    .replaceAll(" a favorite defence with Kieseritsky. but one thataccording to Janischrenders the maintenance of the pawn an impossibility. ", "") // JoYiUXqI4_0.json
                    .replaceAll(" This is a deviation from the ordinary line of defencewhich is as follows: 8Qg5 9 Qf3 Bg3 10 Nc3 Nf6 11 Bd2 Nf6 (or a) 12 Bb5 Bd7 13 Bxc6 bxc6 14 O-O-O and the game is even on (a) 11Bd7 12 d5 Ng4 13 Qxg3 fxg3 14 Bxg5 gxf2 15 Kd2 f6 16 Be3 O-O 17 Be2 Nxe3 18 Kxe3 f5.", "") // JoYiUXqI4_0.json
                    .replaceAll("forum  ", "")
                    .replaceAll("10. Nc2 10 Rc8", "10. Nc2 Rc8") // LtMLtzmckkI.json
                    .replaceAll("38. hxg5 38 Bxg5", "38. hxg5 Bxg5") // LtMLtzmckkI.json
                    .replaceAll("40. Qg4 4 Qe5", "40. Qg4 Qe5") // LtMLtzmckkI.json
                    .replaceAll("1. e4 1 c5", "1. e4 c5")
                    .replaceAll(" TheN fOLLOWS The KNIghT checK BY INaRKIeV :)", "") // PRo1fM_TMqk.json
                    .replaceAll(" 's ", "")
                    .replaceAll("book", "")
                    .replaceAll("1. e4  1 e5 ", "1. e4 e5")
                    .replaceAll("the", "")
                    .replaceAll("6. d4  6 d6 ", "6. d4 d6 ")
                    .replaceAll("5. c3  5 Ba5", "5. c3  Ba5")
                    .replaceAll("4. b4  4 Bb4 ", "4. b4 Bb4 ")
                    .replaceAll("3. Bc4  3 Bc5", "3. Bc4  Bc5")
                    .replaceAll("2. Nf3  2 Nc6", "2. Nf3 Nc6")
                    .replaceAll("7. Qb3  7 Qd7", "7. Qb3 Qd7")
                    .replaceAll("8. Nbd2  8 Bb6", "8. Nbd2  Bb6")
                    .replaceAll("IVaN", "")
                    .replaceAll("pauseeeee", "")
                    .replaceAll("48. Rd8 48 h5", "48. Rd8 h5")
                    .replaceAll("#", "")
                    .replaceAll("31. fxe5 31 Nxe5", "31. fxe5 Nxe5")
                    .replaceAll(" Notes by alekhine and Reti. 1", "") // VRR-cSnJ0SU.json
                    .replaceAll(" he gives his opponent  opportunity of winning a pawn. But capablanca has confidence in  passed pawn which he obtains. - Reti 32", "") // VRR-cSnJ0SU.json
                    .replaceAll("Simple and compelling. - alekhine 34", "") // VRR-cSnJ0SU.json
                    .replaceAll("decisive! White sacrifices material in order to obtain  classical position with King on f6pawn on g6and Rook on h7whereupon  black pawns tumble like ripe apples. - alekhine 35", "") // VRR-cSnJ0SU.json
                    .replaceAll("It is extremely instructive to see how capablanca is no longer in  least concerned about material equalitybut thinks only of supporting his passed pawn. - Reti", "") // VRR-cSnJ0SU.json
                    .replaceAll("It is a frequently available finesse in such positions not to capture hostile pawnsbut to pass m by in order to be protected in  rear against checks by  rook. - Reti 39", "") // VRR-cSnJ0SU.json
                    .replaceAll("again  simplest. Kf7 would not yet have been disastrous because of Rd8etc. - alekhine 42", "") // VRR-cSnJ0SU.json
                    .replaceAll(" after exchanging rooksWhite would win still more easily. - alekhine", "") // VRR-cSnJ0SU.json
                    .replaceAll("51. Nxb3 51 Rc6", "51. Nxb3 Rc6") // Vq0uTq0Z3Xk.json
                    .replaceAll("Tal isn't interested in a .", "") // X06Z9rskUwc.json
                    .replaceAll("32. Bc7!. 32 Kg6", "32. Bc7 Kg6") // _tqD0cKX2p0.json
                    .replaceAll("Very nice tempo move. --fischer 14", "") // aFWFFMs8pVc.json
                    .replaceAll(" Now Petrosian is preparing for a very beautiful finish.--fischer 18", "") // aFWFFMs8pVc.json
                    .replaceAll("This is a real problem move. --fischer", "") // aFWFFMs8pVc.json
                    .replaceAll("1. e4 1e5 ", "1. e4 e5 ")
                    .replaceAll("1. d4 1 d5", "1. d4 d5")
                    .replaceAll(" .", ".")
                    .replaceAll(" 4. e3 4 Bf5", " 4. e3 Bf5")
                    .replaceAll("B4", "b4")
                    .replaceAll(" Notes by Roberto grau 1", "") // jz2oKkQcWxI.json
                    .replaceAll("Right nowcaldas Vianna finds a notable moveof problemwhich creates many difficulties for Silvestre. study  positionbefore continuing with  readingto see if you find  idea of  master. white pieces must take advantage of  defective position of  black King.  first check can be fatal for  black pieces. and this allows caldas Vianna do  following beautiful move", "") // jz2oKkQcWxI.json
                    .replaceAll(" Protects  Qwho cannot be capturedbecause after 24Qxb7 25.Nxb7 white gains a piece. black cannot do 24Rxd6 because 25.Re8. black cannot take  P because 25.Qd5 or 25.Qf7. black Q cannot take  white N: 25.Qb3 Qd4 26.Qxd4 Rxd4 27.Re8. thusre is a perfect spiral of mates born of  unpleasant situation of  black King. Butin factwhite pieces want to give a check with  Q in d5andreforepose a barrier to  Knight. 24", "") // jz2oKkQcWxI.json
                    .replaceAll("Threatening an exposed check 27", "") // jz2oKkQcWxI.json
                    .replaceAll("Threatening 30.Rxh6 and 31.Qf7 29", "") // jz2oKkQcWxI.json
                    .replaceAll("(21. Be2) questionable if this move was played", "") // lvXIv8YOXhY.json
                    .replaceAll("1.d4 1d5 ", "1.d4 d5 ")
                    .replaceAll("9.Bb5 9Bb7", "9.Bb5 Bb7")
                    .replaceAll("30. Qxg7 30 Kxg7", "30. Qxg7 Kxg7")
                    .replaceAll("Taking means to stop  furr advance of  f pawnwhich he evidently apprehended might prove objectionable. The range of  adverse King's Bishop is also contracted by this move. 11", "") // tNsdtGug10Q.json
                    .replaceAll("Very prettily played.", "") // tNsdtGug10Q.json
                    .replaceAll("If Kd1Black would equally have pushed on  e Pawn. 38", "") // tNsdtGug10Q.json
                    .replaceAll("This mode of securing   is highly ingenious. his opponent cannot prevent itplay as he may.", "")// tNsdtGug10Q.json
                    .replaceAll("7. c4 7 e5", "7. c4 e5")
                    .replaceAll("B3", "b3")
                    .replaceAll("11. Be2 11 e6", "11. Be2 e6")
                    .replaceAll("1. d4 1 Nf6", "1. d4 Nf6")
                    .replaceAll("We consider 4 Bb5 to be also a good move at this juncture. 4", "") // w8zdWaWuVvA.json
                    .replaceAll("The sacrifice of  Knight here is not advisableas  variation appended will prove : 4Nxe5 5 Nxe5 Qh4 6 g3 Qh4 7 qe2 Qxe4 8 d4 (Ng6 though apparently a good move is not so. for after taking  rook  knight could not easily be liberated) Be7 9 Nf3 d6 10 Be3 Bg4 11 Nbd2 and we prefer  game of  first player.", "") // w8zdWaWuVvA.json
                    .replaceAll("It will be noticed that if White had instead played 11 dxe5Black would have answered Bxf2 and so obtained a decisive advantage. 11", "") // w8zdWaWuVvA.json
                    .replaceAll("When Mr. Rhodes sacrificed  piecehe no doubt thought that after moving Kf8 he could bring his queen's rook with grat effect to e8 or he would hardly have dared to give up so much to so formidable an opponent.", "") //w8zdWaWuVvA.json
                    .replaceAll("", "")


                let predefined = {
                    "95MqyvzQG-o": {
                        white: "Shakhriyar Mamedyarov",
                        black: "Anton Korobov"
                    },
                    "AcpGZF3PcB8": {
                        white: "Judit Polgar",
                        black: "Magnus Carlsen"
                    },
                    "AaKWUiiEHgA": {
                        white: "Adolf Anderssen",
                        black: "Lionel Adalbert"
                    },
                    "97rluHGNugs": {
                        white: "Magnus Carlsen",
                        black: "Wesley So"
                    },
                    "EV-bSA0RHGI": {
                        white: "Paul Charles Morphy",
                        black: "Alonzo Michael Morphy"
                    },
                    "IZx3S99gOAQ": {
                        white: "Wilhelm Steinitz",
                        black: "Curt von Bardeleben"
                    },
                    "LN51LXLhY8k": {
                        white: "agadmator",
                        black: "bar555"
                    },
                    "KmPft6vo65M": {
                        white: "Levon Aronian",
                        black: "Viswanathan Anand"
                    },
                    "_wIBghy_G2Y": {
                        white: "Kramnik and Anand and Karpov",
                        black: "Dubov and Nepo and Karjakin"
                    },
                    "bG-KPOvAy24": {
                        white: "Mikhail Tal",
                        black: "Dieter Keller"
                    },
                    "aMsVprtnAVQ": {
                        white: "Google Deep Mind AI Alpha Zero",
                        black: "Stockfish 8"
                    },
                    "rRW2buRb0vk": {
                        white: "Vassily Ivanchuk",
                        black: "Artur Yusupov"
                    },
                    "ue7UEbb8_ug": {
                        white: "Robert James Fischer",
                        black: "Viktor Korchnoi"
                    },
                    "yH2Yur0YuqI": {
                        white: "Magnus Carlsen",
                        black: "Akshat Chandra"
                    },
                    "wucPzhM0WdM": {
                        white: "Mikhail Tal",
                        black: "Sviridov"
                    },
                    "t5shBVx-QiU": {
                        white: "Richard Reti",
                        black: "Heinrich Wolf"
                    },
                    "2No-KiVu5fE": {
                        white: "Magnus Carlsen",
                        black: "Étienne Bacrot"
                    },
                    "R0m4M1JKqMw": {
                        white: "Vasyl Ivanchuk",
                        black: "Ding Liren"
                    },
                    "T5Y-gtWSBKQ": {
                        white: "Wesley So",
                        black: "Teymur Rajabov"
                    },
                    "a877Y_WvPoo": {
                        white: "Andrew Tang",
                        black: "Magnus Carlsen"
                    },
                    "jPZkpIIV9Zo": {
                        white: "Mr Hoodie Guy",
                        black: "Mr Hoodie Guy"
                    },
                    "paLhYx0vWkQ": {
                        white: "Wesley So",
                        black: "Magnus Carlsen"
                    },
                    "yrNjIX2JvPQ": {
                        white: "Maria Florencia Fernandez",
                        black: "Mitra Hejazipour"
                    },
                    "V1R0UZdBSe8": {
                        white: "Magnus Carlsen",
                        black: "Viswanathan Anand"
                    },
                    "mHPojuNgryY": {
                        white: "Vasyl Ivanchuk",
                        black: "Adhiban"
                    },
                    "oyWW_A-CDTY": {
                        white: "Fabiano Caruana",
                        black: "Jan-Krzysztof Duda"
                    },
                    "cQap4I_-u4E": {
                        white: "Zoran Filipovic",
                        black: "Antonio Radić"
                    },
                    "vdsw1f3rs2M": {
                        white: "Jan-Krzysztof Duda",
                        black: "Vidit Santosh Gujrathi"
                    },
                    "CUQQ4dym5ZU": {
                        white: "Prince Andrey Dadian of Mingrelia",
                        black: "Boulitchoff"
                    },
                    "xu5GVIYBWTY": {
                        white: "Viswanathan Anand",
                        black: "Teimour Radjabov"
                    },
                    "TPBut0wFTdg": {
                        white: "Adolf Anderssen",
                        black: "Berthold Suhle"
                    },
                    "": {
                        white: "",
                        black: ""
                    },
                }

                let players = predefined[fileName.replaceAll(".json", "")]

                let game = parseUsingKokopu(fixedPgn)
                if (game) {
                    if (!players) {
                        let linesBeforePgn = description.substring(0, description.indexOf(pgn)).split("\n")
                            .filter(value => value !== "")
                            .slice(-5)
                            .filter(value => value.indexOf("You are awesome") < 0)
                            .filter(value => value.indexOf("URS-ch sf ") < 0)
                            .filter(value => value.indexOf("Buy ") < 0 && value.indexOf("book here") < 0)
                            .filter(value => value.indexOf("Also, check out ") < 0)
                            .filter(value => value.indexOf(" game I mention") < 0)
                            .filter(value => value.indexOf("Caro-Kann,") < 0)
                            .filter(value => value.indexOf("Nimzo-Indian,") < 0)
                            .filter(value => value.indexOf("Watch  Impressions here") < 0)
                            .filter(value => value.indexOf("Challenge Luka on Lichess") < 0)
                            .filter(value => value.indexOf("Candidate's Legendary game here") < 0)
                            .filter(value => value.indexOf("Check out") < 0)
                            .filter(value => value.indexOf("Game 3 here") < 0)
                            .filter(value => value.indexOf("Photo of ") < 0)
                            .filter(value => value.indexOf("Photo on ") < 0)
                            .filter(value => value.indexOf("LIVE here") < 0)
                            .filter(value => value.indexOf("game 4 here") < 0)
                            .filter(value => value.indexOf("game from this ") < 0)
                            .filter(value => value.indexOf("Tata Steel Masters , Wijk aan Zee NED") < 0)
                            .filter(value => value.indexOf("Lichess Titled Arena") < 0)
                            .filter(value => value.indexOf("the games from Morphy") < 0)
                            .filter(value => !/Watch.*vs.*here/g.test(value))
                            .filter(value => !/Link.*to.*game/g.test(value))
                            .map(value => value
                                .replaceAll(/\(\d+\)/g, "") // player rankings
                                .replaceAll(/\d{3,4}/g, "") // date
                                .replaceAll(/\d-\d/g, "") // result
                                .replaceAll("1//2", "")
                                .replaceAll("#agadmator ", "")
                                .replaceAll(/https?:\S+/g, "") // urls
                                .replaceAll("Live Chess (Chess.com) ", "")
                                .replaceAll(". Partida Fnal. Got Talent España", "")
                                .replaceAll(/Game \d+: /g, "")
                                .replaceAll(/Round\s+\d+/g, "")
                                .replaceAll("|", "")
                                .replaceAll("(D)", "")
                                .replaceAll("\r", "")
                                .replaceAll("(A)", "")
                                .replaceAll("(C)", "")
                                .replaceAll("(B)", "")
                                .replaceAll("*", "")
                                .replaceAll("[A42]", "")
                                .replaceAll("(CRO)", "")
                                .replaceAll("(IND)", "")
                                .replaceAll("(UKR)", "")
                                .replaceAll("(NOR)", "")
                                .replaceAll("(UZB)", "")
                                .replaceAll("(France)", "")
                                .replaceAll("vs. ", "vs ")
                                .replaceAll("vsWei", "vs Wei")
                                .replaceAll("vsMagnus", "vs Magnus")
                            )
                            .filter(value => /.+( - |\svs\s|\sVS\s).+/.test(value))
                            .filter(value => value.length < 70)

                        if (linesBeforePgn[0]) {
                            const splitted = linesBeforePgn[0].split(/ - |\svs\s|\sVS\s/g);
                            players = {
                                white: processPlayerName(splitted[0]),
                                black: processPlayerName(splitted[1])
                            }

                            if (players.white === '5.O') {
                                console.log(fileName)
                                console.log(description.substring(0, description.indexOf(pgn)).split("\n")
                                    .filter(value => value !== "")
                                    .slice(-5))
                            }
                        } else {
                            console.log(fileName)
                            console.log(description.substring(0, description.indexOf(pgn)).split("\n")
                                .filter(value => value !== "")
                                .slice(-5))
                        }
                    }

                    if (players) {
                        game.playerWhite = players.white
                        game.playerBlack = players.black

                        allPlayers.push(players.white)
                        allPlayers.push(players.black)
                    }
                    games.push(game)
                }
            })
    }
    return games
}

function processPlayerName(raw) {
    if ((raw.match(/,/g) || []).length === 1) {
        let splitOnComma = raw.split(",");
        raw = _.trim(splitOnComma[1]) + " " + _.trim(splitOnComma[0])
    }
    raw = _.trim(raw)
    raw = raw.replaceAll(/^Abhijeet$/g, "Abhijeet Gupta")
        .replaceAll(/^Adham$/g, "Adham Fawzy")
        .replaceAll(/^Alexandr Hilario Takeda dos Santos Fier$/g, "Alexandr Hilário Takeda Sakai dos Santos Fier")
        .replaceAll("\r", "")
        .replaceAll(/^Alexey Shirov$/g, "Alexei Shirov")
        .replaceAll(/^Alina$/g, "Alina Kashlinskaya")
        .replaceAll(/^Alireza$/g, "Alireza Firouzja")
        .replaceAll(/\s+\./g, "")
        .replaceAll(/^\.\s+/g, "")
        .replaceAll(/^Anis Giri$/g, "Anish Giri")
        .replaceAll(/^Anish$/g, "Anish Giri")
        .replaceAll(/^Aryan$/g, "Aryan Tari")
        .replaceAll(/^Awonder$/g, "Awonder Liang")
        .replaceAll(/^Baadur$/g, "Baadur Aleksandrovich Jobava")
        .replaceAll(/^Baadur Jobava$/g, "Baadur Aleksandrovich Jobava")
        .replaceAll(/^Bogdan$/g, "Bogdan Daniel Deac")
        .replaceAll(/^Borislav Kostic$/g, "Borislav Kostić")
        .replaceAll(/^Carissa$/g, "Carissa Yip")
        .replaceAll(/^Carlos Daniel$/g, "Carlos Daniel Albornoz Cabrera")
        .replaceAll(/^Carlsen$/g, "Magnus Carlsen")
        .replaceAll(/^Fabiano$/g, "Fabiano Caruana")
        .replaceAll(/^Fischer$/g, "Robert James Fischer")
        .replaceAll(/^Fr. Drunkenstein aka Magnus Carlsen$/g, "Magnus Carlsen")
        .replaceAll(/^Google Deep Mind AI Alpha Zero$/g, "AlphaZero")
        .replaceAll(/^Google Deep Mind Alpha Zero$/g, "AlphaZero")
        .replaceAll(/^Google Deepmind AI AlphaZero$/g, "AlphaZero")
        .replaceAll(/^Gukesh D.$/g, "Gukesh D")
        .replaceAll(/^Hans Moke$/g, "Hans Moke Niemann")
        .replaceAll(/^Hikaru$/g, "Hikaru Nakamura")
        .replaceAll(/^Hikaru Nakmaura$/g, "Hikaru Nakamura")
        .replaceAll(/^Hrant$/g, "Hrant Melkumyan")
        .replaceAll(/^Ian Nepomnioachtchi$/g, "Ian Nepomniachtchi")
        .replaceAll(/^Jan Krzysztof Duda$/g, "Jan-Krzysztof Duda")
        .replaceAll(/^Jan Krzystzof Duda$/g, "Jan-Krzysztof Duda")
        .replaceAll(/^Jeffery$/g, "Jeffrey Xiong")
        .replaceAll(/^Jeffery Xiong$/g, "Jeffrey Xiong")
        .replaceAll(/^Jonas Buhl Bjere$/g, "Jonas Buhl Bjerre")
        .replaceAll(/^Capablanca$/g, "Jose Raul Capablanca")
        .replaceAll(/^Kasparov$/g, "Garry Kasparov")
        .replaceAll(/^Kirill$/g, "Kirill Alekseenko")
        .replaceAll(/^Kiriil Alekseenko$/g, "Kirill Alekseenko")
        .replaceAll(/^Krishnan$/g, "Krishnan Sasikiran")
        .replaceAll(/^Krzysztof$/g, "Jan-Krzysztof Duda")
        .replaceAll(/^Krzysztof Duda$/g, "Jan-Krzysztof Duda")
        .replaceAll(/^Leela Chess ZERO$/g, "Leela Chess Zero")
        .replaceAll(/^Leela Zero$/g, "Leela Chess Zero")
        .replaceAll(/^Leela Zhess Zero$/g, "Leela Chess Zero")
        .replaceAll(/^Leinier$/g, "Leinier Dominguez Perez")
        .replaceAll(/^Leinier Perez Dominguez$/g, "Leinier Dominguez Perez")
        .replaceAll(/^Lenier Perez Dominguez$/g, "Leinier Dominguez Perez")
        .replaceAll(/^Levon$/g, "Levon Aronian")
        .replaceAll(/^Liren$/g, "Liren Ding")
        .replaceAll(/^Liren DIng$/g, "Liren Ding")
        .replaceAll(/^Liviu$/g, "Liviu Dieter Nisipeanu")
        .replaceAll(/^Magnus$/g, "Magnus Carlsen")
        .replaceAll(/^Magnus Carlsen and Random Guy$/g, "Magnus Carlsen")
        .replaceAll(/^MagnusCarlsen$/g, "Magnus Carlsen")
        .replaceAll(/^Maxime Vachier$/g, "Maxime Vachiere-Lagrave")
        .replaceAll(/^Maxime Vachier Lagrave$/g, "Maxime Vachiere-Lagrave")
        .replaceAll(/^Maxime Vachiere Lagrave$/g, "Maxime Vachiere-Lagrave")
        .replaceAll(/^Mr. Hoodie Guy$/g, "Mr Hoodie Guy")
        .replaceAll(/^Nodirbek$/g, "Nodirbek Abdusattorov")
        .replaceAll(/^Parham$/g, "Parham Maghsoodloo")
        .replaceAll(/^Parham Magsoodloo$/g, "Parham Maghsoodloo")
        .replaceAll(/^Polina$/g, "Polina Shuvalova")
        .replaceAll(/^Praggnanandhaa$/g, "Praggnanandhaa R")
        .replaceAll(/^Praggnanandhaa Rameshbabu$/g, "Praggnanandhaa R")
        .replaceAll(/^Praggnanandhaa Rameshbamu$/g, "Praggnanandhaa R")
        .replaceAll(/^Rameshbabu Praggnanandhaa$/g, "Praggnanandhaa R")
        .replaceAll(/^Rameshbabu$/g, "Praggnanandhaa R")
        .replaceAll(/^Radoslaw Wojtaszek$/g, "Radosław Wojtaszek")
        .replaceAll(/^Rashid Nezhmetdinov$/g, "Rashid Gibiatovich Nezhmetdinov")
        .replaceAll(/^Rauf$/g, "Rauf Mamedov")
        .replaceAll(/^Raunak$/g, "Raunak Sadhwani")
        .replaceAll(/^Sergey Krjakin$/g, "Sergey Karjakin")
        .replaceAll(/^Teimour$/g, "Teimour Radjabov")
        .replaceAll(/^Vidit Gujrathi$/g, "Vidit Santosh Gujrathi")
        .replaceAll(/^Vidit Gujrathi Santosh$/g, "Vidit Santosh Gujrathi")
        .replaceAll(/^Maxime Lagrave$/g, "Maxime Vachiere-Lagrave")
        .replaceAll(/^Maxime Lagarde$/g, "Maxime Vachiere-Lagrave")
        .replaceAll(/^Magnus \( Carlsen$/g, "Magnus Carlsen")
        .replaceAll(/^Magnsu Carlsen$/g, "Magnus Carlsen")
        .replaceAll(/^$/g, "")

    return raw
}

function parseUsingKokopu(pgn) {
    try {
        const database = pgnRead(pgn)
        const parsedPgn = pgnWrite(database.game(0)).replaceAll(/\[.+]|\n/g, "")
        const fen = database.game(0).finalPosition().fen()
        return {
            pgn: parsedPgn,
            fen: fen
        }
    } catch (e) {
        if (pgn.endsWith("1/2-1/2")) {
            return null
        }
        let tmp = parseUsingKokopu(pgn + "1/2-1/2");
        return tmp == null
            ? null
            : {
                pgn: tmp.pgn.replaceAll("1/2-1/2", ""),
                fen: tmp.fen
            }
    }
}

fs.readdirSync(__dirname + '/../db/video-snippet').forEach(fileName => {
    //if (!fs.existsSync(__dirname + '/../db/video-games/' + fileName )) {
        const videoSnippet = JSON.parse(fs.readFileSync(__dirname + '/../db/video-snippet/' + fileName, {encoding: 'utf8'}));

        let games = extractGames(videoSnippet.description, fileName);
        fs.writeFileSync(__dirname + '/../db/video-games/' + fileName, JSON.stringify(games, null, 2))
    //}
})

//fs.writeFileSync(__dirname + '/../allPlayers.json', JSON.stringify(_.uniq(allPlayers).sort(), null, 2))
