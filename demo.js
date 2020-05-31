const PLAYERS = {}
const RESULTS = {}

class Player {
    constructor() {
      this.id = this.getId()
      this.isDealer = !this.id | 0
      this.balance = 1000
      this.hand = []
      this.bet = 0
      PLAYERS[this.id] = this
    }
  
    getId() {
      return Object.keys(PLAYERS).length
    }
  
    score() {
      let total = 0
      const elevens = []
      for (let i = 0; i < this.hand.length; i++) {
        total += this.hand[i].value
        if (this.hand[i].value === 11) {
          elevens.push(i)
        }
      }
      if (total > 21) {
        const elevenToOneCount = Math.ceil((total - 21) / 10)
        for (const index of elevens.slice(0, elevenToOneCount)) {
          this.hand[index].value = 1
          total -= 10
        }
      }
      return total
    }
}

class Card {
    constructor(suit, rank) {
      this.suit = suit;
      this.rank = rank;
      this.value = this.setValue(rank)
    }
  
    setValue(rank) {
      if (['10', 'J', 'Q', 'K'].includes(rank)) {
          return 10
      }
      else if (rank === 'A') {
          return 11
      }
      else {
          return parseInt(rank)
      }
    }
  }

class Deck {
    constructor(i=1) {
        this.cards = this.generateDeck(i)
        this.shuffle()
    }

    generateDeck(n = 1) {
        const SUITS = ["Hearts", "Spades", "Clubs", "Diamonds"]
        const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "K", "J", "Q", "A"]
        const deck = []
        
        for (let i = 0; i < n; i++) {
            for (const suit of SUITS){
                for (const rank of RANKS){
                    deck.push(new Card(suit, rank))
                }
            }
        }
        return deck
    }

    shuffle() {
        let a, b, i, j, x
        for (i = this.cards.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = x;
        }
    }

    dealCard(id) {
        const card = this.cards.shift()
        card.playerId = id
        const player = PLAYERS[id]
        player.hand.push(card)
        const pCH = getPlayerCardholder(id)
        if (id === 0 && player.hand.length === 1) {
            pCH.querySelector('.card-holder').innerHTML += getCardImage(card, false)
        }
        else {
            pCH.querySelector('.card-holder').innerHTML += getCardImage(card)
        }
        pCH.querySelector('h2').innerHTML = `${id ? 'Your' : 'Dealer'} Score: ${player.score()}`
    }

}

const deque = new Deck
for (const i of [0, 1]) {
    new Player
}

function getPlayerCardholder(i) {
    return document.querySelector(`.player[pid='${i}']`)
}

function getCardImage(card, notBack = true) {
    return notBack ? `<img src='card-images/${card.rank}${card.suit[0]}.png'>` : `<img src='card-images/Back.jpg'>`
}

function loginToGame() {
    const form = document.getElementById('login-form')
    const gameCenter = document.getElementById('game-center')
    form.addEventListener("submit", (e) => {
      e.preventDefault()
      if (e.target.querySelector("input[name='password']").value === 'password') {
        form.style.display = 'none'
        gameCenter.style.display = 'block'
        document.getElementById('sound').play()
        return
      }
      else {
        form.querySelector('p').innerHTML = "Invalid entry. Try again!"
      }
    })
  }

function playerTurn(id=1) {
    const dialog = document.getElementById('dialog')
    const player = PLAYERS[id]

    document.addEventListener('click', (e) => {
        if (e.target.id === 'hit') {
            deque.dealCard(id)
            if (player.score() === 21) {
                dialog.innerHTML = 'Congrats, you hit 21!'
            }
            else if(player.score() > 21) {
                dialog.innerHTML = 'Bitch, u mufukkin busted mufukka!'
            }
            else {
                dialog.innerHTML = 'Still yo turn ho. Watchu gon du?'
            }
        }
        else if (e.target.id === 'stay') {
            dialog.innerHTML = `You held at ${player.score()}.`
            document.querySelector('.play-buttons').style.display = 'none'
            document.getElementById('winner').style.display = 'block'
        }
    })
}

function dealerTurn() {
    const dialog = document.getElementById('dialog')
    const player = PLAYERS[0]
    while (player.score() < 17) {
        deque.dealCard(0)
    }
    if (player.score() > 21) {
        dialog.innerHTML = 'Dat nigga dealer dun busted!'
    }
    else {
        dialog.innerHTML = `Dealer's score be ${player.score()}.`
    }
}

document.addEventListener('click', (e) => {
    const dialog = document.getElementById('dialog')
    if (e.target.id === 'winner') {
        const gameId = Object.keys(RESULTS).length
        const rezObj = {}
        let rez
        const [dealerScore, userScore] = [PLAYERS[0].score(), PLAYERS[1].score()]
        if (userScore > 21 || dealerScore <= 21 && dealerScore > userScore) {
            dialog.innerHTML = 'Dealer beat you, bitch.'
            rez = 'L'
        }
        else if (userScore === dealerScore) {
            dialog.innerHTML = "Y'all mufuckas dun tied!"
            rez = 'T'
        }
        else {
            dialog.innerHTML = 'Dam cunt, sumhow, u dun won!!'
            rez = 'W'
        }
        rezObj['result'] = rez
        rezObj['dealer'] = {'score': PLAYERS[0].score(), 'hand': PLAYERS[0].hand}
        rezObj['user'] = {'score': PLAYERS[1].score(), 'hand': PLAYERS[1].hand}
        RESULTS[gameId] = rezObj
        console.log(RESULTS)
        e.target.style.display = 'none'
        document.getElementById('new-game').style.display = 'block'
    }
})

function playGame() {
    loginToGame()

    for (const i of [0, 1]) {
        deque.dealCard(i)
        deque.dealCard(i)
    }

    playerTurn()
    dealerTurn()
}

document.addEventListener('DOMContentLoaded', () => {
    playGame()
})