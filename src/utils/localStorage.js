const PLAYERS_KEY = 'memory-game-saved-players'

export function getSavedPlayers() {
  try {
    const data = localStorage.getItem(PLAYERS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function savePlayersToStorage(names) {
  try {
    const existing = getSavedPlayers()
    const merged = [...new Set([...names, ...existing])].slice(0, 15)
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(merged))
  } catch {
    // ignore storage errors
  }
}
