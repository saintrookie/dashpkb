export function formatNumberID(n) {
  return Math.round(n).toLocaleString('id-ID')
}

export function formatRupiahFull(n) {
  return `Rp ${formatNumberID(n)}`
}

export function formatRupiahCompact(n, decimals = 1) {
  const miliar = n / 1_000_000_000
  return `${miliar.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} M`
}

export function formatRupiahJuta(n, decimals = 1) {
  const juta = n / 1_000_000
  return `${juta.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} jt`
}

export function formatRupiahAuto(n, decimals = 2) {
  if (n >= 1_000_000_000) return `Rp ${formatRupiahCompact(n, decimals)}`
  return `Rp ${formatRupiahJuta(n, 1)}`
}

export function formatPercent(n, decimals = 1) {
  return `${n.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`
}

export function formatSignedPercent(n, decimals = 2) {
  const sign = n >= 0 ? '+' : '-'
  return `${sign}${Math.abs(n).toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`
}

export function formatDateLongID(isoDate) {
  return new Date(isoDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  })
}

export function formatDateTimeID(isoDate) {
  const date = new Date(isoDate)
  const datePart = date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  })
  const timePart = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  })
  return `${datePart}, ${timePart}`
}
