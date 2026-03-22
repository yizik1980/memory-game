// Each pair: number card ↔ quantity card (N items)
// Using different emojis per range for visual variety
const EMOJIS = ['⭐', '🍎', '🔵', '🌸', '🎯', '🏆', '💎', '🔥']

export const numberPairs = Array.from({ length: 18 }, (_, i) => {
  const number = i + 1
  const emojiIndex = Math.floor(i / 4) % EMOJIS.length
  return {
    id: i,
    number,
    emoji: EMOJIS[emojiIndex],
  }
})
