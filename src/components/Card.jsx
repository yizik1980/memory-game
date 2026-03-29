import { flipCard } from '../signals/game'

function CountDots({ count, emoji }) {
  const cols = Math.ceil(Math.sqrt(count))
  const rows = Math.ceil(count / cols)
  const items = Array.from({ length: count })
  return (
    <div
      className="count-grid"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        '--dot-size': `${Math.round(80 / cols)}cqmin`,
      }}
    >
      {items.map((_, i) => (
        <span key={i} className="count-dot">{emoji}</span>
      ))}
    </div>
  )
}

function CardFront({ content }) {
  if (content.type === 'letter') {
    return (
      <div className="card-face card-front letter-card">
        <span className="card-letter">{content.letter}</span>
      </div>
    )
  }
  if (content.type === 'word') {
    return (
      <div className="card-face card-front word-card">
        <span className="card-emoji">{content.emoji}</span>
        <span className="card-word" dir="rtl">{content.word}</span>
      </div>
    )
  }
  if (content.type === 'number') {
    return (
      <div className="card-face card-front number-card">
        <span className="card-number">{content.number}</span>
      </div>
    )
  }
  if (content.type === 'count') {
    return (
      <div className="card-face card-front count-card">
        <CountDots count={content.count} emoji={content.emoji} />
      </div>
    )
  }
  return null
}

export default function Card({ card }) {
  const { isFlipped, isMatched, content } = card

  const handleClick = () => {
    if (!isFlipped && !isMatched) {
      flipCard(card.id)
    }
  }

  const className = [
    'memory-card',
    isFlipped || isMatched ? 'flipped' : '',
    isMatched ? 'matched' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className="card-container">
      <div className={className} onClick={handleClick} role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && handleClick()}
      >
        <div className="card-inner">
          <div className="card-face card-back">
            <span className="card-back-icon">🃏</span>
          </div>
          <CardFront content={content} />
        </div>
      </div>
    </div>
  )
}
