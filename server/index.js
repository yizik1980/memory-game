import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { shuffle } from '../src/utils/shuffle.js'
import { hebrewPairs } from '../src/data/hebrewData.js'
import { numberPairs } from '../src/data/numbersData.js'
import { hebrewAnimalPairs } from '../src/data/hebrewAnimalsData.js'
import { numberAnimalPairs } from '../src/data/numberAnimalPairs.js'

const PORT        = process.env.PORT || 3001
const CLIENT_URL  = process.env.CLIENT_URL || '*'

const app        = express()
const httpServer = createServer(app)
const io         = new Server(httpServer, { cors: { origin: CLIENT_URL } })

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', CLIENT_URL)
  next()
})

const rooms = new Map()

function generateRoomId() {
  let id
  do { id = Math.random().toString(36).substring(2, 7).toUpperCase() } while (rooms.has(id))
  return id
}

function buildDeck(mode) {
  if (mode === 'numbers' || mode === 'counting') {
    const numPairs = mode === 'counting' ? numberAnimalPairs : numberPairs
    return shuffle(numPairs.flatMap(pair => [
      { id: `key-${pair.id}`, pairId: pair.id, cardType: 'key',   content: { type: 'number', number: pair.number },                      isFlipped: false, isMatched: false },
      { id: `val-${pair.id}`, pairId: pair.id, cardType: 'value', content: { type: 'count',  count: pair.number, emoji: pair.emoji }, isFlipped: false, isMatched: false },
    ]))
  }
  const pairs = mode === 'animals' ? hebrewAnimalPairs : hebrewPairs
  return shuffle(pairs.flatMap(pair => [
    { id: `key-${pair.id}`, pairId: pair.id, cardType: 'key',   content: { type: 'letter', letter: pair.letter },             isFlipped: false, isMatched: false },
    { id: `val-${pair.id}`, pairId: pair.id, cardType: 'value', content: { type: 'word', word: pair.word, emoji: pair.emoji }, isFlipped: false, isMatched: false },
  ]))
}

function broadcast(roomId) {
  const room = rooms.get(roomId)
  if (!room) return
  room.players.forEach((p, idx) => {
    io.to(p.socketId).emit('gameStateUpdate', {
      roomId,
      phase:               room.phase,
      players:             room.players.map(({ socketId: _s, ...rest }) => rest),
      cards:               room.cards,
      currentPlayerIndex:  room.currentPlayerIndex,
      flippedCardIds:      room.flippedCardIds,
      isLocked:            room.isLocked,
      gameMode:            room.gameMode,
      myPlayerIndex:       idx,
    })
  })
}

function closeRoom(socket) {
  const roomId = socket.roomId
  if (!roomId) return
  socket.to(roomId).emit('playerDisconnected')
  rooms.delete(roomId)
  socket.roomId = null
}

io.on('connection', socket => {
  socket.on('createRoom', ({ name, avatar }) => {
    const roomId = generateRoomId()
    rooms.set(roomId, {
      phase: 'waiting',
      players: [{ socketId: socket.id, name, avatar, score: 0 }],
      cards: [], currentPlayerIndex: 0,
      flippedCardIds: [], isLocked: false, gameMode: null,
    })
    socket.join(roomId)
    socket.roomId    = roomId
    socket.playerIndex = 0
    broadcast(roomId)
  })

  socket.on('joinRoom', ({ roomId, name, avatar }) => {
    const room = rooms.get(roomId)
    if (!room)                    return socket.emit('roomError', 'חדר לא נמצא')
    if (room.players.length >= 2) return socket.emit('roomError', 'החדר מלא')
    if (room.phase !== 'waiting') return socket.emit('roomError', 'המשחק כבר התחיל')

    room.players.push({ socketId: socket.id, name, avatar, score: 0 })
    room.phase = 'mode-select'
    socket.join(roomId)
    socket.roomId    = roomId
    socket.playerIndex = 1
    broadcast(roomId)
  })

  socket.on('selectMode', mode => {
    const room = rooms.get(socket.roomId)
    if (!room || socket.playerIndex !== 0 || room.phase !== 'mode-select') return
    Object.assign(room, {
      gameMode: mode, cards: buildDeck(mode),
      currentPlayerIndex: 0, flippedCardIds: [], isLocked: false, phase: 'playing',
      players: room.players.map(p => ({ ...p, score: 0 })),
    })
    broadcast(socket.roomId)
  })

  socket.on('flipCard', cardId => {
    const room = rooms.get(socket.roomId)
    if (!room || room.phase !== 'playing' || room.isLocked) return
    if (room.currentPlayerIndex !== socket.playerIndex) return

    const card = room.cards.find(c => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched) return

    const flipped = room.flippedCardIds
    if (flipped.length >= 2 || flipped.includes(cardId)) return

    room.cards = room.cards.map(c => c.id === cardId ? { ...c, isFlipped: true } : c)
    const newFlipped = [...flipped, cardId]
    room.flippedCardIds = newFlipped

    if (newFlipped.length < 2) return broadcast(socket.roomId)

    room.isLocked = true
    broadcast(socket.roomId)

    setTimeout(() => {
      const [id1, id2] = newFlipped
      const c1 = room.cards.find(c => c.id === id1)
      const c2 = room.cards.find(c => c.id === id2)
      const matched = c1 && c2 && c1.pairId === c2.pairId && c1.cardType !== c2.cardType

      if (matched) {
        room.cards = room.cards.map(c =>
          c.id === id1 || c.id === id2 ? { ...c, isMatched: true } : c
        )
        const idx = room.currentPlayerIndex
        room.players = room.players.map((p, i) => i === idx ? { ...p, score: p.score + 1 } : p)
      } else {
        room.cards = room.cards.map(c =>
          c.id === id1 || c.id === id2 ? { ...c, isFlipped: false } : c
        )
        room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length
      }

      room.flippedCardIds = []
      room.isLocked = false
      if (room.cards.every(c => c.isMatched)) room.phase = 'finished'
      broadcast(socket.roomId)
    }, 1000)
  })

  socket.on('playAgain', () => {
    const room = rooms.get(socket.roomId)
    if (!room || socket.playerIndex !== 0) return
    Object.assign(room, {
      phase: 'mode-select', cards: [],
      flippedCardIds: [], isLocked: false,
      players: room.players.map(p => ({ ...p, score: 0 })),
    })
    broadcast(socket.roomId)
  })

  socket.on('leaveRoom',   () => closeRoom(socket))
  socket.on('disconnect',  () => closeRoom(socket))
})

// Health check for Render
app.get('/health', (_req, res) => res.send('ok'))

app.get('/rooms', (_req, res) => {
  const available = []
  for (const [id, room] of rooms) {
    if (room.phase === 'waiting') {
      const creator = room.players[0]
      available.push({ roomId: id, name: creator.name, avatar: creator.avatar })
    }
  }
  res.json(available)
})

httpServer.listen(PORT, () => console.log(`🎮 Server running on port ${PORT}`))
