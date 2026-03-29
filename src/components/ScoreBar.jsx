import { useSignals } from '@preact/signals-react/runtime'
import { players, currentPlayerIndex, cards, gameMode, gameType, myPlayerIndex, isMyTurn, backToModeSelect, leaveRoom } from '../signals/game'

export default function ScoreBar() {
  useSignals()

  const matched  = cards.value.filter(c => c.isMatched).length / 2
  const total    = cards.value.length / 2
  const progress = total > 0 ? (matched / total) * 100 : 0
  const current  = players.value[currentPlayerIndex.value]
  const isLocal  = gameType.value === 'local'

  return (
    <aside className="side-panel" dir="rtl">

      <div className="side-mode-label">
        {gameMode.value === 'hebrew' ? '🔤 אותיות עבריות' : '🔢 מספרים וכמויות'}
      </div>

      <div className="side-turn">
        <span className="side-turn-avatar">{current?.avatar}</span>
        <div className="side-turn-text">
          <span className="side-turn-hint">התור של</span>
          <strong className="side-turn-name">{current?.name}</strong>
          {!isLocal && isMyTurn.value && <span className="your-turn-badge">— זה אתה!</span>}
        </div>
      </div>

      <div className="side-progress-wrap">
        <div className="side-progress-labels">
          <span>התקדמות</span>
          <span>{matched}/{total} זוגות</span>
        </div>
        <div className="side-progress-bar">
          <div className="side-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="side-scores">
        <h3 className="side-scores-title">ניקוד</h3>
        {players.value.map((player, index) => (
          <div
            key={index}
            className={`side-player-card ${index === currentPlayerIndex.value ? 'active-player' : ''}`}
          >
            <span className="ps-avatar">{player.avatar}</span>
            <span className="ps-name">
              {player.name}
              {!isLocal && index === myPlayerIndex.value && <span className="you-label"> (אתה)</span>}
            </span>
            <span className="ps-score">{player.score}</span>
          </div>
        ))}
      </div>

      <button className="btn btn-back side-back-btn"
        onClick={isLocal ? backToModeSelect : leaveRoom}
      >
        {isLocal ? '↩ חזור למצבי משחק' : '🚪 עזוב משחק'}
      </button>

    </aside>
  )
}
