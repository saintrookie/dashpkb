// Shared deterministic PRNG + year-scaling trend, reused by every local mock
// dataset (kecamatan, kelurahan, kendaraan) so picking a different "Tahun
// Pajak" produces a coherent, reproducible story across the whole app:
// vehicle registrations grow year over year, collection rates improve.

export function seedFromString(str) {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return h >>> 0
}

export function mulberry32(seed) {
  let a = seed
  return function random() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seededRandom(key) {
  return mulberry32(seedFromString(key))
}

// Vehicle registrations trend upward as you move away from the baseline
// year in either direction (matches mockApi.js's OPD generator).
export function scaleCountForYear(baseCount, yearsFromBaseline, rand, minCount = 5) {
  const growthPerYear = 0.055 + rand() * 0.03
  const scale = (1 + growthPerYear) ** yearsFromBaseline
  return Math.max(minCount, Math.round(baseCount * scale))
}

export function shiftRateForYear(baseRate, yearsFromBaseline, rand, { min = 18, max = 99.5 } = {}) {
  const rateStepPerYear = 1.1 + rand() * 1.6
  const noise = (rand() - 0.5) * 3
  const value = baseRate + yearsFromBaseline * rateStepPerYear + noise
  return Math.round(Math.min(max, Math.max(min, value)) * 10) / 10
}
