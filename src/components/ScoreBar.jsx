import { useSignals } from '@preact/signals-react/runtime'
import { players, currentPlayerIndex, cards, gameMode, backToModeSelect } from '../signals/game'

export default function ScoreBar() {
  useSignals()

  const matched = cards.value.filter(c => c.isMatched).length / 2
  const total = cards.value.length / 2
  const progress = total > 0 ? (matched / total) * 100 : 0

  return (
    <div className="score-bar" dir="rtl">
      <div className="score-bar-top">
        <div className="players-scores">
          {players.value.map((player, index) => (
            <div
              key={index}
              className={`player-score-card ${index === currentPlayerIndex.value ? 'active-player' : ''}`}
            >
              <span className="ps-avatar">{player.avatar}</span>
              <span className="ps-name">{player.name}</span>
              <span className="ps-score">{player.score} ✓</span>
            </div>
          ))}
        </div>

        <div className="game-info">
          <span className="mode-label">
            {gameMode.value === 'hebrew' ? 'אותיות עבריות 🔤' : 'מספרים וכמויות 🔢'}
          </span>
          <span className="pairs-label">{matched}/{total} זוגות</span>
          <button className="btn btn-sm btn-back" onClick={backToModeSelect}>↩ חזור</button>
        </div>
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="turn-indicator">
        <span className="turn-avatar">{players.value[currentPlayerIndex.value]?.avatar}</span>
        <span className="turn-text">
          תורו של <strong>{players.value[currentPlayerIndex.value]?.name}</strong>
        </span>
      </div>
    </div>
  )
}
