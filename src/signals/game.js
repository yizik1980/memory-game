import { signal, computed } from '@preact/signals-react'
import { shuffle } from '../utils/shuffle'
import { hebrewPairs } from '../data/hebrewData'
import { numberPairs } from '../data/numbersData'

// ─── Core state ────────────────────────────────────────────────────────────
export const gamePhase = signal('setup')       // 'setup' | 'mode-select' | 'playing' | 'finished'
export const gameMode  = signal(null)          // 'hebrew' | 'numbers'
export const players   = signal([])            // [{ name, avatar, score }]
export const currentPlayerIndex = signal(0)
export const cards     = signal([])            // CardObject[]
export const flippedCardIds = signal([])       // up to 2 card ids
export const isLocked  = signal(false)         // block clicks during check delay

// ─── Derived ───────────────────────────────────────────────────────────────
export const currentPlayer = computed(() =>
  players.value[currentPlayerIndex.value] ?? null
)
export const isGameComplete = computed(() => {
  const c = cards.value
  return c.length > 0 && c.every(card => card.isMatched)
})

// ─── Helpers to build card decks ───────────────────────────────────────────
function buildHebrewDeck() {
  return hebrewPairs.flatMap(pair => [
    {
      id: `key-${pair.id}`,
      pairId: pair.id,
      cardType: 'key',
      content: { type: 'letter', letter: pair.letter },
      isFlipped: false,
      isMatched: false,
    },
    {
      id: `val-${pair.id}`,
      pairId: pair.id,
      cardType: 'value',
      content: { type: 'word', word: pair.word, emoji: pair.emoji },
      isFlipped: false,
      isMatched: false,
    },
  ])
}

function buildNumberDeck() {
  return numberPairs.flatMap(pair => [
    {
      id: `key-${pair.id}`,
      pairId: pair.id,
      cardType: 'key',
      content: { type: 'number', number: pair.number },
      isFlipped: false,
      isMatched: false,
    },
    {
      id: `val-${pair.id}`,
      pairId: pair.id,
      cardType: 'value',
      content: { type: 'count', count: pair.number, emoji: pair.emoji },
      isFlipped: false,
      isMatched: false,
    },
  ])
}

// ─── Actions ───────────────────────────────────────────────────────────────
export function setPlayers(playerList) {
  players.value = playerList.map(p => ({ ...p, score: 0 }))
  gamePhase.value = 'mode-select'
}

export function initGame(mode) {
  gameMode.value = mode
  const deck = mode === 'hebrew' ? buildHebrewDeck() : buildNumberDeck()
  cards.value = shuffle(deck)
  flippedCardIds.value = []
  isLocked.value = false
  currentPlayerIndex.value = 0
  players.value = players.value.map(p => ({ ...p, score: 0 }))
  gamePhase.value = 'playing'
}

export function flipCard(cardId) {
  if (isLocked.value) return

  const card = cards.value.find(c => c.id === cardId)
  if (!card || card.isFlipped || card.isMatched) return

  const flipped = flippedCardIds.value
  if (flipped.length >= 2 || flipped.includes(cardId)) return

  // Flip it
  cards.value = cards.value.map(c =>
    c.id === cardId ? { ...c, isFlipped: true } : c
  )

  const newFlipped = [...flipped, cardId]
  flippedCardIds.value = newFlipped

  if (newFlipped.length === 2) {
    isLocked.value = true
    _checkMatch(newFlipped)
  }
}

function _checkMatch([id1, id2]) {
  const card1 = cards.value.find(c => c.id === id1)
  const card2 = cards.value.find(c => c.id === id2)
  const matched =
    card1.pairId === card2.pairId &&
    card1.cardType !== card2.cardType

  setTimeout(() => {
    if (matched) {
      cards.value = cards.value.map(c =>
        c.id === id1 || c.id === id2 ? { ...c, isMatched: true } : c
      )
      const idx = currentPlayerIndex.value
      players.value = players.value.map((p, i) =>
        i === idx ? { ...p, score: p.score + 1 } : p
      )
      // Correct match → same player goes again
    } else {
      cards.value = cards.value.map(c =>
        c.id === id1 || c.id === id2 ? { ...c, isFlipped: false } : c
      )
      // Wrong match → next player
      currentPlayerIndex.value =
        (currentPlayerIndex.value + 1) % players.value.length
    }

    flippedCardIds.value = []
    isLocked.value = false

    if (cards.value.every(c => c.isMatched)) {
      gamePhase.value = 'finished'
    }
  }, 1000)
}

export function resetToSetup() {
  gamePhase.value = 'setup'
  gameMode.value = null
  cards.value = []
  flippedCardIds.value = []
  isLocked.value = false
  currentPlayerIndex.value = 0
}

export function backToModeSelect() {
  gamePhase.value = 'mode-select'
  cards.value = []
  flippedCardIds.value = []
  isLocked.value = false
  players.value = players.value.map(p => ({ ...p, score: 0 }))
}
