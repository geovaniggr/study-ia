import InputPageBuilder from './InputPageBuilder.js';

const or = (value, condition, other) => (value === condition) ? value : other

const parseElement = (value) => or(parseInt(value), 1, -1)

const parseLines = (data) => data.split("\n")

const parseLine = (line) => line.split(",").map(parseElement)

const pipe = (...fns) => (data) => fns.reduce( (actual, fn) => fn(actual), data)

const parse = pipe(
    parseLines,
    (lines) => lines.map(parseLine),
)

const createPage = (dataset) => {
    return new InputPageBuilder({
        root: document.querySelector(".letters-container"),
        btn: document.getElementById("btn-download"),
        dataset: dataset,
        numberOfLettersPerRow: 7
    })
}

fetch("../data/dataset.csv")
.then( data => data.text() )
.then(parse)
.then(createPage)
.catch(console.error)