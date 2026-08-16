export default function WrappedTick({ x, y, payload, fontSize = 10, fill = '#334155' }) {
  const words = String(payload.value).split(' ')
  const lines = []
  let current = ''
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word
    if (next.length > 11 && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  })
  if (current) lines.push(current)

  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, i) => (
        <text
          key={line}
          x={0}
          y={0}
          dy={12 + i * 12}
          textAnchor="middle"
          fontSize={fontSize}
          fill={fill}
        >
          {line}
        </text>
      ))}
    </g>
  )
}
