const BASE = [
  {
    kecamatan: 'Gerunggang',
    jumlahKendaraan: 12542,
    collectionRate: 85.92,
    penerimaanPkb: 4_520_000_000,
    opsenPkb: 2_120_000_000,
    potensiBelumBayar: 1_120_000_000,
  },
  {
    kecamatan: 'Rangkui',
    jumlahKendaraan: 10321,
    collectionRate: 81.23,
    penerimaanPkb: 3_860_000_000,
    opsenPkb: 1_900_000_000,
    potensiBelumBayar: 890_450_000,
  },
  {
    kecamatan: 'Taman Sari',
    jumlahKendaraan: 8762,
    collectionRate: 78.73,
    penerimaanPkb: 3_240_000_000,
    opsenPkb: 1_600_000_000,
    potensiBelumBayar: 905_210_000,
  },
  {
    kecamatan: 'Bukit Intan',
    jumlahKendaraan: 7654,
    collectionRate: 76.84,
    penerimaanPkb: 2_880_000_000,
    opsenPkb: 1_500_000_000,
    potensiBelumBayar: 960_330_000,
  },
  {
    kecamatan: 'Gabek',
    jumlahKendaraan: 5200,
    collectionRate: 73.5,
    penerimaanPkb: 1_520_000_000,
    opsenPkb: 760_000_000,
    potensiBelumBayar: 420_000_000,
  },
  {
    kecamatan: 'Girimaya',
    jumlahKendaraan: 4200,
    collectionRate: 68.9,
    penerimaanPkb: 1_220_000_000,
    opsenPkb: 610_000_000,
    potensiBelumBayar: 300_000_000,
  },
  {
    kecamatan: 'Pangkal Balam',
    jumlahKendaraan: 3464,
    collectionRate: 58.3,
    penerimaanPkb: 1_010_000_000,
    opsenPkb: 505_000_000,
    potensiBelumBayar: 224_000_000,
  },
]

const SWDKLLJ_PER_VEHICLE = 35_000

export const kecamatanList = BASE.map((row, index) => {
  const sudahBayar = Math.round((row.jumlahKendaraan * row.collectionRate) / 100)
  const belumBayar = row.jumlahKendaraan - sudahBayar
  const penerimaanSwdkllj = sudahBayar * SWDKLLJ_PER_VEHICLE
  return {
    no: index + 1,
    ...row,
    collectionRate: Math.round((sudahBayar / row.jumlahKendaraan) * 1000) / 10,
    sudahBayar,
    belumBayar,
    penerimaanSwdkllj,
  }
}).sort((a, b) => b.collectionRate - a.collectionRate)
  .map((row, index) => ({ ...row, no: index + 1 }))

function sum(key) {
  return kecamatanList.reduce((acc, row) => acc + row[key], 0)
}

const totalKendaraan = sum('jumlahKendaraan')
const totalSudahBayar = sum('sudahBayar')
const totalBelumBayar = sum('belumBayar')

export const kecamatanSummary = {
  collectionRate: Math.round((totalSudahBayar / totalKendaraan) * 1000) / 10,
  collectionRateTarget: 90,
  totalKendaraan,
  totalSudahBayar,
  totalBelumBayar,
  penerimaanPkb: sum('penerimaanPkb'),
  penerimaanPkbTarget: 23_250_000_000,
  opsenPkb: sum('opsenPkb'),
  opsenPkbTarget: 14_250_000_000,
  potensiBelumBayar: sum('potensiBelumBayar'),
  penerimaanSwdkllj: sum('penerimaanSwdkllj'),
}

export const trendCollectionRate = [
  { bulan: 'Jan', rate: 64.13 },
  { bulan: 'Feb', rate: 65.48 },
  { bulan: 'Mar', rate: 67.45 },
  { bulan: 'Apr', rate: 70.18 },
  { bulan: 'Mei', rate: 73.1 },
  { bulan: 'Jun', rate: 75.32 },
  { bulan: 'Jul', rate: 76.81 },
  { bulan: 'Agu', rate: 78.45 },
  { bulan: 'Sep', rate: 79.9 },
  { bulan: 'Okt', rate: 81.2 },
  { bulan: 'Nov', rate: 82.4 },
  { bulan: 'Des', rate: 83.5 },
  { bulan: 'Mei (YTD)', rate: kecamatanSummary.collectionRate },
]
