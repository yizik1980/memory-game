let ctx = null

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

export function playFlip() {
  try {
    const c = getCtx()
    const osc  = c.createOscillator()
    const gain = c.createGain()
    osc.connect(gain)
    gain.connect(c.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(520, c.currentTime)
    osc.frequency.exponentialRampToValueAtTime(280, c.currentTime + 0.09)
    gain.gain.setValueAtTime(0.18, c.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.09)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + 0.09)
  } catch (_) {}
}

export function playMatch() {
  try {
    const c     = getCtx()
    const notes = [523.25, 659.25, 783.99] // C5 – E5 – G5
    notes.forEach((freq, i) => {
      const osc  = c.createOscillator()
      const gain = c.createGain()
      osc.connect(gain)
      gain.connect(c.destination)
      osc.type = 'sine'
      const t = c.currentTime + i * 0.14
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.001, t)
      gain.gain.linearRampToValueAtTime(0.22, t + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32)
      osc.start(t)
      osc.stop(t + 0.32)
    })
  } catch (_) {}
}
