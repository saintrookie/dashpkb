import { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './components/layout/DashboardLayout.jsx'
import AppLoadingScreen from './components/loading/AppLoadingScreen.jsx'
import ThemeEffect from './components/theme/ThemeEffect.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import PublicRoute from './components/auth/PublicRoute.jsx'
import RequirePermission from './components/auth/RequirePermission.jsx'
import LoginPage from './pages/LoginPage.jsx'
import TingkatKepatuhanOpdPage from './pages/TingkatKepatuhanOpdPage.jsx'
import RingkasanKecamatanPage from './pages/RingkasanKecamatanPage.jsx'
import PerbandinganKelurahanPage from './pages/PerbandinganKelurahanPage.jsx'
import DataKendaraanPage from './pages/DataKendaraanPage.jsx'
import PotensiPenagihanPage from './pages/PotensiPenagihanPage.jsx'
import ComingSoonPage from './pages/ComingSoonPage.jsx'
import MapPageSkeleton from './components/map/MapPageSkeleton.jsx'

const PetaWilayahPage = lazy(() => import('./pages/PetaWilayahPage.jsx'))

function App() {
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    const bootTimer = window.setTimeout(() => setBooting(false), 500)
    return () => window.clearTimeout(bootTimer)
  }, [])

  if (booting) {
    return (
      <>
        <ThemeEffect />
        <AppLoadingScreen />
      </>
    )
  }

  return (
    <BrowserRouter>
      <ThemeEffect />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/tingkat-kepatuhan-opd" replace />} />
                  <Route path="/tingkat-kepatuhan-opd" element={<TingkatKepatuhanOpdPage />} />
                  <Route path="/ringkasan-kecamatan" element={<RingkasanKecamatanPage />} />
                  <Route
                    path="/peta-wilayah"
                    element={
                      <Suspense fallback={<MapPageSkeleton />}>
                        <PetaWilayahPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/ringkasan-kelurahan"
                    element={
                      <ComingSoonPage
                        title="Ringkasan Kelurahan"
                        subtitle="Gambaran Kepatuhan Pembayaran PKB, Opsen PKB & SWDKLLJ per Kelurahan"
                      />
                    }
                  />
                  <Route path="/perbandingan-kelurahan" element={<PerbandinganKelurahanPage />} />
                  <Route path="/data-kendaraan" element={<DataKendaraanPage />} />
                  <Route path="/potensi-penagihan" element={<PotensiPenagihanPage />} />
                  <Route
                    path="/unduh-laporan"
                    element={
                      <RequirePermission permission="export">
                        <ComingSoonPage
                          title="Unduh Laporan"
                          subtitle="Unduh Laporan Kepatuhan Pajak Kendaraan"
                        />
                      </RequirePermission>
                    }
                  />
                  <Route
                    path="/akun/profil"
                    element={
                      <ComingSoonPage
                        title="Profil Pengguna"
                        subtitle="Kelola informasi profil akun Anda"
                      />
                    }
                  />
                  <Route
                    path="/akun/pengaturan"
                    element={
                      <ComingSoonPage
                        title="Pengaturan Akun"
                        subtitle="Kelola keamanan dan preferensi akun"
                      />
                    }
                  />
                  <Route
                    path="/akun/preferensi"
                    element={
                      <ComingSoonPage
                        title="Preferensi"
                        subtitle="Sesuaikan tampilan dan preferensi dashboard"
                      />
                    }
                  />
                  <Route
                    path="/akun/aktivitas"
                    element={
                      <ComingSoonPage
                        title="Aktivitas"
                        subtitle="Riwayat aktivitas akun Anda pada sistem"
                      />
                    }
                  />
                  <Route
                    path="/bantuan"
                    element={
                      <ComingSoonPage
                        title="Bantuan & Dukungan"
                        subtitle="Pusat bantuan dan dukungan pengguna"
                      />
                    }
                  />
                  <Route
                    path="/notifikasi"
                    element={
                      <ComingSoonPage
                        title="Semua Notifikasi"
                        subtitle="Riwayat lengkap notifikasi sistem"
                      />
                    }
                  />
                  <Route path="*" element={<Navigate to="/tingkat-kepatuhan-opd" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
