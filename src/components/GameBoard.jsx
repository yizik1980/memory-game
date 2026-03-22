import { useSignals } from '@preact/signals-react/runtime'
import { cards } from '../signals/game'
import Card from './Card'
import ScoreBar from './ScoreBar'

export default function GameBoard() {
  useSignals()

  return (
    <div className="game-layout">
      <div className="board-wrapper">
        <div className="game-board">
          {cards.value.map(card => (
            <Card key={card.id} card={card} />
          ))}
        </div>
      </div>
      <ScoreBar />
    </div>
  )
}
