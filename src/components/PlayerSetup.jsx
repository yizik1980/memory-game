import { useState, useEffect } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { setPlayers } from '../signals/game'
import { getSavedPlayers, savePlayersToStorage } from '../utils/localStorage'

const AVATARS = ['🦁','🐯','🐺','🦊','🐻','🐼','🐨','🦄','🐸','🦋','🐙','🦖','🤖','👾','🧙','👻','🦸','🎃','🐲','🌟']

const MAX_PLAYERS = 4
const MIN_PLAYERS = 2

function PlayerCard({ player, index, onChange, onRemove, canRemove }) {
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

  return (
    <div className="player-card">
      <div className="player-card-header">
        <span className="player-number">שחקן {index + 1}</span>
        {canRemove && (
          <button className="btn-icon remove-btn" onClick={onRemove} title="הסר שחקן">✕</button>
        )}
      </div>

      <button
        className="avatar-btn"
        onClick={() => setShowAvatarPicker(v => !v)}
        title="בחר אווטר"
      >
        <span className="avatar-display">{player.avatar}</span>
        <span className="avatar-hint">לחץ לשינוי</span>
      </button>

      {showAvatarPicker && (
        <div className="avatar-picker">
          {AVATARS.map(a => (
            <button
              key={a}
              className={`avatar-option ${player.avatar === a ? 'selected' : ''}`}
              onClick={() => { onChange({ ...player, avatar: a }); setShowAvatarPicker(false) }}
            >
              {a}
            </button>
          ))}
        </div>
      )}

      <input
        className="player-name-input"
        type="text"
        placeholder={`שם שחקן ${index + 1}`}
        value={player.name}
        maxLength={20}
        onChange={e => onChange({ ...player, name: e.target.value })}
        dir="rtl"
      />
    </div>
  )
}

export default function PlayerSetup() {
  useSignals()

  const savedNames = getSavedPlayers()
  const [playerList, setPlayerList] = useState([
    { name: '', avatar: AVATARS[0] },
    { name: '', avatar: AVATARS[1] },
  ])

  const updatePlayer = (index, updated) => {
    setPlayerList(prev => prev.map((p, i) => i === index ? updated : p))
  }

  const addPlayer = () => {
    if (playerList.length < MAX_PLAYERS) {
      setPlayerList(prev => [...prev, { name: '', avatar: AVATARS[prev.length % AVATARS.length] }])
    }
  }

  const removePlayer = index => {
    setPlayerList(prev => prev.filter((_, i) => i !== index))
  }

  const handleSavedNameClick = (name) => {
    const emptyIndex = playerList.findIndex(p => p.name.trim() === '')
    if (emptyIndex >= 0) {
      updatePlayer(emptyIndex, { ...playerList[emptyIndex], name })
    } else if (playerList.length < MAX_PLAYERS) {
      setPlayerList(prev => [...prev, { name, avatar: AVATARS[prev.length % AVATARS.length] }])
    }
  }

  const handleStart = () => {
    const valid = playerList.filter(p => p.name.trim())
    if (valid.length < MIN_PLAYERS) return
    savePlayersToStorage(valid.map(p => p.name.trim()))
    setPlayers(valid.map(p => ({ ...p, name: p.name.trim() })))
  }

  const validCount = playerList.filter(p => p.name.trim()).length
  const canStart = validCount >= MIN_PLAYERS

  return (
    <div className="screen setup-screen" dir="rtl">
      <div className="setup-container">
        <h1 className="game-title">🃏 משחק זיכרון</h1>
        <p className="setup-subtitle">הכניסו את שמות השחקנים ובחרו אווטר</p>

        {savedNames.length > 0 && (
          <div className="saved-players-section">
            <h3 className="saved-title">שחקנים קודמים:</h3>
            <div className="saved-names">
              {savedNames.map(name => (
                <button
                  key={name}
                  className="saved-name-chip"
                  onClick={() => handleSavedNameClick(name)}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="players-grid">
          {playerList.map((player, index) => (
            <PlayerCard
              key={index}
              player={player}
              index={index}
              onChange={updated => updatePlayer(index, updated)}
              onRemove={() => removePlayer(index)}
              canRemove={playerList.length > MIN_PLAYERS}
            />
          ))}
        </div>

        <div className="setup-actions">
          {playerList.length < MAX_PLAYERS && (
            <button className="btn btn-secondary" onClick={addPlayer}>
              + הוסף שחקן
            </button>
          )}
          <button
            className={`btn btn-primary ${!canStart ? 'disabled' : ''}`}
            onClick={handleStart}
            disabled={!canStart}
          >
            המשך לבחירת מצב משחק ▶
          </button>
        </div>

        {!canStart && (
          <p className="warning-text">נדרשים לפחות {MIN_PLAYERS} שחקנים עם שמות</p>
        )}
      </div>
    </div>
  )
}
