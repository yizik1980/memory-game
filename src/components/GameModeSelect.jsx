import { useSignals } from '@preact/signals-react/runtime'
import { players, initGame, resetToSetup } from '../signals/game'

export default function GameModeSelect() {
  useSignals()

  return (
    <div className="screen mode-screen" dir="rtl">
      <div className="mode-container">
        <h2 className="mode-title">בחרו מצב משחק</h2>

        <div className="players-summary">
          {players.value.map((p, i) => (
            <span key={i} className="player-chip">
              {p.avatar} {p.name}
            </span>
          ))}
        </div>

        <div className="mode-cards">
          <button className="mode-card hebrew-mode" onClick={() => initGame('hebrew')}>
            <span className="mode-icon">א</span>
            <h3 className="mode-name">אותיות עבריות</h3>
            <p className="mode-desc">
              התאימו אות עברית<br />לדבר שמתחיל באותה אות
            </p>
            <div className="mode-examples">
              <span className="example-pair">א ← ארי 🦁</span>
              <span className="example-pair">כ ← כלב 🐕</span>
            </div>
            <span className="mode-badge">32 זוגות</span>
          </button>

          <button className="mode-card numbers-mode" onClick={() => initGame('numbers')}>
            <span className="mode-icon">123</span>
            <h3 className="mode-name">מספרים וכמויות</h3>
            <p className="mode-desc">
              התאימו מספר<br />לכמות הפריטים המתאימה
            </p>
            <div className="mode-examples">
              <span className="example-pair">3 ← ⭐⭐⭐</span>
              <span className="example-pair">7 ← 🍎×7</span>
            </div>
            <span className="mode-badge">32 זוגות</span>
          </button>
        </div>

        <button className="btn btn-back" onClick={resetToSetup}>
          ← חזור להגדרת שחקנים
        </button>
      </div>
    </div>
  )
}
