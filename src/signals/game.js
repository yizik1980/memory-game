import { signal, computed } from '@preact/signals-react'
import { socket } from '../socket'

// ─── State (driven by server) ───────────────────────────────────────────────
export const gamePhase         = signal('room')  // 'room'|'waiting'|'mode-select'|'playing'|'finished'|'disconnected'
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
export const isMyTurn      = computed(() => myPlayerIndex.value === currentPlayerIndex.value)

// ─── Socket listeners ──────────────────────────────────────────────────────
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

// ─── Actions ───────────────────────────────────────────────────────────────
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

export function flipCard(cardId) {
  socket.emit('flipCard', cardId)
}

export function playAgain() {
  socket.emit('playAgain')
}

export function leaveRoom() {
  socket.emit('leaveRoom')
  socket.disconnect()
  gamePhase.value      = 'room'
  roomId.value         = null
  myPlayerIndex.value  = null
  players.value        = []
  cards.value          = []
  roomError.value      = null
}
