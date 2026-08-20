export default function WrappedTick({ x, y, payload, fontSize = 10, fill = '#334155', maxLines = 2 }) {
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

  // Longer labels can wrap past what the reserved axis height fits; cap the
  // rendered lines so the last one never runs off the bottom of the chart.
  const visibleLines =
    lines.length > maxLines ? [...lines.slice(0, maxLines - 1), `${lines[maxLines - 1]}…`] : lines

  return (
    <g transform={`translate(${x},${y})`}>
      {visibleLines.map((line, i) => (
        <text
          key={i}
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
