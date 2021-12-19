class Game {
    constructor() {
        this.gameElement = document.getElementById('app')

        this.tableWidth = 3
        this.players = ['X', 'O']
        this.gameResults = []
        this.turn = null
        
        this.gameManager = {
            totalOfPlays: 0,
            gameover: false,
            winner: false,
            scoreElement: null,
            turnElement: null
        }

        this.wins = [
            [0,1,2],
            [3,4,5],
            [6,7,8],
            [0,3,6],
            [1,4,7],
            [2,5,8],
            [0,4,8],
            [2,4,6]
        ]

        this.init()
    }

    randomTurn() {
        let turn = this.players[Math.floor(Math.random() * this.players.length)]

        this.nextTurn(turn)
    }
    
    init() {
        this.generateGameBlocks()

        this.gameManager.turnElement = document.querySelector('.game-header .turn')
        this.gameManager.scoreElement = document.querySelector('.game-header .score')

        this.randomTurn()
    }

    generateGameBlocks() {
        for(let i = 0; i < this.tableWidth * this.tableWidth; i++) {
            let block = this.createGameBlock()

            this.gameElement.appendChild(block)
        }

        this.startGameActions()
    }

    createGameBlock() {
        let block = document.createElement('div')
        block.classList.add('block')
        block.classList.add('flex-center')

        return block
    }

    startGameActions() {
        let blocks = document.querySelectorAll('#app .block')
        
        blocks.forEach((block, i) => {
            block.addEventListener('click', clickedBlock => {
                let blockTarget = clickedBlock.target

                if( !block || 
                    blockTarget.innerText || 
                    this.gameManager.winner !== false || 
                    this.gameManager.gameover) return

                blockTarget.innerText = this.turn // Seta o bloco do jogo clicado como O ou X
                this.gameResults[i] = this.turn // Guarda a jogada na memória
                this.gameManager.totalOfPlays++ // Total de jogadas
        
                let result = this.checkGameResult()

                if(result >= 0) {
                    this.gameManager.winner = result
                } else {
                    this.nextTurn()
                }

                this.gameResolver()
            })
        })
    }

    gameResolver() {
        if(this.gameManager.winner !== false) {
            this.successScore()
            return
        }

        if(this.gameManager.totalOfPlays >= 9) {
            this.gameManager.gameover = true
        }

        if(this.gameManager.gameover) {
            this.gameOverScore()
        }
    }

    nextTurn(turn = null) {
        if(!turn) {
            turn = this.players.find(player => player != this.turn)
        }

        this.turn = turn

        this.gameManager.turnElement.innerText = turn
        this.gameManager.scoreElement.innerText = `Vez de ${turn}`
    }

    checkGameResult() {
        let winningSequence = -1
        
        this.wins.forEach((array, index) => {
            if(this.gameResults[this.wins[index][0]] == this.turn &&
                this.gameResults[this.wins[index][1]] == this.turn &&
                this.gameResults[this.wins[index][2]] == this.turn) {
                winningSequence = index
            }
        })
            
        return winningSequence
    }

    successScore() {
        let winnerSequence = this.wins[this.gameManager.winner],
            blocks = document.querySelectorAll('#app .block')

        blocks.forEach((block, index) => {
            if(!winnerSequence.includes(index)) return

            block.classList.add('winner')
        })

        this.gameManager.scoreElement.style.color = 'cyan'
        this.gameManager.scoreElement.innerText = `${this.turn} venceu!`
    }

    gameOverScore() {
        this.gameManager.scoreElement.style.color = 'red'
        this.gameManager.scoreElement.innerText = `GAMEOVER`
    }
}

window.onload = () => new Game()