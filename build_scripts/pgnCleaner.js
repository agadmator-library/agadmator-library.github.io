export default function cleanPgn(pgn) {
    return pgn
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
        .replaceAll(/[hH]e's Mid with yasuo/g, "")
        .replaceAll(/[^\p{L}\d.\s=+-]/gu, "")
        .replaceAll("This game created a new world record when 9 year old awonder Liang defeated gM Larry Kaufman youngest person ever to defeat a gM. 1", "")
        .replaceAll("29. Nxe3 Nxe3 30. Rh2 30 Bh3 31.", "29. Nxe3 Nxe3 30. Rh2 Bh3 31.")
        .replaceAll(" a weak move. The or Knight ought to have taken. 8", "")
        .replaceAll("This tempting but unsound move led to all his subsequent troubles. 15", "")
        .replaceAll(" In chess language this is a clean mate and is considered one of  most beautiful ever produced in actual play.", "")
        .replaceAll("28.dxe44", "28.dxe4")
}
