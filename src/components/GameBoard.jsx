import { useSignals } from '@preact/signals-react/runtime'
import { cards } from '../signals/game'
import Card from './Card'
import ScoreBar from './ScoreBar'

export default function GameBoard() {
  useSignals()

  const count = cards.value.length
  // 20 cards → 5×4, 24 cards → 6×4, 36 cards → 6×6
  const cols  = count <= 20 ? 5 : 6
  const rows  = Math.ceil(count / cols)

  return (
    <div className="game-layout">
      <div className="board-wrapper">
        <div
          className="game-board"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows:    `repeat(${rows}, 1fr)`,
            aspectRatio:         `${cols} / ${rows}`,
          }}
        >
          {cards.value.map(card => (
            <Card key={card.id} card={card} />
          ))}
        </div>
      </div>
      <ScoreBar />
    </div>
  )
}
