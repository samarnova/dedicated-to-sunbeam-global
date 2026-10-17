function getAllScores() {
    const saved = localStorage.getItem("purrrfect-scores");
    if (saved === null) {
        return{};
    }
    return JSON.parse(saved);
}

function saveGameScore(gameName, right, wrong, finished) {
    const scores = getAllScores();
    scores[gameName] = { right: right, wrong: wrong, finsihed: finished === true};
    localStorage.setItem("purrrfect-scores", JSON.stringify(scores));
}