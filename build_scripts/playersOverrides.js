const playersOverrides = {
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
        white: "Paul Morphy",
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
    "HsCAY5SxWwo": {
        white: "Garry Kasparov",
        black: "Viswanathan Anand"
    },
    "EmWB7qM6I9Y": {
        white: "Boris Spassky",
        black: "Robert James Fischer"
    },
    "lBiso8xcxXI": {
        white: "Hikaru Nakamura",
        black: "Nodirbek Abdusattorov"
    },
    "C_NlUfkHLw0": {
        white: "Hikaru Nakamura",
        black: "Ian Nepomniachtchi"
    },
    "xHc8F26CcJw": {
        white: "Ian Nepomniachtchi",
        black: "Magnus Carlsen"
    },
    "tNwMHZGNelU": {
        white: "Anish Giri",
        black: "Nodirbek Abdusattorov"
    },
    "4vNkFacksrQ": {
        white: "Alireza Firouzja",
        black: "Fabiano Caruana"
    },
    "IuEWFXRQRZw": {
        white: "Ian Nepomniachtchi",
        black: "Shakhriyar Mamedyarov"
    },
    "H1fLMc5ZfK0": {
        white: "Alireza Firouzja",
        black: "Ian Nepomniachtchi"
    },
    "6PRhgT9eHFw": {
        white: "Ian Nepomniachtchi",
        black: "Levon Aronian"
    },
    "pnFnDvlRtfk": {
        white: "Garry Kasparov",
        black: "Hikaru Nakamura"
    },
    "mZryg5ImMvk": {
        white: "Judit Polgar",
        black: "agadmator's Community"
    },
    "GsryjRlxZeA": {
        white: "agadmator",
        black: "criticize"
    },
    "bAjIrlNkqkY": {
        white: "agadmator",
        black: "ktp07"
    },
    "agHtM9Lk2xU": {
        white: "Albert Mijailovich Belyavsky",
        black: "Mr Hoodie Guy"
    },
    "dhgAHqOuLSc": {
        white: "Praggnanandhaa R",
        black: "Baskaran Adhiban"
    },
    "": {
        white: "",
        black: ""
    },
}

export default function getPlayersForFileName(fileName){
    return playersOverrides[fileName.replaceAll(".json", "")]
}
