import { useSignals } from '@preact/signals-react/runtime'
import { gamePhase } from './signals/game'
import PlayerSetup from './components/PlayerSetup'
import GameModeSelect from './components/GameModeSelect'
import GameBoard from './components/GameBoard'
import GameOver from './components/GameOver'

export default function App() {
  useSignals()

  const phase = gamePhase.value

  return (
    <div className="app">
      {phase === 'setup'       && <PlayerSetup />}
      {phase === 'mode-select' && <GameModeSelect />}
      {phase === 'playing'     && <GameBoard />}
      {phase === 'finished'    && <GameOver />}
    </div>
  )
}
