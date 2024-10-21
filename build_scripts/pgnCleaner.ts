export default function cleanPgn(pgn: string) : string {
    return pgn
        .replaceAll(/\[[^\]]+/g, ' ')
        .replaceAll(/\n(\s*\n)+/g, ' ')
        .replaceAll(/000|OOO/g, 'O-O-O')
        .replaceAll(/OO|0-0|o-o|oO/g, 'O-O')
        .replaceAll(';', '.')
        .replaceAll(/[ACDEFGH]/g, match => match.toLowerCase())
        .replaceAll(/B\d/g, match => match.toLowerCase())
        .replaceAll(/e\.p\.\+?/g, '')
        .replaceAll("+", '')
        .replaceAll("#", "")
        .replaceAll("??", "")
        .replaceAll("!!", "")
        .replaceAll(" - ", "")
        .replaceAll("–", "-")
        .replaceAll(/-{2,}/g, "")
        .replaceAll("!.", "")
        .replaceAll("...g4 =", "")
        .replaceAll("book", "")
        .replaceAll("31 .", "31.")
        .replaceAll("for  ", "")
        .replaceAll(". .", ".")
        .replaceAll("\s\d+...", "")
        .replaceAll("...\n", "\n")
        .replaceAll(/\(.*?\)/g, "")
        .replaceAll("?!", "")
        .replaceAll("?", "")
        .replaceAll(/{.*?}/g, "")
        .replaceAll("40. Qg4 4 Qe5", "40. Qg4 Qe5") // LtMLtzmckkI.json
        .replaceAll("12. O-O 12 O-O", "12. O-O O-O")
        .replaceAll(/((\d+)\.\s+[BNKQR]?[a-h]?x?[a-h]\d\s+)\2(\s?[BNKQR]?[a-h]?x?[a-h]\d+)/g, (args, a, b, c) => {
            // replaces "11. Be2 11 e6" with "11. Be2 e6"
            return a + c
        })
        .replaceAll("He's Mid with yasuo ", "")
        .replaceAll("33.  Fxe7  Re8 ", "33.  cxe7  Re8 ") // 02oTVq4H_5I.json
        .replaceAll("104. B e3", "")
        .replaceAll("1. e4 Notes by Lowenthal 1... d5 We consider this mode of evading an open game as decidedly inferior to either ...e6 or ...c5,  though but some short time ago it was in high repute, and was even adopted by Mr. Staunton at the Birmingham meeting. 2. ed5 Qd5 3. Nc3 Qa5...Qd8 is frequently played, but the move in the text is preferable.", "1. e4 d5 2. ed5 Qd5 3. Nc3 Qa5") // 7h3yh2axWxo.json
        .replaceAll("7. Nf3 Sacrificing a pawn to obtain a more speedy development of his pieces. 7... Bc3", "7. Nf3 Bc3") // 7h3yh2axWxo.json
        .replaceAll("Attempting to defend the c pawn would only have led him into difficulty.", "") // 7h3yh2axWxo.json
        .replaceAll(" There appears to be no other mode of saving the pawn. for if ...b6, White would have taken the h pawn with the knight, and won a pawn.", "") // 7h3yh2axWxo.json
        .replaceAll(" This is an instructive position", "") // 7h3yh2axWxo.json
        .replaceAll("Rxc\n", "Rxc8\n") // 890OwB5tgjc.json
        .replaceAll(" {Really Really Poor} 16", "") // 9dU6cbBgZqc.json
        .replaceAll("draw", "")
        .replaceAll("new move", "")
        .replaceAll(" pauseee ", "") // EvXOC5BGQQQ.json
        .replaceAll("Not 20 Rg1 Rxg1 21 Kxg1 Re1 ", "") // DAYCgMrmS8E.json
        .replaceAll(" 3a", " a3")
        .replaceAll(", ", "")
        .replaceAll("White Loss on Time", "")
        .replaceAll(" followed by Bd7", "")
        .replaceAll("eee 8", "")
        .replaceAll("forum  ", "")
        .replaceAll(" TheN fOLLOWS The KNIghT checK BY INaRKIeV :)", "") // PRo1fM_TMqk.json
        .replaceAll(" 's ", "")
        .replaceAll("the", "")
        .replaceAll("IVaN", "")
        .replaceAll("pauseeeee", "")
        .replaceAll(" Notes by alekhine and Reti. 1", "") // VRR-cSnJ0SU.json
        .replaceAll(" he gives his opponent  opportunity of winning a pawn. But capablanca has confidence in  passed pawn which he obtains. - Reti 32", "") // VRR-cSnJ0SU.json
        .replaceAll("Simple and compelling. - alekhine 34", "") // VRR-cSnJ0SU.json
        .replaceAll("decisive! White sacrifices material in order to obtain  classical position with King on f6pawn on g6and Rook on h7whereupon  black pawns tumble like ripe apples. - alekhine 35", "") // VRR-cSnJ0SU.json
        .replaceAll("It is extremely instructive to see how capablanca is no longer in  least concerned about material equalitybut thinks only of supporting his passed pawn. - Reti", "") // VRR-cSnJ0SU.json
        .replaceAll("It is a frequently available finesse in such positions not to capture hostile pawnsbut to pass m by in order to be protected in  rear against checks by  rook. - Reti 39", "") // VRR-cSnJ0SU.json
        .replaceAll("again  simplest. Kf7 would not yet have been disastrous because of Rd8etc. - alekhine 42", "") // VRR-cSnJ0SU.json
        .replaceAll(" after exchanging rooksWhite would win still more easily. - alekhine", "") // VRR-cSnJ0SU.json
        .replaceAll("Tal isn't interested in a .", "") // X06Z9rskUwc.json
        .replaceAll("Very nice tempo move. fischer", "") // aFWFFMs8pVc.json
        .replaceAll(" Now Petrosian is preparing for a very beautiful finish.fischer", "") // aFWFFMs8pVc.json
        .replaceAll("This is a real problem move. fischer", "") // aFWFFMs8pVc.json
        .replaceAll(" .", ".")
        .replaceAll(" questionable if this move was played", "") // lvXIv8YOXhY.json
        .replaceAll(/[hH]e's Mid with yasuo/g, "")
        .replaceAll(/[^\p{L}\d.\s=+-]/gu, "")
        .replaceAll("This game created a new world record when 9 year old awonder Liang defeated gM Larry Kaufman youngest person ever to defeat a gM. 1", "")
        .replaceAll(" a weak move. The or Knight ought to have taken. 8", "")
        .replaceAll("This tempting but unsound move led to all his subsequent troubles. 15", "")
        .replaceAll(" In chess language this is a clean mate and is considered one of  most beautiful ever produced in actual play.", "")
        .replaceAll("44", "4")
        .replaceAll(/\d+\.\.\. /g, "")
}
