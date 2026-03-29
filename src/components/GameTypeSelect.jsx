import { chooseLocal, chooseOnline } from '../signals/game'

export default function GameTypeSelect() {
  return (
    <div className="screen setup-screen" dir="rtl">
      <div className="setup-container">
        <h1 className="game-title">🃏 משחק זיכרון</h1>
        <p className="setup-subtitle">בחרו איך לשחק</p>

        <div className="mode-cards" style={{ maxWidth: 520, margin: '0 auto' }}>
          <button className="mode-card" onClick={chooseLocal}>
            <span className="mode-icon">🏠</span>
            <h3 className="mode-name">שחק מקומי</h3>
            <p className="mode-desc">
              שני שחקנים על<br />אותו מכשיר
            </p>
          </button>

          <button className="mode-card" onClick={chooseOnline}>
            <span className="mode-icon">🌐</span>
            <h3 className="mode-name">שחק אונליין</h3>
            <p className="mode-desc">
              שחקנים מדפדפנים<br />שונים בזמן אמת
            </p>
          </button>
        </div>
      </div>
    </div>
  )
}
