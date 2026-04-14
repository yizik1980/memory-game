import { useSignals } from '@preact/signals-react/runtime'
import { players, gameType, myPlayerIndex, initGame, selectMode, resetToSetup, leaveRoom } from '../signals/game'

export default function GameModeSelect() {
  useSignals()

  const isLocal   = gameType.value === 'local'
  const isCreator = isLocal || myPlayerIndex.value === 0

  const handleMode = mode => isLocal ? initGame(mode) : selectMode(mode)
  const handleBack = () => isLocal ? resetToSetup() : leaveRoom()

  return (
    <div className="screen mode-screen" dir="rtl">
      <div className="mode-container">
        <h2 className="mode-title">בחרו מצב משחק</h2>

        <div className="players-summary">
          {players.value.map((p, i) => (
            <span key={i} className="player-chip">
              {p.avatar} {p.name}
              {!isLocal && i === myPlayerIndex.value && ' (אתה)'}
            </span>
          ))}
        </div>

        {isCreator ? (
          <div className="mode-cards">

            {<button className="mode-card hebrew-mode" onClick={() => handleMode('hebrew')}>
              <span className="mode-icon">א</span>
              <h3 className="mode-name">אותיות עבריות</h3>
              <p className="mode-desc">התאימו אות עברית<br />לדבר שמתחיל באותה אות</p>
              <div className="mode-examples">
                <span className="example-pair">א ← ארי 🦁</span>
                <span className="example-pair">ש ← שועל 🦊</span>
              </div>
              <span className="mode-badge">18 זוגות</span>
            </button> }

            <button className="mode-card animals-mode" onClick={() => handleMode('animals')}>
              <span className="mode-icon">🐾</span>
              <h3 className="mode-name">חיות א–ל</h3>
              <p className="mode-desc">התאימו אות עברית<br />לחיה שמתחילה באותה אות</p>
              <div className="mode-examples">
                <span className="example-pair">א ← ארנב 🐰</span>
                <span className="example-pair">כ ← כריש 🦈</span>
              </div>
              <span className="mode-badge">12 זוגות</span>
            </button>

            { <button className="mode-card numbers-mode" onClick={() => handleMode('numbers')}>
              <span className="mode-icon">123</span>
              <h3 className="mode-name">מספרים וכמויות</h3>
              <p className="mode-desc">התאימו מספר<br />לכמות הפריטים המתאימה</p>
              <div className="mode-examples">
                <span className="example-pair">3 ← ⭐⭐⭐</span>
                <span className="example-pair">7 ← 🍎×7</span>
              </div>
              <span className="mode-badge">18 זוגות</span>
            </button> }

            <button className="mode-card counting-mode" onClick={() => handleMode('counting')}>
              <span className="mode-icon">🐾</span>
              <h3 className="mode-name">ספור חיות</h3>
              <p className="mode-desc">התאימו מספר<br />לכמות החיות המתאימה</p>
              <div className="mode-examples">
                <span className="example-pair">3 ← 🦒🦒🦒</span>
                <span className="example-pair">5 ← 🦊×5</span>
              </div>
              <span className="mode-badge">1–12 · לגן</span>
            </button>

          </div>
        ) : (
          <div className="waiting-box" style={{ margin: '2rem 0' }}>
            <p className="waiting-spinner">⏳ ממתין לשחקן הראשון לבחור מצב משחק...</p>
          </div>
        )}

        <button className="btn btn-back" onClick={handleBack}>
          ← {isLocal ? 'חזור להגדרת שחקנים' : 'עזוב חדר'}
        </button>
      </div>
    </div>
  )
}
