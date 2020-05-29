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

const SUITS = ["Hearts", "Spades", "Clubs", "Diamonds"]
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "K", "J", "Q", "A"]

function generateDeck(n = 1){
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

function calculateTotal(hand) {
  let total = 0
  const elevens = []
  for (let i = 0; i < hand.length; i++) {
    total += hand[i].value
    if (hand[i].value === 11) {
      elevens.push(i)
    }
  }
  if (total > 21) {
    const elevenToOneCount = Math.ceil((total - 21) / 10)
    for (const index of elevens.slice(0, elevenToOneCount)) {
      hand[index].value = 1
      total -= 10
    }
  }
  return total
};

function renderCard(card = null) {
  return `<img src='./card-images/${card ? `${card.rank}${card.suit[0]}.png` : 'Back.jpg'}'>`
}

function playGame() {
  let playerBet = 0
  const houseHand = [];
  const userHand = [];
  const deck = generateDeck();
  const splitButton = document.getElementById('split-btn')
  const doubleButton = document.getElementById('double-btn')
  const betForm = document.getElementById('bet-form')
  const newGame = document.getElementById('new-game')
  const dialog = document.getElementById('dialog')
  const dube = document.querySelector('.card-container-dub')

  dialog.innerHTML = null
  for (const cont of document.getElementsByClassName('card-container')) {
    cont.innerHTML = null
  }
  for (const header of document.getElementsByClassName('h2')) {
    header.innerHTML = null
  }

  function drawCard(isUser = true) {
    const player = document.querySelector(`div[name='${isUser ? 'user' : 'house'}']`)
    const cardContainer = player.querySelector(".card-container")
    const scoreDisplay = player.querySelector("h2")

    const cardIndex = Math.floor(Math.random() * deck.length)
    const card = deck[cardIndex]
    const hand = isUser ? userHand : houseHand
    deck.splice(cardIndex, 1)
    hand.push(card)
  
    if (!isUser) {
      if (hand.length === 1) {
        cardContainer.innerHTML += renderCard()
      }
      else {
        cardContainer.innerHTML += renderCard(card)
        scoreDisplay.innerHTML = `Dealer Score: ${hand.length === 2 ? calculateTotal([card]) : calculateTotal(hand)}`;
      }
    }
    else {
      cardContainer.innerHTML += renderCard(card)
      scoreDisplay.innerHTML = `Your Score: ${calculateTotal(hand)}`;
    }

    return card
  }

  function renderChip(i) {
    return `<img name='chip' chip-id='${i}' src='./chip-images/chip-${i}.jpg'>`
  }

  function generateChipList() {
    const chipList = document.getElementById('chip-list')
    for (const num of [5, 10, 25, 50]) {
      chipList.innerHTML += renderChip(num)
    }
  }

  function prelim() {
    generateChipList()
    document.addEventListener('click', (e) => {
      if (e.target.name === 'chip') {
        const amount = parseInt(e.target.getAttribute('chip-id'))
        console.log(amount)
        playerBet += amount
        betForm.querySelector('h2').innerHTML = `Bet: $${playerBet}`
      }
      else if (e.target.name === 'reset') {
        playerBet = 0
        betForm.querySelector('h2').innerHTML = "Bet: $0"
      }
    })
    betForm.addEventListener("submit", (e) => {
      e.preventDefault()
      betForm.style.display = 'none'
      initialDraw()
    })
  }

  function initialDraw() {
    for (let i = 0; i < 2; i++) {
      setTimeout(() => {drawCard(false)}, 1000)
      setTimeout(() => {drawCard()}, 1000)
    }
    if (userHand.length === 2 && userHand[0].rank === userHand[1].rank) {
      splitButton.style.display = 'block'
    }
    dube.addEventListener("click", () => {
      dube.value = 'true'
      playerBet *= 2
      dialog.innerHTML = `Bet: $${playerBet}`
    })
  }

  function userPlay() {
    drawCard()
    document.addEventListener("click", e => {
      if (e.target.id === 'hit-btn') {
        drawCard()
        if (calculateTotal(userHand) > 21) {
          dialog.innerHTML = "You busted. "
        }
      }
      else if (e.target.id === 'stay-btn') {
      }
    })
    dealerPlay()
  }

  function dealerPlay() {
    const player = document.querySelector("div[name='house']")
    const cardContainer = player.querySelector(".card-container")
    const scoreDisplay = player.querySelector("h2")

    cardContainer.innerHTML = houseHand.map(card => renderCard(card))
    scoreDisplay.innerHTML = `Dealer Score: ${calculateTotal(houseHand)}`
    while (calculateTotal(houseHand) < 17) {
      drawCard(false)
    }
    if (calculateTotal(houseHand) > 21) {
      dialog.innerHTML = "The dealer busted. "
    }
    displayWinner()
  }

  function displayWinner() {
    const userScore = calculateTotal(userHand)
    const dealerScore = calculateTotal(houseHand)
    dialog.innerHTML += `Final scores... Dealer: ${dealerScore}, You: ${userScore}. `
    if (userScore <= 21 && (dealerScore > 21 || userScore > dealerScore)) {
      dialog.innerHTML += "You won!"
    }
    else if (userScore <= 21 && userScore === dealerScore) {
      dialog.innerHTML += "'Twas a push!"
    }
    else {
      dialog.innerHTML += "You lost!"
    }
    newGame.style.display = 'block'
  }

  prelim()
  // userPlay()
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('login-form')
  const gameCenter = document.getElementById('game-center')

  form.addEventListener("submit", (e) => {
    e.preventDefault()
    if (e.target.querySelector("input[name='password']").value === 'password') {
      form.style.display = 'none'
      gameCenter.style.display = 'block'
      document.getElementById('sound').play()
    }
    else {
      form.querySelector('p').innerHTML = "Invalid entry. Try again!"
    }
  })

  playGame()
})