import { signal, computed } from '@preact/signals-react'
import { socket } from '../socket'
import { shuffle } from '../utils/shuffle'
import { hebrewPairs } from '../data/hebrewData'
import { numberPairs } from '../data/numbersData'

// ─── State ─────────────────────────────────────────────────────────────────
export const gameType          = signal(null)   // 'local' | 'online'
export const gamePhase         = signal('start') // 'start'|'setup'|'room'|'waiting'|'mode-select'|'playing'|'finished'|'disconnected'
export const gameMode          = signal(null)
export const players           = signal([])
export const currentPlayerIndex = signal(0)
export const cards             = signal([])
export const flippedCardIds    = signal([])
export const isLocked          = signal(false)
export const roomId            = signal(null)
export const myPlayerIndex     = signal(null)
export const roomError         = signal(null)

// ─── Derived ───────────────────────────────────────────────────────────────
export const currentPlayer = computed(() => players.value[currentPlayerIndex.value] ?? null)
export const isMyTurn      = computed(() =>
  gameType.value === 'local' || myPlayerIndex.value === currentPlayerIndex.value
)

// ─── Socket listeners (online only) ────────────────────────────────────────
socket.on('gameStateUpdate', state => {
  gamePhase.value          = state.phase
  gameMode.value           = state.gameMode
  players.value            = state.players
  currentPlayerIndex.value = state.currentPlayerIndex
  cards.value              = state.cards
  flippedCardIds.value     = state.flippedCardIds
  isLocked.value           = state.isLocked
  roomId.value             = state.roomId
  myPlayerIndex.value      = state.myPlayerIndex
  roomError.value          = null
})
socket.on('roomError', msg => { roomError.value = msg })
socket.on('playerDisconnected', () => { gamePhase.value = 'disconnected' })

// ─── Deck builders ─────────────────────────────────────────────────────────
function buildHebrewDeck() {
  return hebrewPairs.flatMap(pair => [
    { id: `key-${pair.id}`, pairId: pair.id, cardType: 'key',   content: { type: 'letter', letter: pair.letter },             isFlipped: false, isMatched: false },
    { id: `val-${pair.id}`, pairId: pair.id, cardType: 'value', content: { type: 'word', word: pair.word, emoji: pair.emoji }, isFlipped: false, isMatched: false },
  ])
}
function buildNumberDeck() {
  return numberPairs.flatMap(pair => [
    { id: `key-${pair.id}`, pairId: pair.id, cardType: 'key',   content: { type: 'number', number: pair.number },                      isFlipped: false, isMatched: false },
    { id: `val-${pair.id}`, pairId: pair.id, cardType: 'value', content: { type: 'count', count: pair.number, emoji: pair.emoji }, isFlipped: false, isMatched: false },
  ])
}

// ─── Game type selection ────────────────────────────────────────────────────
export function chooseLocal() {
  gameType.value  = 'local'
  gamePhase.value = 'setup'
}
export function chooseOnline() {
  gameType.value  = 'online'
  gamePhase.value = 'room'
}

// ─── Local actions ─────────────────────────────────────────────────────────
export function setPlayers(playerList) {
  players.value   = playerList.map(p => ({ ...p, score: 0 }))
  gamePhase.value = 'mode-select'
}

export function initGame(mode) {
  gameMode.value           = mode
  cards.value              = shuffle(mode === 'hebrew' ? buildHebrewDeck() : buildNumberDeck())
  flippedCardIds.value     = []
  isLocked.value           = false
  currentPlayerIndex.value = 0
  players.value            = players.value.map(p => ({ ...p, score: 0 }))
  gamePhase.value          = 'playing'
}

export function resetToSetup() {
  gamePhase.value          = 'setup'
  gameMode.value           = null
  cards.value              = []
  flippedCardIds.value     = []
  isLocked.value           = false
  currentPlayerIndex.value = 0
}

export function backToModeSelect() {
  gamePhase.value      = 'mode-select'
  cards.value          = []
  flippedCardIds.value = []
  isLocked.value       = false
  players.value        = players.value.map(p => ({ ...p, score: 0 }))
}

function _checkMatch([id1, id2]) {
  const c1 = cards.value.find(c => c.id === id1)
  const c2 = cards.value.find(c => c.id === id2)
  const matched = c1.pairId === c2.pairId && c1.cardType !== c2.cardType

  setTimeout(() => {
    if (matched) {
      cards.value = cards.value.map(c =>
        c.id === id1 || c.id === id2 ? { ...c, isMatched: true } : c
      )
      const idx = currentPlayerIndex.value
      players.value = players.value.map((p, i) =>
        i === idx ? { ...p, score: p.score + 1 } : p
      )
    } else {
      cards.value = cards.value.map(c =>
        c.id === id1 || c.id === id2 ? { ...c, isFlipped: false } : c
      )
      currentPlayerIndex.value = (currentPlayerIndex.value + 1) % players.value.length
    }
    flippedCardIds.value = []
    isLocked.value       = false
    if (cards.value.every(c => c.isMatched)) gamePhase.value = 'finished'
  }, 1000)
}

// ─── flipCard — branches on game type ──────────────────────────────────────
export function flipCard(cardId) {
  if (gameType.value === 'online') {
    socket.emit('flipCard', cardId)
    return
  }
  if (isLocked.value) return
  const card = cards.value.find(c => c.id === cardId)
  if (!card || card.isFlipped || card.isMatched) return
  const flipped = flippedCardIds.value
  if (flipped.length >= 2 || flipped.includes(cardId)) return

  cards.value = cards.value.map(c => c.id === cardId ? { ...c, isFlipped: true } : c)
  const newFlipped = [...flipped, cardId]
  flippedCardIds.value = newFlipped
  if (newFlipped.length === 2) { isLocked.value = true; _checkMatch(newFlipped) }
}

// ─── Online actions ─────────────────────────────────────────────────────────
export function createRoom(name, avatar) {
  roomError.value = null
  socket.connect()
  socket.emit('createRoom', { name, avatar })
}
export function joinRoom(id, name, avatar) {
  roomError.value = null
  socket.connect()
  socket.emit('joinRoom', { roomId: id, name, avatar })
}
export function selectMode(mode) {
  socket.emit('selectMode', mode)
}
export function playAgain() {
  socket.emit('playAgain')
}
export function leaveRoom() {
  socket.emit('leaveRoom')
  socket.disconnect()
  gameType.value       = null
  gamePhase.value      = 'start'
  roomId.value         = null
  myPlayerIndex.value  = null
  players.value        = []
  cards.value          = []
  roomError.value      = null
}
