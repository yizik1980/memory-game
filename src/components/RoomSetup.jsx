import { useState, useEffect } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { gamePhase, roomId, roomError, createRoom, joinRoom, leaveRoom } from '../signals/game'
import { SERVER_URL } from '../config'

const AVATARS = ['🦁','🐯','🐺','🦊','🐻','🐼','🐨','🦄','🐸','🦋','🐙','🦖','🤖','👾','🧙','👻','🦸','🎃','🐲','🌟']

function useAvailableRooms(active) {
  const [rooms, setRooms]     = useState([])
  const [loading, setLoading] = useState(false)

  const fetchRooms = () => {
    if (!active) return
    setLoading(true)
    fetch(`${SERVER_URL}/rooms`)
      .then(r => r.json())
      .then(data => { setRooms(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    if (!active) return
    fetchRooms()
    const interval = setInterval(fetchRooms, 3000)
    return () => clearInterval(interval)
  }, [active])

  return { rooms, loading, refresh: fetchRooms }
}

export default function RoomSetup() {
  useSignals()

  const [name, setName]             = useState('')
  const [avatar, setAvatar]         = useState(AVATARS[0])
  const [showPicker, setShowPicker] = useState(false)
  const [mode, setMode]             = useState(null) // null | 'create' | 'join'
  const [manualCode, setManualCode] = useState('')

  const phase      = gamePhase.value
  const canProceed = name.trim().length > 0

  const { rooms, loading, refresh } = useAvailableRooms(mode === 'join')

  // ── Waiting screen ────────────────────────────────────────────────────────
  if (phase === 'waiting') {
    return (
      <div className="screen setup-screen" dir="rtl">
        <div className="setup-container">
          <h1 className="game-title">🃏 משחק זיכרון</h1>
          <div className="waiting-box">
            <p className="waiting-label">קוד החדר שלך</p>
            <div className="room-code">{roomId.value}</div>
            <p className="waiting-hint">שתף את הקוד עם השחקן השני ✉️</p>
            <p className="waiting-spinner">⏳ ממתין לשחקן שני...</p>
          </div>
          <button className="btn btn-back" onClick={leaveRoom}>← ביטול</button>
        </div>
      </div>
    )
  }

  // ── Name + avatar ─────────────────────────────────────────────────────────
  const nameSection = (
    <div className="player-card" style={{ maxWidth: 320, margin: '0 auto 1.5rem' }}>
      <button className="avatar-btn" onClick={() => setShowPicker(v => !v)}>
        <span className="avatar-display">{avatar}</span>
        <span className="avatar-hint">לחץ לשינוי</span>
      </button>
      {showPicker && (
        <div className="avatar-picker">
          {AVATARS.map(a => (
            <button key={a}
              className={`avatar-option ${avatar === a ? 'selected' : ''}`}
              onClick={() => { setAvatar(a); setShowPicker(false) }}
            >{a}</button>
          ))}
        </div>
      )}
      <input
        className="player-name-input"
        type="text"
        placeholder="השם שלך"
        value={name}
        maxLength={20}
        onChange={e => setName(e.target.value)}
        dir="rtl"
      />
    </div>
  )

  return (
    <div className="screen setup-screen" dir="rtl">
      <div className="setup-container">
        <h1 className="game-title">🃏 משחק זיכרון</h1>
        <p className="setup-subtitle">משחק מרובה שחקנים</p>

        {nameSection}

        {/* ── Main choice ── */}
        {!mode && (
          <div className="setup-actions">
            <button
              className={`btn btn-primary ${!canProceed ? 'disabled' : ''}`}
              disabled={!canProceed}
              onClick={() => setMode('create')}
            >+ צור חדר חדש</button>
            <button
              className={`btn btn-secondary ${!canProceed ? 'disabled' : ''}`}
              disabled={!canProceed}
              onClick={() => setMode('join')}
            >🔗 הצטרף לחדר</button>
          </div>
        )}

        {/* ── Create ── */}
        {mode === 'create' && (
          <div className="setup-actions">
            <button className="btn btn-primary" onClick={() => createRoom(name.trim(), avatar)}>
              צור חדר ▶
            </button>
            <button className="btn btn-back" onClick={() => setMode(null)}>← חזור</button>
          </div>
        )}

        {/* ── Join ── */}
        {mode === 'join' && (
          <>
            {/* Room list */}
            <div className="room-list">
              <div className="room-list-header">
                <span>חדרים פתוחים</span>
                <button className="btn-icon" onClick={refresh} title="רענן">↻</button>
              </div>

              {loading && rooms.length === 0 && (
                <p className="waiting-spinner">טוען...</p>
              )}

              {!loading && rooms.length === 0 && (
                <p className="waiting-hint">אין חדרים פתוחים כרגע</p>
              )}

              {rooms.map(room => (
                <button
                  key={room.roomId}
                  className="room-list-item"
                  onClick={() => joinRoom(room.roomId, name.trim(), avatar)}
                >
                  <span className="room-item-avatar">{room.avatar}</span>
                  <span className="room-item-name">{room.name}</span>
                  <span className="room-item-code">{room.roomId}</span>
                  <span className="room-item-join">הצטרף ▶</span>
                </button>
              ))}
            </div>

            {/* Manual code fallback */}
            <div className="room-manual">
              <p className="waiting-hint">או הקלד קוד ידנית:</p>
              <div className="setup-actions">
                <input
                  className="player-name-input"
                  style={{ textAlign: 'center', letterSpacing: '0.2em', textTransform: 'uppercase', maxWidth: 160 }}
                  type="text"
                  placeholder="קוד חדר"
                  value={manualCode}
                  maxLength={5}
                  onChange={e => setManualCode(e.target.value.toUpperCase())}
                />
                <button
                  className={`btn btn-primary ${!manualCode.trim() ? 'disabled' : ''}`}
                  disabled={!manualCode.trim()}
                  onClick={() => joinRoom(manualCode.trim(), name.trim(), avatar)}
                >הצטרף</button>
              </div>
            </div>

            <button className="btn btn-back" onClick={() => setMode(null)}>← חזור</button>
          </>
        )}

        {roomError.value && (
          <p className="warning-text" style={{ color: '#e74c3c' }}>⚠️ {roomError.value}</p>
        )}
      </div>
    </div>
  )
}
