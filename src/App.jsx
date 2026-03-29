import { useSignals } from '@preact/signals-react/runtime'
import { gamePhase, leaveRoom } from './signals/game'
import GameTypeSelect from './components/GameTypeSelect'
import PlayerSetup from './components/PlayerSetup'
import RoomSetup from './components/RoomSetup'
import GameModeSelect from './components/GameModeSelect'
import GameBoard from './components/GameBoard'
import GameOver from './components/GameOver'

export default function App() {
  useSignals()

  const phase = gamePhase.value

  if (phase === 'disconnected') {
    return (
      <div className="screen setup-screen" dir="rtl">
        <div className="setup-container">
          <h1 className="game-title">🃏 משחק זיכרון</h1>
          <div className="waiting-box">
            <p style={{ fontSize: '3rem' }}>😔</p>
            <p className="waiting-label">השחקן השני התנתק</p>
          </div>
          <button className="btn btn-primary" onClick={leaveRoom}>חזור למסך הראשי</button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {phase === 'start'                      && <GameTypeSelect />}
      {phase === 'setup'                      && <PlayerSetup />}
      {(phase === 'room' || phase === 'waiting') && <RoomSetup />}
      {phase === 'mode-select'                && <GameModeSelect />}
      {phase === 'playing'                    && <GameBoard />}
      {phase === 'finished'                   && <GameOver />}
    </div>
  )
}
