class Game {
    pgn = undefined
    b4Played = undefined

    constructor(white, black, result, year) {
        this.white = white
        this.black = black
        this.result = result
        this.year = year
    }

    getWhiteOrEmpty() {
        return _.defaultTo(this.white, "")
    }

    getBlackOrEmpty() {
        return _.defaultTo(this.black, "")
    }
}

class Video {
    length = undefined

    constructor(id, date, title, games) {
        this.id = id
        this.title = title
        this.date = date
        this.games = games
    }
}

let currentPageNumber = 1 // 1-based
let pageSize = 30
let videos = []
let filteredVideos = []
let filters = {
    anySide: [],
    white: [],
    black: [],
    opening: [],
    results: [],
    pgnFilter: "",
    title: "",
    b4Played: null
}
let openings = []
let positions = {}
let sortBy = "date"
let sortDirection = "desc"
let showResult = false

let jQ = {
    playerNamesFilterForm: $("#playerNamesFilterForm"),
    openingFilterForm: $("#openingFilterForm"),
    pageLinkClass: $(".page-link"),
    firstPageLink: $("#firstPageLink"),
    previousPageLink: $("#previousPageLink"),
    nextPageLink: $('#nextPageLink'),
    lastPageLink: $("#lastPageLink"),
    openingInput: $('#openingInput'),
    titleInput: $('#titleInput'),
    clearFilterButton: $("#clearFilterButton"),
    backOneStepButton: $("#backOneStep"),
    resultSelect: $('#resultSelect'),
    queenCntSelect: $('#queenCntSelect'),
    b4Check: $('#b4Check'),
    underpromotionCheck: $('#underpromotionCheck'),
    atLeastOneGameCheck: $('#atLeastOneGameCheck'),
    multipleGamesCheck: $('#multipleGamesCheck'),
    transpositionCheck: $('#transpositionCheck'),
    publishedFrom: $('#publishedFrom'),
    publishedTo: $('#publishedTo'),
    videoLengthFromInput: $('#videoLengthFromInput'),
    videoLengthToInput: $('#videoLengthToInput')
}

jQ.playerNamesFilterForm.on('submit', function (event) {
    event.preventDefault();
})
jQ.openingFilterForm.on('submit', function (event) {
    event.preventDefault();
})
jQ.pageLinkClass.on('click', function (event) {
    event.preventDefault();
})
jQ.firstPageLink.on('click', () => changePage(1))
jQ.previousPageLink.on('click', () => {
    if (currentPageNumber > 1) {
        changePage(currentPageNumber - 1)
    }
})
jQ.nextPageLink.on('click', () => {
    if (currentPageNumber < filteredVideos.length / pageSize) {
        changePage(currentPageNumber + 1)
    }
})
jQ.lastPageLink.on('click', () => {
    changePage(parseInt(filteredVideos.length / pageSize) + 1)
})

function testWhite(filter, video) {
    return video.games && _.some(video.games, game => {
        return game.getWhiteOrEmpty().toLowerCase() === filter.playerName.toLowerCase()
            && (filter.playerResult === "" || (game.result && (
                game.result === "w" && filter.playerResult === "won"
                || game.result === "b" && filter.playerResult === "lost"
                || game.result === "d" && filter.playerResult === "draw"
            )))
    })
}

function testBlack(filter, video) {
    return video.games && _.some(video.games, game => {
        return game.getBlackOrEmpty().toLowerCase() === filter.playerName.toLowerCase()
            && (filter.playerResult === "" || (game.result && (
                game.result === "w" && filter.playerResult === "lost"
                || game.result === "b" && filter.playerResult === "won"
                || game.result === "d" && filter.playerResult === "draw"
            )))
    })
}

jQ.titleInput.bind('input', _ => {
    filters.title = jQ.titleInput.val()
    applyFilters(true)
})

jQ.clearFilterButton.on('click', clearFilters)

jQ.backOneStepButton.on('click', function () {
    game.undo()
    board.position(game.fen())
    filters.pgnFilter = game.pgn() ? game.pgn() : ""
    applyFilters(true)
})

jQ.resultSelect.change(function () {
    if (filters.results.indexOf($(this).val()) < 0) {
        filters.results.push($(this).val())
    }
    applyFilters(true)
    setTimeout(function () {
        document.getElementById('resultSelect').value = ""
    }, 1)
})
jQ.queenCntSelect.change(function() {
    applyFilters(false)
})

jQ.b4Check.change(function () {
    if ($(this).prop("checked")) {
        filters.b4Played = true
    } else {
        filters.b4Played = null
    }
    $(this).prop("checked", false)
    applyFilters(true)
})

jQ.underpromotionCheck.change(function () {
    if ($(this).prop("checked")) {
        filters.underpromotion = true
    } else {
        filters.underpromotion = null
    }
    $(this).prop("checked", false)
    applyFilters(true)
})

jQ.atLeastOneGameCheck.change(function () {
    if ($(this).prop("checked")) {
        filters.atLeastOneGame = true
    } else {
        filters.atLeastOneGame = null
    }
    $(this).prop("checked", false)
    applyFilters(true)
})

jQ.multipleGamesCheck.change(function () {
    if ($(this).prop("checked")) {
        filters.multipleGames = true
    } else {
        filters.multipleGames = null
    }
    $(this).prop("checked", false)
    applyFilters(true)
})


jQ.transpositionCheck.change(function () {
    if (filters.pgnFilter) {
        applyFilters(false)
    }
})
jQ.publishedFrom.change(function () {
    applyFilters(false)
})
jQ.publishedTo.change(function () {
    applyFilters(false)
})
jQ.videoLengthFromInput.change(() => applyFilters(false))
jQ.videoLengthToInput.change(() => applyFilters(false))
function onSortClick(field) {
    if (sortBy === field) {
        sortDirection = sortDirection === "asc" ? "desc" : "asc"
    } else {
        sortBy = field
        sortDirection = ["w", "b", "title"].includes(field) ? "asc" : "desc"
    }
    applyFilters(true)
}

document.getElementById('dateColHeader').addEventListener('click', () => onSortClick('date'))
document.getElementById('titleColHeader').addEventListener('click', () => onSortClick('title'))
document.getElementById('whiteColHeader').addEventListener('click', () => onSortClick('w'))
document.getElementById('blackColHeader').addEventListener('click', () => onSortClick('b'))
document.getElementById('yearColHeader').addEventListener('click', () => onSortClick('year'))

function watchIdsOnYoutube(ids) {
    if (ids === "") {
        return
    }
    const url = `https://www.youtube.com/watch_videos?video_ids=${ids}`
    window.open(url, '_blank').focus();
}

$('#watchTopOnYoutubeButton').on('click', function () {
    const ids = filteredVideos.slice(0, 50)
        .map(video => video.id)
        .join(",");
    watchIdsOnYoutube(ids);
})

$('#watchOnYoutubeButton').on('click', function () {
    const ids = filteredVideos.slice((currentPageNumber - 1) * pageSize, (currentPageNumber) * pageSize)
        .map(video => video.id)
        .join(",");
    watchIdsOnYoutube(ids)
})

$('#showResultButton').on('click', function () {
    showResult = true
    $('#resultColHeader').css("display", "table-cell");
    $('#showResultButton').css("display", "none")
    $('#hideResultButton').css("display", "block")
    draw()
})

$('#hideResultButton').on('click', function () {
    showResult = false
    $('#resultColHeader').css("display", "none");
    $('#showResultButton').css("display", "block")
    $('#hideResultButton').css("display", "none")
    draw()
})

let videosLoadedPromiseResolve;
const videosLoadedPromise = new Promise((resolve, reject) => videosLoadedPromiseResolve = resolve)
fetch("generated/db.json")
    .then(res => res.json())
    .then(res => {
        function decodeResult(result) {
            switch (result) {
                case 1:
                    return "w"
                case 0:
                    return "d"
                case -1:
                    return "b"
                default:
                    return null
            }
        }

        const toTyped = res.videos.map(dbVideo => {
            let games = dbVideo.g
                ? dbVideo.g.map(g => new Game(res.players[g.w], res.players[g.b], decodeResult(g.r), g.y))
                : []
            return new Video(dbVideo.id, new Date(dbVideo.d * 1000), dbVideo.t, games)
        })

        videos = filteredVideos = _.orderBy(toTyped, [sortBy], [sortDirection])

        let tmpPlayerNames = {}
        videos.filter(video => video.games)
            .flatMap(video => video.games)
            .filter(game => game.white && game.black)
            .forEach(game => {
                tmpPlayerNames[game.white] = tmpPlayerNames[game.white] ? tmpPlayerNames[game.white] + 1 : 1
                tmpPlayerNames[game.black] = tmpPlayerNames[game.black] ? tmpPlayerNames[game.black] + 1 : 1
            })
        let players = _.orderBy(Object.keys(tmpPlayerNames)
            .map(name => {
                return {
                    name: name,
                    count: tmpPlayerNames[name]
                }
            }), ["count", "name"], ["desc", "asc"])
            .map(player => player.name)

        $('#playerInput').typeahead({
                minLength: 1,
                highlight: false
            },
            {
                name: 'players-dataset',
                limit: 15,
                source: function (query, syncResults) {
                    const realQuery = document.getElementById('playerInput').value.toLowerCase()
                    syncResults(players.filter(name => name.toLowerCase().includes(realQuery)))
                }
            })
            .bind('typeahead:select', function (ev, suggestion) {
                const side = document.getElementById('playerSideSelect').value
                const filter = {
                    playerName: suggestion,
                    playerResult: document.getElementById('playerResultSelect').value
                }
                filters[side].push(filter)

                applyFilters(true)
                document.getElementById('playerSideSelect').value = "anySide"
                $('#playerInput').typeahead('val', "");
                document.getElementById('playerResultSelect').value = ""
            })
            .bind('typeahead:change', function (e) {
                document.getElementById('playerSideSelect').value = "anySide"
                $('#playerInput').typeahead('val', "");
                document.getElementById('playerResultSelect').value = ""
            })
            .bind('change', function (e) {
                document.getElementById('playerSideSelect').value = "anySide"
                $('#playerInput').typeahead('val', "");
                document.getElementById('playerResultSelect').value = ""
            })

        const url = new URL(window.location);
        const s = url.searchParams.get('s')
        if (s) {
            let state = JSON.parse(decodeURIComponent(atob(s)))
            filters = state.filters
            sortBy = state.sortBy
            sortDirection = state.sortDirection
        }
        pushHistory();

        videosLoadedPromiseResolve()

        applyFilters(false)
    })

fetch("generated/pgns.json")
    .then(res => res.json())
    .then(res => {
        videosLoadedPromise.then(_ => {

            videos.forEach(video => {
                const videoPgns = res[video.id]
                if (videoPgns) {
                    videoPgns.forEach((pgn, idx) => {
                        video.games[idx].pgn = pgn
                        video.games[idx].b4Played = /\d\.\s+b4/.test(pgn)
                        video.games[idx].queenCnt = 2 + (pgn.match(/=Q/g) || []).length
                        video.games[idx].underpromotion = (pgn.match(/=[^Q]/g) || []).length > 0
                    })
                }
            })

            drawFilterResultsContainer()

            if (filters.pgnFilter || filters.opening.length > 0 || filters.b4Played || jQ.queenCntSelect.val() || filters.underpromotion) {
                applyFilters(false)
            }
        })
    })

fetch("generated/videoLength.json")
    .then(res => res.json())
    .then(res => {
        videosLoadedPromise.then(_ => {
            videos.forEach(video => {
                video.length = res[video.id]
            })
            if (getVideoLengthFrom() || getVideoLengthTo()) {
                applyFilters(false)
            }
        })
    })

fetch("generated/positions.json")
    .then(response => response.json())
    .then(responseJson => {
        positions = responseJson
        positions.videos.forEach((videoId, positionIndex) => videos.find(video => video.id === videoId).positionIndex = positionIndex)
    })

fetch("generated/openings-slim.json")
    .then(response => response.json())
    .then(responseJson => {
        openings = responseJson

        jQ.openingInput.typeahead({
                minLength: 1,
                highlight: true
            },
            {
                name: 'openings-dataset',
                limit: 15,
                source: function (query, syncResults) {
                    syncResults(openings.map(opening => opening.name)
                        .filter(name => name.toLowerCase().includes(query.toLowerCase()))
                    )
                }
            })
            .bind('typeahead:select', function (ev, suggestion) {
                filters.opening.push(suggestion)

                applyFilters(true)
                jQ.openingInput.typeahead('val', '')
            })
            .bind('typeahead:change', function () {
                jQ.openingInput.typeahead('val', '')
            })
            .bind('change', function () {
                jQ.openingInput.typeahead('val', '')
            })
    })

function changePage(number, forbidScroll) {
    currentPageNumber = number
    draw()

    if (!forbidScroll) {
        setTimeout(function () {
            document.getElementById("lastPageLink").scrollIntoView()
        }, 10)
    }
}

function clearFilters() {
    filters = {
        anySide: [],
        white: [],
        black: [],
        opening: [],
        results: [],
        pgnFilter: "",
        title: "",
        b4Played: null,
        underpromotion: null
    }
    if (board) {
        board.position("start")
        game.reset()
    }
    jQ.titleInput.val('')
    jQ.publishedFrom.val('')
    jQ.publishedTo.val('')
    jQ.videoLengthFromInput.val('')
    jQ.videoLengthToInput.val('')
    jQ.queenCntSelect.val('')
    applyFilters(true)
}

function getVideoLengthFrom() {
    try {
        return parseInt(jQ.videoLengthFromInput.val())
    } catch (e) {
        return undefined
    }
}

function getVideoLengthTo() {
    try {
        return parseInt(jQ.videoLengthToInput.val())
    } catch (e) {
        return undefined
    }
}

onpopstate = (event) => {
    const state = JSON.parse(decodeURIComponent(atob(event.state)))
    filters = state.filters ? state.filters : filters
    sortBy = state.sortBy ? state.sortBy : sortBy
    sortDirection = state.sortDirection ? state.sortDirection : sortDirection
    applyFilters(false)
};

function pushHistory() {
    const state = {
        filters: filters,
        sortBy: sortBy,
        sortDirection: sortDirection
    }
    const encodedState = btoa(encodeURIComponent(JSON.stringify(state, null, "")));

    const url = new URL(window.location);
    url.searchParams.set('s', encodedState)

    history.pushState(encodedState, 'agadmator-library', url);
}

function applyFilters(shouldPushHistory) {
    if (shouldPushHistory) {
        pushHistory();
    }

    const pgnPrefixes = openings
        .filter(opening => _.some(filters.opening, filterOpening => opening.name === filterOpening))
        .map(opening => opening.moves)
    const includeTranspositions = jQ.transpositionCheck.is(":checked")
    const publishedFrom = jQ.publishedFrom.val()
    const publishedTo = jQ.publishedTo.val()
    const videoLengthFrom = getVideoLengthFrom()
    const videoLengthTo = getVideoLengthTo()
    const queenCnt = jQ.queenCntSelect.val() ? parseInt(jQ.queenCntSelect.val()) : undefined

    filteredVideos = videos
        .filter(video => {
            if (filters.anySide.length === 0) {
                return true
            } else {
                return _.some(filters.anySide, filter => testWhite(filter, video) || testBlack(filter, video))
            }
        })
        .filter(video => filters.white.length === 0 || _.some(filters.white, filter => testWhite(filter, video)))
        .filter(video => filters.black.length === 0 || _.some(filters.black, filter => testBlack(filter, video)))
        .filter(video => !filters.atLeastOneGame || video.games.length > 0)
        .filter(video => !filters.multipleGames || video.games.length > 1)
        .filter(video => !videoLengthFrom || video.length >= videoLengthFrom)
        .filter(video => !videoLengthTo || video.length <= videoLengthTo)
        .filter(video => {
            if (pgnPrefixes.length === 0) {
                return true
            }

            return _.some(pgnPrefixes, pgnPrefix => _.some(video.games, game => game.pgn && game.pgn.indexOf(pgnPrefix) === 0))
        })
        .filter(video => {
            if (filters.pgnFilter === "") {
                return true
            }

            return _.some(video.games, game => game.pgn && game.pgn.indexOf(filters.pgnFilter) === 0)
                || includeTranspositions && positions && positions[game.fen().replaceAll(/ - \d+ \d+/g, "")] && positions[game.fen().replaceAll(/ - \d+ \d+/g, "")].includes(video.positionIndex)
        })
        .filter(video => !filters.title || video.title.toLowerCase().includes(filters.title.toLowerCase()))
        .filter(video => {
            if (filters.results.length === 0) {
                return true
            } else {
                const videoResult = video.games[0] ? video.games[0].result : null
                return filters.results.includes(videoResult) || !videoResult && filters.results.includes("na")
            }
        })
        .filter(video => !filters.b4Played || _.some(video.games, game => game.b4Played))
        .filter(video => !filters.underpromotion || _.some(video.games, game => game.underpromotion))
        .filter(video => !queenCnt || _.some(video.games, game => game.queenCnt >= queenCnt))
        .filter(video => {
            return !publishedFrom || video.date > new Date(publishedFrom)
        })
        .filter(video => {
            return !publishedTo || video.date < new Date(publishedTo).setHours(23, 59, 59)
        })

    filteredVideos = _.sortBy(filteredVideos, function (video) {
        if (sortBy === "date") {
            return video.date
        } else if (sortBy === "title") {
            return video.title.replaceAll(/[^\p{L}\d -]/gu, "").toLowerCase()
        } else if (sortBy === "w") {
            return (video.games[0] ? video.games[0].getWhiteOrEmpty() : "").toLowerCase()
        } else if (sortBy === "b") {
            return (video.games[0] ? video.games[0].getBlackOrEmpty() : "").toLowerCase()
        } else if (sortBy === "year") {
            return video.games[0] && video.games[0].year ? video.games[0].year : ""
        } else {
            return ""
        }
    })
    if (sortDirection === "desc") {
        filteredVideos.reverse()
    }

    let watchOnYoutubeButton = document.getElementById('watchOnYoutubeButton');
    if (filteredVideos.length > 0) {
        watchOnYoutubeButton.classList.remove('disabled')
    } else if (!watchOnYoutubeButton.classList.contains('disabled')) {
        watchOnYoutubeButton.classList.add('disabled')
    }

    changePage(1, true)
}

function draw() {
    drawFilters()
    drawFilterResultsContainer()
    drawTable();
    drawTablePagination()
}

function removePlayerFilter(type, name) {
    filters[type].splice(filters[type].indexOf(name), 1)
    applyFilters(true)
    draw()
}

function removeOpeningFilter(openingName) {
    filters.opening.splice(filters.opening.indexOf(openingName), 1)
    applyFilters(true)
    draw()
}

function drawFilters() {
    const filtersContainerElement = document.getElementById("filtersContainer");

    function createFilterSpan(params) {
        let filterSpanElement = document.createElement("span");
        filterSpanElement.className = `badge ${params.cssClass} m-1`
        filterSpanElement.textContent = params.textContent
        filterSpanElement.onclick = params.onclick
        return filterSpanElement
    }

    const nodes = []
    filters.anySide.forEach(filter => {
        nodes.push(createFilterSpan({
            cssClass: 'text-bg-secondary',
            textContent: filter.playerName + (filter.playerResult ? ` | ${filter.playerResult}` : ""),
            onclick: () => removePlayerFilter("anySide", filter)
        }))
    })

    filters.white.forEach(filter => {
        nodes.push(createFilterSpan({
            cssClass: 'text-bg-light',
            textContent: filter.playerName + (filter.playerResult ? ` | ${filter.playerResult}` : ""),
            onclick: () => removePlayerFilter("white", filter)
        }))
    })

    filters.black.forEach(filter => {
        nodes.push(createFilterSpan({
            cssClass: 'text-bg-dark',
            textContent: filter.playerName + (filter.playerResult ? ` | ${filter.playerResult}` : ""),
            onclick: () => removePlayerFilter("black", filter)
        }))
    })

    filters.opening.forEach(openingName => {
        nodes.push(createFilterSpan({
            cssClass: 'text-bg-info',
            textContent: openingName,
            onclick: () => removeOpeningFilter(openingName)
        }))
    })

    if (filters.pgnFilter !== "") {
        nodes.push(createFilterSpan({
            cssClass: 'text-bg-info',
            textContent: `PGN ${filters.pgnFilter}`,
            onclick: () => {
                filters.pgnFilter = ""
                if (board) {
                    board.position("start")
                }
                if (game) {
                    game.reset()
                }
                applyFilters(true)
            }
        }))
    }

    if (filters.title !== "") {
        nodes.push(createFilterSpan({
            cssClass: 'text-bg-info',
            textContent: "Title: " + filters.title,
            onclick: () => {
                filters.title = ""
                document.getElementById('titleInput').value = ""
                applyFilters(true)
            }
        }))
    }

    filters.results.forEach(result => {
        let resultText = ""
        switch (result) {
            case "w":
                resultText = "white"
                break
            case "b":
                resultText = "black"
                break
            case "d":
                resultText = "draw"
                break
            case "na":
                resultText = "n/a"
                break
        }

        nodes.push(createFilterSpan({
            cssClass: 'text-bg-info',
            textContent: `Result: ${resultText}`,
            onclick: () => {
                filters.results.splice(filters.results.indexOf(result), 1)
                applyFilters(true)
            }
        }))
    })

    if (filters.b4Played) {
        nodes.push(createFilterSpan({
            cssClass: 'text-bg-info',
            textContent: "White played b4!!!",
            onclick: () => {
                filters.b4Played = null
                applyFilters(true)
            }
        }))
    }

    if (filters.underpromotion) {
        nodes.push(createFilterSpan({
            cssClass: 'text-bg-info',
            textContent: "Underpromotion",
            onclick: () => {
                filters.underpromotion = null
                applyFilters(true)
            }
        }))
    }

    if (filters.atLeastOneGame) {
        nodes.push(createFilterSpan({
            cssClass: 'text-bg-info',
            textContent: "At least one game",
            onclick: () => {
                filters.atLeastOneGame = null
                applyFilters(true)
            }
        }))
    }

    if (filters.multipleGames) {
        nodes.push(createFilterSpan({
            cssClass: 'text-bg-info',
            textContent: "Multiple games in video",
            onclick: () => {
                filters.multipleGames = null
                applyFilters(true)
            }
        }))
    }

    const publishedFromValue = jQ.publishedFrom.val()
    if (publishedFromValue) {
        nodes.push(createFilterSpan({
            cssClass: 'text-bg-info',
            textContent: `Published >= ${publishedFromValue}`,
            onclick: () => {
                jQ.publishedFrom.val('')
                applyFilters(false)
            }
        }))
    }

    const publishedToValue = jQ.publishedTo.val()
    if (publishedToValue) {
        nodes.push(createFilterSpan({
            cssClass: 'text-bg-info',
            textContent: `Published <= ${publishedToValue}`,
            onclick: () => {
                jQ.publishedTo.val('')
                applyFilters(false)
            }
        }))
    }

    if (getVideoLengthFrom()) {
        nodes.push(createFilterSpan({
            cssClass: 'text-bg-info',
            textContent: `Video length >= ${getVideoLengthFrom()}`,
            onclick: () => {
                jQ.videoLengthFromInput.val('')
                applyFilters(false)
            }
        }))
    }

    if (getVideoLengthTo()) {
        nodes.push(createFilterSpan({
            cssClass: 'text-bg-info',
            textContent: `Video length <= ${getVideoLengthTo()}`,
            onclick: () => {
                jQ.videoLengthToInput.val('')
                applyFilters(false)
            }
        }))
    }

    if (jQ.queenCntSelect.val()) {
        nodes.push(createFilterSpan({
            cssClass: 'text-bg-info',
            textContent: `Queen count >= ${jQ.queenCntSelect.val()}`,
            onclick: () => {
                jQ.queenCntSelect.val('')
                applyFilters(false)
            }
        }))
    }

    $('#sortBySelect').val(sortBy)
    $('#sortDirectionSelect').val(sortDirection)

    filtersContainerElement.replaceChildren(...nodes)
}

function drawFilterResultsContainer() {
    const total = filteredVideos.length
    const withPlayers = filteredVideos.filter(video => video.games[0] && video.games[0].white).length
    document.getElementById("filterResultsContainer").textContent = `Videos: ${total}, with players: ${withPlayers}`;
    const withPgns = filteredVideos.filter(video => _.some(video.games, game => game.pgn)).length
    document.getElementById("filterResultsContainer").textContent += `, with moves: ${withPgns}`;
    const withResults = filteredVideos.filter(video => video.games[0] && video.games[0].result).length
    document.getElementById("filterResultsContainer").textContent += `, with results: ${withResults}`;
}

function drawTable() {
    let tableBodyElement = document.getElementById("tableBody");
    let newNodes = filteredVideos.slice((currentPageNumber - 1) * pageSize, (currentPageNumber) * pageSize)
        .map(video => {
            let tableRow = document.createElement("tr");

            let publishedAtCell = document.createElement("th");
            publishedAtCell.textContent = video.date.toISOString()
            publishedAtCell.className = 'd-none d-lg-block'
            tableRow.appendChild(publishedAtCell)

            let titleCell = document.createElement("td");
            titleCell.setAttribute("data-toggle", "tooltip")
            titleCell.setAttribute("data-placement", "top")
            titleCell.setAttribute("title", video.title)
            let titleHref = document.createElement("a");
            titleHref.href = "https://www.youtube.com/watch?v=" + video.id
            titleHref.target = "_blank"
            titleHref.textContent = _.truncate(video.title, {
                'length': 45,
                'omission': '...'
            })
            titleCell.appendChild(titleHref)
            tableRow.appendChild(titleCell)

            let whitePlayerCell = document.createElement("td");
            video.games.forEach(game => {
                let nameCell = document.createElement("div");
                if (game.white) {
                    nameCell.textContent = _.truncate(game.white, {
                        'length': 40,
                        'omission': '...'
                    })
                }
                whitePlayerCell.appendChild(nameCell)
            })
            tableRow.appendChild(whitePlayerCell)

            let blackPlayerCell = document.createElement("td");
            video.games.forEach(game => {
                let nameCell = document.createElement("div");
                if (game.white) {
                    nameCell.textContent = _.truncate(game.black, {
                        'length': 40,
                        'omission': '...'
                    })
                }
                blackPlayerCell.appendChild(nameCell)
            })
            tableRow.appendChild(blackPlayerCell)

            let yearCell = document.createElement("td");
            yearCell.className = 'table-cell'
            if (video.games && video.games[0] && video.games[0].year) {
                yearCell.textContent = video.games[0].year
            }
            tableRow.appendChild(yearCell)

            if (showResult) {
                let resultCell = document.createElement("td");
                if (video.games && video.games[0] && video.games[0].result) {
                    resultCell.textContent = video.games[0].result
                }
                tableRow.appendChild(resultCell)
            }
            return tableRow
        });

    tableBodyElement.replaceChildren(...newNodes)
}

function drawTablePagination() {
    let tablePaginationElement = document.getElementById("tablePagination");
    let paginationItems = tablePaginationElement.children
    Array.from(paginationItems).forEach(paginationItem => {
        if (paginationItem.className.indexOf("page-number-selector") > 0) {
            paginationItem.remove()
        }
    })
    // <li class="page-item page-number-selector"><a class="page-link" href="#">1</a></li>
    let pageNumbers = _.range(Math.max(1, currentPageNumber - 10), Math.min(filteredVideos.length / pageSize + 1, currentPageNumber + 10));
    let idxCurrent = pageNumbers.indexOf(currentPageNumber);
    pageNumbers
        .slice(Math.max(idxCurrent - 6, 0), Math.max(idxCurrent - 2, 0) + 9)
        .slice(0, 9)
        .forEach(nr => drawSinglePaginationPage(nr, nr === currentPageNumber))
}

function drawSinglePaginationPage(number, active) {
    let tablePaginationElement = document.getElementById("tablePagination");
    let liElement = document.createElement("li");
    liElement.className = "page-item page-number-selector " + (active ? "active" : "")
    let href = document.createElement("a");
    href.textContent = number
    href.className = "page-link text-center"
    href.href = "#"
    href.onclick = ev => changePage(number)
    liElement.appendChild(href)
    tablePaginationElement.insertBefore(liElement, tablePaginationElement.childNodes.item(tablePaginationElement.childNodes.length - 4))
}

let game = null
let board = null

import {Chess} from 'https://cdn.jsdelivr.net/npm/chess.js@1.0.0-beta.3/+esm'

$('#collapsibleBoardFilterButton').on('click', function () {
    if (board == null) {
        loadBoard()
    }
})

function loadBoard() {
    game = new Chess()

    function onDragStart(source, piece) {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop
        let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

        window.onscroll = function () {
            window.scrollTo(scrollLeft, scrollTop);
        };

        setTimeout(function () {
            window.onscroll = function () {
            }
        }, 3000)

        if (game.isGameOver()) return false

        // only pick up pieces for the side to move
        if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
            (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
            return false
        }
    }

    function onDrop(source, target) {
        window.onscroll = function () {
        }

        try {
            game.move({
                from: source,
                to: target,
                promotion: 'q'
            })

            filters.pgnFilter = game.pgn()
            setTimeout(function () {
                // hack for wrong display of white O-O
                board.position(game.fen())
            }, 1)
            applyFilters(true)
        } catch (e) {
            return 'snapback'
        }
    }

    const config = {
        draggable: true,
        position: 'start',
        dropOffBoard: 'snapback',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapbackEnd: () => window.onscroll = function () {
        },
        onMoveEnd: () => window.onscroll = function () {
        }
    }

    $('#boardFilter').width(Math.min($("#collapsibleBoardFilter").width(), 400))
    board = Chessboard('boardFilter', config)

    if (filters.pgnFilter) {
        game.loadPgn(filters.pgnFilter)
        board.position(game.fen())
    }
}
