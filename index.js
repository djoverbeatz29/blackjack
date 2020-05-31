class Player {
  constructor() {
    this.id = this.getId()
    this.isDealer = this.id | 0
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
  };
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

function generateDeck(n = 1) {
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
  let a, b, i;
  for (i = deck.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = deck[i];
      deck[i] = deck[j];
      deck[j] = x;
  }
  return deck
}

const PLAYERS = new Object
const deck = generateDeck(2)

function renderPlayer(id, isDealer) {
  const player = new Player(id, isDealer)
  return `<div class='player-info' isDealer='${player.isDealer}' score='${player.score()}' balance='${player.balance}' player-id='${player.id}'>
    <h2 name='score'>${isDealer ? 'Dealer' : 'Your'} Score: 0</h2>
    <h2 name='balance'>${isDealer ? "" : `Balance: $${player.balance.toLocaleString()}`}</h2>
    <div class='chips'>
      <h2 name='bet'></h2>
      <div class='chip-container'></div>
    </div>
    <div class='card-container'></div>
  </div>`
}

function renderChip(i) {
  return `<img name='chip' chip-id='${i}' src='./chip-images/chip-${i}.jpg'>`
}

function renderPlayers(n = 1) {
  document.querySelector('.house-holder').innerHTML = renderPlayer(0, true)
  for (let i = 1; i <= n; i++) {
    document.querySelector('.player-holder').innerHTML += renderPlayer(i, false)
  }
}

function renderCard(card, playerId = 0) {
  const playerOb = PLAYERS[playerId]
  const isUp = (playerId === 0 && playerOb.hand.length === 1)
  const player = document.querySelector(`.player-info[player-id='${playerId}']`)
  let cardTag
  if (playerId === 0 && playerOb.hand.length === 1) {
    cardTag = `<img src='card-images/Back.jpg'>`
  }
  else {
    cardTag = `<img src='card-images/${card.rank}${card.suit[0]}.png'>`
  }
  if (playerId === 0) {
    if (playerOb.hand.length === 1) {
      player.querySelector("h2[name='score']").innerHTML = ""
    }
    else {
      player.querySelector("h2[name='score']").innerHTML = `Dealer Score: ${card.value}`
    }
  }
  else {
    player.querySelector("h2[name='score']").innerHTML = `Your score: ${playerOb.score()}`
  }
  player.querySelector('.card-container').innerHTML += cardTag
  return
}

function dealCard(playerId = 0) {
  const card = deck.shift()
  PLAYERS[playerId].hand.push(card);
  renderCard(card, playerId)
}

function takeBet(player) {
  const betForm = document.getElementById('bet-form')
  const playerInfo = document.querySelector(`.player-info[player-id='${player.id}']`)
  const betInfo = playerInfo.querySelector("h2[name='bet']")
  const playerChips = playerInfo.querySelector('.chip-container')
  betForm.style.display = 'block'
  betInfo.innerHTML = ""
  let playerBet = 0

  document.addEventListener('click', (e) => {
    if (e.target.name === 'chip') {
      const amount = parseInt(e.target.getAttribute('chip-id'))
      playerChips.innerHTML += renderChip(amount)
      playerBet += amount
      betInfo.innerHTML = `Bet: $${playerBet}`
    }
    else if (e.target.name === 'reset') {
      playerBet = 0
      playerChips.innerHTML = ""
      betInfo.innerHTML = "Bet: $0"
    }
  })

  betForm.addEventListener("submit", (e) => {
    e.preventDefault()
    player.bet = playerBet
    betInfo.innerHTML = `Bet: $${player.bet}`
    betForm.style.display = 'none'
  })
}

function userPlay(player) {
  const playerTurnButtons = document.getElementById('player-turn-buttons')
  playerTurnButtons.style.display = 'block'
  const dialog = document.getElementById('dialog')
  let score

  document.addEventListener("click", e => {
    if (e.target.id === 'hit-btn') {
      dealCard(player.id)
      score = player.score()
      if (score> 21) {
        dialog.innerHTML = "Busted!"
      }
    }
    else if (e.target.id === 'stay-btn') {
      dialog.innerHTML = `Held at ${score}.`
    }
  })
  console.log(player)
  return score
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

function dealerPlay() {
  const playerOb = PLAYERS[0]
  const player = document.querySelector(".player-info[isdealer='true']")
  const cardContainer = player.querySelector(".card-container")
  const scoreDisplay = player.querySelector("h2[name='score']")

  cardContainer.innerHTML = playerOb.hand.map(card => renderCard(card))
  scoreDisplay.innerHTML = `Dealer Score: ${playerOb.score()}`
  while (playerOb.score() < 17) {
    dealCard()
  }
  if (playerOb.score() > 21) {
    dialog.innerHTML += "The dealer busted. "
  }
  else {
    dialog.innerHTML += `Dealer held at ${playerOb.score()}`
  }
  console.log(playerOb)
  return playerOb.score()
}

function displayWinner() {
  const userScore = userPlay(PLAYERS[1])
  const dealerScore = dealerPlay(PLAYERS[0])
  if (userScore <= 21 && (dealerScore > 21 || userScore > dealerScore)) {
    dialog.innerHTML += "You won!"
    PLAYERS[1].balance += PLAYERS[1].bet
  }
  else if (userScore <= 21 && userScore === dealerScore) {
    dialog.innerHTML += "'Twas a push!"
  }
  else {
    dialog.innerHTML += "You lost!"
    PLAYERS[1].balance = Math.max(0, PLAYERS[1].balance - PLAYERS[1].bet)
  }
  PLAYERS[1].bet = 0
  document.getElementById('new-game').style.display = 'block'
  return
}

document.addEventListener("DOMContentLoaded", () => {
  // loginToGame()
  // renderPlayers()

  // for (let i = 1; i < Object.keys(PLAYERS).length; i++) {
  //   takeBet(PLAYERS[i])
  // }

  // for (let i = 0; i < Object.keys(PLAYERS).length; i++) {
  //   [0, 1].forEach(n => dealCard(i))
  // }

  // displayWinner()
})

// document.addEventListener("DOMContentLoaded", () => {
//   const form = document.getElementById('login-form')
//   const gameCenter = document.getElementById('game-center')
//   const newGame = document.getElementById('new-game')

//   form.style.display = 'block'
//   gameCenter.style.display = 'none'

//   let playerBalance = 1000

//   function playGame() {

//     let playerBet = 0
//     let houseHand = []
//     let userHand = []
//     const deck = generateDeck(4)
//     // const splitButton = document.getElementById('split-btn')
//     const betForm = document.getElementById('bet-form')
//     const dialog = document.getElementById('dialog')
//     const playerTurnButtons = document.getElementById('player-turn-buttons')
//     const dube = document.getElementById('double-btn')

//     const house = document.querySelector("div[name='house']")
//     const user = document.querySelector("div[name='user']")

//     const balanceInfo = document.querySelectorAll(".player-info[name='user'] h2")[1]
//     const betInfo = document.querySelectorAll(".player-info[name='user'] h2")[2]
//     betInfo.innerHTML = ""

//     balanceInfo.innerHTML = `Balance: $${playerBalance.toLocaleString()}`

//     dialog.innerHTML = null
//     for (const cont of document.getElementsByClassName('card-container')) {
//       cont.innerHTML = null
//     }
//     for (const header of document.getElementsByClassName('h2')) {
//       header.innerHTML = null
//     }
  
//     function drawCard(isUser = true) {
//       const player = document.querySelector(`div[name='${isUser ? 'user' : 'house'}']`)
//       const cardContainer = player.querySelector(".card-container")
//       const scoreDisplay = player.querySelector("h2")
  
//       const cardIndex = Math.floor(Math.random() * deck.length)
//       const card = deck[cardIndex]
//       const hand = isUser ? userHand : houseHand
//       deck.splice(cardIndex, 1)
//       hand.push(card)
    
//       if (!isUser) {
//         if (hand.length === 1) {
//           cardContainer.innerHTML += renderCard()
//         }
//         else {
//           cardContainer.innerHTML += renderCard(card)
//           scoreDisplay.innerHTML = `Dealer Score: ${hand.length === 2 ? calculateTotal([card]) : calculateTotal(hand)}`;
//         }
//       }
//       else {
//         cardContainer.innerHTML += renderCard(card)
//         scoreDisplay.innerHTML = `Your Score: ${calculateTotal(hand)}`;
//       }
  
//       return card
//     }
  
//     function renderChip(i) {
//       return `<img name='chip' chip-id='${i}' src='./chip-images/chip-${i}.jpg'>`
//     }
  
//     function generateChipList() {
//       const chipList = document.getElementById('chip-list')
//       chipList.innerHTML = ""
//       for (const num of [5, 10, 25, 50]) {
//         chipList.innerHTML += renderChip(num)
//       }
//     }
  
//     function prelim() {
//       console.log("prelim()")
//       betForm.style.display = 'block'
//       playerBet = 0
//       generateChipList()
//       // userHand = []
//       // houseHand = []
//       house.querySelector('h2').innerHTML = "Dealer Score: 0"
//       user.querySelector('h2').innerHTML = "User Score: 0"

//       document.addEventListener('click', (e) => {
//         if (e.target.name === 'chip') {
//           const amount = parseInt(e.target.getAttribute('chip-id'))
//           playerBet += amount
//           betForm.querySelector('h2').innerHTML = `Bet: $${playerBet}`
//         }
//         else if (e.target.name === 'reset') {
//           playerBet = 0
//           betForm.querySelector('h2').innerHTML = "Bet: $0"
//         }
//       })
//       betForm.addEventListener("submit", (e) => {
//         e.preventDefault()
//         betInfo.innerHTML = `Bet: $${playerBet}`
//         betForm.style.display = 'none'
//         betForm.querySelector('h2').innerHTML = ""
//         initialDraw()
//       })
//     }
  
//     function initialDraw() {
//       document.querySelectorAll('.card-container').forEach(cont => cont.innerHTML = "");
//       for (let i = 0; i < 2; i++) {
//         drawCard(false)
//         drawCard()
//       }
//       // if (userHand.length === 2 && userHand[0].rank === userHand[1].rank) {
//       //   splitButton.style.display = 'block'
//       // }
//       dube.style.display = 'block'
//       dube.addEventListener("click", () => {
//         dube.innerHTML = ['Double', 'Undouble'][dube.innerHTML === 'Double' | 0]
//         playerBet = playerBet * (dube.innerHTML === 'Double' ? 0.5 : 2)
//         betInfo.innerHTML = `Bet: $${playerBet}`
//       })
//     }
  
//     function userPlay() {
//       dube.style.display = 'none'
//       playerTurnButtons.style.display = 'block'
//       document.addEventListener("click", e => {
//         if (e.target.id === 'hit-btn') {
//           drawCard()
//           if (calculateTotal(userHand) > 21) {
//             dialog.innerHTML = "You busted. "
//             dealerPlay()
//           }
//         }
//         else if (e.target.id === 'stay-btn') {
//           dealerPlay()
//         }
//       })
//     }
  
//     function dealerPlay() {
//       const player = document.querySelector("div[name='house']")
//       const cardContainer = player.querySelector(".card-container")
//       const scoreDisplay = player.querySelector("h2")
  
//       cardContainer.innerHTML = houseHand.map(card => renderCard(card))
//       scoreDisplay.innerHTML = `Dealer Score: ${calculateTotal(houseHand)}`
//       while (calculateTotal(houseHand) < 17) {
//         drawCard(false)
//       }
//       if (calculateTotal(houseHand) > 21) {
//         dialog.innerHTML = "The dealer busted. "
//       }
//       displayWinner()
//     }
  
//     function displayWinner() {
//       const userScore = calculateTotal(userHand)
//       const dealerScore = calculateTotal(houseHand)
//       if (userScore <= 21 && (dealerScore > 21 || userScore > dealerScore)) {
//         dialog.innerHTML += "You won!"
//         playerBalance += playerBet
//       }
//       else if (userScore <= 21 && userScore === dealerScore) {
//         dialog.innerHTML += "'Twas a push!"
//       }
//       else {
//         dialog.innerHTML += "You lost!"
//         playerBalance = Math.max(0, playerBalance - playerBet)
//       }
//       balanceInfo.innerHTML = `Balance: $${playerBalance.toLocaleString()}`
//       document.getElementById('new-game').style.display = 'block'
//     }
  
//     function sessionOver() {
//       if (playerBalance === 0) {
//         dialog.innerHTML = "You're all out of cash. Better luck next time!"
//         return
//       }
//     }
  
//     prelim()
//     userPlay()
//   }

//   form.addEventListener("submit", (e) => {
//     e.preventDefault()
//     if (e.target.querySelector("input[name='password']").value === 'password') {
//       form.style.display = 'none'
//       gameCenter.style.display = 'block'
//       document.getElementById('sound').play()
//       playGame()
//     }
//     else {
//       form.querySelector('p').innerHTML = "Invalid entry. Try again!"
//     }
//   })

//   newGame.addEventListener("click", () => {
//     form.style.display = 'none'
//     gameCenter.style.display = 'block'
//     playGame()
//   })

// })