import dataset from "../data/dataset.js"
import InputPageBuilder from "./InputPageBuilder.js"

import { createAndSendMessage } from './utils/web-socket-utils.js'

class NotebookPageController {
    
    static letters = [ "A", "B", "C", "D", "E", "J", "K"]

    static theme = {
        dark: "white",
        light: "black"
    }

    constructor(){
        this.letterInputs = document.querySelectorAll('.letter input')
        this.modal = document.querySelector("dialog")
        this.btn = document.getElementById("socket-send")

        this.attachEventListeners()
        this.buildCharts()
        this.buildInputs()
    }

    updateTheme(){
        const isDark = document.body.classList.toggle("--dark")
        const styles = getComputedStyle(document.body)
        
        this.theme = {
            primaryColor: styles.getPropertyValue("--primary-color"),
            secondaryColor: styles.getPropertyValue("--secondary-color")
        }

        return isDark
    }

    changeNotebookTheme(){
        const isDark = this.updateTheme()

        const color = isDark ? NotebookPageController.theme.dark : NotebookPageController.theme.light

        this.charts.forEach(chart => {
            chart.config.options.scales.x.ticks.color = color
            chart.config.options.scales.x.grid.color = color
            chart.config.options.scales.y.ticks.color = color
            chart.config.options.scales.y.grid.color = color
            chart.config.data.datasets[0].backgroundColor = this.theme.primaryColor
            chart.config.data.datasets[0].borderColor = this.theme.secondaryColor
            chart.update()
        })
    }

    async buildCharts(){
        const charts = []

        const fetchTrainmentErrors = async () => {
            const data = await fetch("./data/MLP_Error.csv")
            const parse = await data.text()
            const labels = []
            const errors = []

            parse.split("\n").map( line => {
                const [ epoch, error ] = line.split(",")

                labels.push(epoch)
                errors.push(parseFloat(error))
            })
            
            return [labels, errors]
        }

        const [labels, data] = await fetchTrainmentErrors();

        const context = document.getElementById("mlp-error").getContext("2d")

        const chart = new Chart(context, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: "Erro",
                    data,
                    backgroundColor: "#c21947",
                    borderColor: "#e44c75"
                }]
            },
            options: {}
        })

        charts.push(chart)

        console.log(charts)
        this.charts = charts
    }

    sendMessage(){
        const paragrafo = this.modal.querySelector("p")
        const letters = NotebookPageController.letters
        const parse = (input) => input.checked ? 1 : -1
        const step = (value) => value + 0.05 > 1 ? 1 : 0
        const letter = Array.from(document.querySelectorAll('.letter .letter-input'))
        const message = letter.slice(0, 63).map(parse)

        createAndSendMessage({ values: Array.of(message) }, async (response) => {
            const [ data ] = await JSON.parse(response.data)
            const formatted_data = data.map( (element, index) => ({ real: element, index, formatted: step(element) }))
            
            const possible_letter = formatted_data.filter((data) => data.formatted === 1)

            if(possible_letter.length === 0 ){
                paragrafo.textContent = "Não consegui predizer sua letra" + JSON.stringify(formatted_data)
                modal.showModal()
                return
            }

            if(possible_letter.length > 1){
                const predicted = possible_letter.map( (data) => letters[data.index])
                paragrafo.textContent = `Houve uma confusão entre: ${predicted}`
                modal.showModal()
                return
            }

            const letter = possible_letter.at(0);

            paragrafo.textContent = `Letra ${letters[letter.index]}`

            modal.showModal()

        })
    }

    getLetterInputs(){
        if(this.letterInputs.length === 0){
            this.letterInputs = document.querySelectorAll(".letter input")
        }

        return this.letterInputs
    }

    changeInputLetter(event){
        const id = event.target.getAttribute("data-id")
        const data = dataset.at(id)
        this.getLetterInputs().forEach( (input, index) => input.checked = (data[index] === 1) )
    }

    buildInputs(){
        const nav = document.querySelector(".nav-letters")

        const createButton = (index) => {
            const button = document.createElement("button")
            button.setAttribute("type", "button")
            button.setAttribute("data-id", index)
            button.addEventListener("click", this.changeInputLetter.bind(this))
            button.textContent = `Letra ${NotebookPageController.letters[index]}`
            return button
        }

        Array.from( { length: dataset.length }, (_, index) => {
            nav.insertAdjacentElement("beforeend", createButton(index))
        })

        new InputPageBuilder({
            root: document.querySelector('.letter'),
            dataset: Array.of(dataset.at(0)),
            numberOfLettersPerRow: 7
        })       
    }

    attachEventListeners(){
        const headerButton = document.querySelector(".--change-theme")
        
        headerButton.addEventListener("click", this.changeNotebookTheme.bind(this))
        this.btn.addEventListener("click", this.sendMessage.bind(this))
    }

}

const controller = new NotebookPageController();

console.log(controller)
