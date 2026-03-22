import { useSignals } from '@preact/signals-react/runtime'
import { players, gameMode, resetToSetup, initGame } from '../signals/game'

function Podium({ sorted }) {
  const medals = ['🥇', '🥈', '🥉']
  return (
    <div className="podium" dir="rtl">
      {sorted.map((player, i) => (
        <div key={i} className={`podium-slot rank-${i + 1}`}>
          <span className="podium-medal">{medals[i] ?? `#${i + 1}`}</span>
          <span className="podium-avatar">{player.avatar}</span>
          <span className="podium-name">{player.name}</span>
          <span className="podium-score">{player.score} נקודות</span>
        </div>
      ))}
    </div>
  )
}

export default function GameOver() {
  useSignals()

  const sorted = [...players.value].sort((a, b) => b.score - a.score)
  const winner = sorted[0]
  const isTie = sorted.length > 1 && sorted[0].score === sorted[1].score

  const handlePlayAgain = () => {
    initGame(gameMode.value)
  }

  return (
    <div className="screen gameover-screen" dir="rtl">
      <div className="gameover-container">
        <div className="gameover-header">
          <span className="gameover-confetti">🎉</span>
          <h2 className="gameover-title">המשחק נגמר!</h2>
          <span className="gameover-confetti">🎊</span>
        </div>

        {isTie ? (
          <p className="winner-text">תיקו! כל המנצחים! 🤝</p>
        ) : (
          <p className="winner-text">
            {winner.avatar} <strong>{winner.name}</strong> ניצח עם {winner.score} נקודות! 🏆
          </p>
        )}

        <Podium sorted={sorted} />

        <div className="gameover-actions">
          <button className="btn btn-primary" onClick={handlePlayAgain}>
            🔄 שחק שוב (אותו מצב)
          </button>
          <button className="btn btn-secondary" onClick={() => { players.value = players.value; resetToSetup() }}>
            🏠 מסך ראשי
          </button>
        </div>
      </div>
    </div>
  )
}
