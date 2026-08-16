function truncate(label, maxChars) {
  return label.length > maxChars ? `${label.slice(0, maxChars - 1)}…` : label
}

export default function CategoryTick({ x, y, payload, fontSize = 11, fill = '#334155', maxChars = 20 }) {
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fontSize={fontSize} fill={fill}>
      {truncate(String(payload.value), maxChars)}
    </text>
  )
}
