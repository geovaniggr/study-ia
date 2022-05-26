class CanvasPageBuilder {

    constructor({ root, dataset, rowSize, columnSize, colors, numberOfLetters}){
        this.root = root;
        this.dataset = dataset;
        this.rowSize = rowSize;
        this.numberOfLetters = numberOfLetters;
        this.columnSize = columnSize;
        this.colors = colors;
        this.containers = this.buildCanvas();
        this.init()
    }

    init(){
        this.appendContainersToRoot();
        this.drawLetters();
    }

    appendContainersToRoot(){
        this.containers.forEach(container => this.root.appendChild(container))
    }

    getCanvasContext(index){
        return this.containers[index].querySelector("canvas").getContext("2d")
    }

    draw(context){
        return (x, y) => context.fillRect(x, y, 20, 20);
    }

    getHorizontalOffset(index){
        const letterWidth = this.columnSize * 20
        const offset = 20;
        return index * (letterWidth + offset)
    }

    drawLetters(){
        for(let index = 0; index < this.dataset.length; index++){
            const line = this.dataset[index]
            const normalizedIndexByLetter = index % this.numberOfLetters;
            const canvasIndex = Math.trunc(index / this.numberOfLetters)
            const sizeWithoutAnswer = line.length - 7
            
            const color = this.colors[normalizedIndexByLetter]
            const horizontalOffset = this.getHorizontalOffset(normalizedIndexByLetter)

            const context = this.getCanvasContext(canvasIndex)
            const draw = this.draw(context)

            context.fillStyle = color

            for(let line_index = 0; line_index < sizeWithoutAnswer; line_index++){
                const pixel = line[line_index];

                const row = Math.trunc( (line_index / this.columnSize ))
                const column = (line_index % this.columnSize )

                const horizontal = horizontalOffset + (column * 20)
                const vertical = (row * 20)

                if(pixel === 1) draw(horizontal, vertical)
            }
        }
    }

    buildCanvas(){
        const numberOfCanvas = Math.trunc(this.dataset.length / this.numberOfLetters)
        
        const canvas = new Array(numberOfCanvas).fill(0).map( (_, index) => {
            const letterContainer = document.createElement("div")
            const canvas = document.createElement("canvas")
            const title = document.createElement("h2")
        

            canvas.height = this.rowSize * 20
            canvas.width = ((this.columnSize * 20) * this.numberOfLetters) + (this.numberOfLetters * 20)
        
            title.textContent = `Canvas de Número ${index + 1}`
            letterContainer.classList.add("letter-container")
        
            letterContainer.appendChild(title)
            letterContainer.appendChild(canvas)
            return letterContainer
        })

        return canvas
    }

}

// new CanvasPageBuilder({
//     root: document.querySelector('.letters-container.--limpo'),
//     dataset: dataset_limpo,
//     rowSize: 9,
//     columnSize: 7,
//     numberOfLetters: 7,
//     colors: [ "black", "#c51f1f", "#130897", "#369708", "#8d0897", "#088697", "#ca8609"]
// })

// new CanvasPageBuilder({
//     root: document.querySelector('.letters-container.--ruido'),
//     dataset: dataset_com_ruido,
//     rowSize: 9,
//     columnSize: 7,
//     numberOfLetters: 7,
//     colors: [ "black", "#c51f1f", "#130897", "#369708", "#8d0897", "#088697", "#ca8609"]
// })
