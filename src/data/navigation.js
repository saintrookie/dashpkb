import { Grid3x3, Landmark, BarChart3, Car, CircleX, Building2, Download, MapPinned } from 'lucide-react'

export const NAV_ITEMS = [
  { label: 'Peta Wilayah', icon: MapPinned, path: '/peta-wilayah' },
  { label: 'Ringkasan Kelurahan', icon: Grid3x3, path: '/ringkasan-kelurahan' },
  { label: 'Ringkasan Kecamatan', icon: Landmark, path: '/ringkasan-kecamatan' },
  { label: 'Perbandingan Kelurahan', icon: BarChart3, path: '/perbandingan-kelurahan' },
  { label: 'Data Kendaraan', icon: Car, path: '/data-kendaraan' },
  { label: 'Potensi Penagihan', icon: CircleX, path: '/potensi-penagihan' },
  { label: 'Tingkat Kepatuhan OPD', icon: Building2, path: '/tingkat-kepatuhan-opd' },
  { label: 'Unduh Laporan', icon: Download, path: '/unduh-laporan', permission: 'export' },
]
