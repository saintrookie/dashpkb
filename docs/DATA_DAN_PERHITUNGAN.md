# Data & Perhitungan — Dashboard Kepatuhan PKB

Referensi teknis untuk setiap angka, grafik, dan filter di aplikasi ini: dari
mana asalnya, bagaimana cara menghitungnya, dan batasan apa yang perlu
diketahui. Ditulis untuk siapa pun yang perlu menjelaskan atau memelihara
logika di balik dashboard ini.

Setiap bagian mengutip file sumber (`path/file.js`) supaya klaim di dokumen
ini bisa diverifikasi langsung ke kode.

---

## 1. Sumber Data

Ada dua jenis data di aplikasi ini, dan keduanya **tidak tercampur**:

| Jenis | Cakupan | Sumber |
|---|---|---|
| **Data nyata** | Kecamatan, Kelurahan, Data Kendaraan, Potensi Penagihan — **hanya untuk Tahun Pajak 2026** | `src/data/data-kendaraan.csv` (83.497 baris kendaraan riil Kota Pangkalpinang), diproses oleh `scripts/build-real-kendaraan.mjs` |
| **Data sintetis** | Semua tabel/grafik di atas untuk Tahun Pajak 2020–2025, **dan** seluruh halaman "Tingkat Kepatuhan OPD" (semua tahun) | Dibangkitkan secara deterministik (seeded random) dari `src/data/kecamatan.js`, `kendaraan.js`, `src/services/mockApi.js` |

Alasan OPD selalu sintetis: CSV sumber tidak punya kolom instansi/OPD sama
sekali — itu adalah data registrasi kendaraan masyarakat umum, bukan data
armada kendaraan dinas pemerintah. Tidak ada data nyata yang bisa dipakai
untuk halaman itu.

### 1.1 Pipeline data nyata

`scripts/build-real-kendaraan.mjs` (dijalankan manual, bukan bagian dari
build/runtime) membaca CSV dan menghasilkan tiga file JSON di
`src/data/mock-api/`:

1. **`kendaraan-real-2026.json`** (~16MB) — 83.497 baris per-kendaraan, format
   kolom (array-of-arrays) untuk menghemat ukuran. Dimuat lewat *dynamic
   import* (`import()`) sehingga hanya diunduh ketika halaman Data Kendaraan
   atau Potensi Penagihan benar-benar dibuka — bukan di setiap halaman.
2. **`kecamatan-real-2026.json`** (~1.5KB) — agregat 7 kecamatan, dijumlahkan
   langsung dari 83.497 baris di atas.
3. **`kelurahan-real-2026.json`** (~10KB) — agregat 42 kelurahan, sama.

File (2) dan (3) sengaja dibuat kecil dan dimuat **sinkron** (bukan lazy) —
halaman Ringkasan Kecamatan/Kelurahan/Perbandingan Kelurahan tidak perlu
menunggu 16MB data per-kendaraan hanya untuk menampilkan 7–42 baris agregat.

**Normalisasi nama** — nama kecamatan/kelurahan di CSV (huruf besar semua,
kadang beda ejaan) dipetakan ke nama resmi yang dipakai peta (GeoJSON):

```js
// scripts/build-real-kendaraan.mjs
const KELURAHAN_ALIASES = {
  'Rejo Sari': 'Rejosari',
  'Bukit Merapen': 'Bukit Merapin',
  'Tua Tunu Indah': 'Tuatunu Indah',
  'Bukit Intan': 'Batu Intan',   // kelurahan ini secara administratif ada di
                                  // bawah kecamatan Girimaya, bukan kecamatan
                                  // "Bukit Intan" — nama sama tapi tempat beda
}
```

Setelah normalisasi, seluruh 42 nama kelurahan di data kendaraan cocok 1:1
dengan 42 boundary polygon di `src/data/geo/pangkalpinang-kelurahan.json`
(dipakai peta interaktif).

**Klasifikasi jenis kendaraan** — kolom `Jenis` di CSV punya 95 nilai mentah
(mis. `SEPEDA MOTOR R2`, `TRONTON TANGKI`, `RANSUS AMBULANCE`). Dipetakan ke 5
kategori baku lewat pencocokan kata kunci (`classifyJenis()` di script yang
sama): **Sepeda Motor, Mobil Penumpang, Mobil Barang, Bus, Lainnya**.

### 1.2 Pipeline data sintetis (2020–2025, dan OPD semua tahun)

- **Kecamatan/Kelurahan/Kendaraan non-2026**: setiap tahun dibangkitkan
  relatif terhadap baseline 2026 yang nyata, dengan pertumbuhan/penurunan
  bertahap:
  - Jumlah kendaraan: `scaleCountForYear()` — tumbuh ~5,5–8,5%/tahun majemuk,
    menjauh dari 2026 ke kedua arah (`src/lib/yearlyTrend.js`).
  - Collection rate: `shiftRateForYear()` — bergeser ±1,1–2,7 poin/tahun +
    noise acak, dibatasi 18–99,5%.
  - Semua angka rupiah per tahun diturunkan secara proporsional dari rasio
    "per kendaraan yang sudah bayar" tahun 2026 (`kecamatan.js`,
    `buildKecamatanListForYear`).
  - Setiap seed memakai kunci deterministik (nama wilayah + tahun), jadi
    angka yang sama selalu muncul lagi untuk kombinasi wilayah+tahun yang
    sama — bukan acak ulang setiap render.
- **OPD** (`src/services/mockApi.js`, `buildOpdForYear`): 35 OPD dari
  `src/data/mock-api/opd.json` sebagai baseline 2026, tahun lain dibangkitkan
  dengan mekanisme serupa (pertumbuhan kendaraan + pergeseran collection
  rate).

---

## 2. Dua Filter Utama: Tahun Pajak & Periode Data

Kedua filter ini ada di header hampir semua halaman
(`src/components/filters/FilterCard.jsx`), dikelola oleh satu store bersama
(`src/store/dataFilterStore.js`, via `src/hooks/useDataFilters.js`).

### 2.1 Tahun Pajak

Memilih tahun mana yang dipakai (2020–2026). Untuk Kecamatan/Kelurahan/
Kendaraan/Potensi, 2026 = data nyata, selain itu = sintetis (lihat §1).

### 2.2 Periode Data ("s.d. [tanggal]")

Ini adalah **cutoff kumulatif dari 1 Januari tahun pajak yang dipilih sampai
tanggal tersebut** — bukan filter yang membuang baris data, tapi filter yang
mengubah "sudah dibayar atau belum" untuk setiap kendaraan seolah-olah
laporan dibuat pada tanggal itu.

- Untuk tahun 2026: ada 5 pilihan (s.d. 31 Jan / 28 Feb / 31 Mar / 30 Apr / 20
  Mei 2026 — 20 Mei adalah default/"hari ini" aplikasi).
- Untuk tahun lain: hanya ada satu pilihan, s.d. 31 Desember tahun itu (=
  data satu tahun penuh). Daftar pilihan otomatis menyesuaikan Tahun Pajak
  yang aktif (`useDataFilters.js`).

**Mekanisme di balik layar** (`src/data/kecamatan.js`, `getPeriodRatio` /
`getTrendCollectionRateForYear`):

1. Ada kurva bentuk bulanan (`BASELINE_TREND`) yang menggambarkan pola umum
   kenaikan collection rate sepanjang tahun (Jan rendah → Des tinggi).
2. Untuk tahun 2026, kurva ini **diskalakan ulang** supaya titik Mei-nya
   persis sama dengan collection rate nyata saat ini — jadi bentuknya tetap
   dipakai, tapi levelnya sesuai data asli, bukan angka karangan.
3. `getPeriodRatio(year, periodId)` menghitung rasio antara titik bulan yang
   dipilih vs titik bulan default (`rate[bulan] / rate[default]`).
4. Rasio ini dipakai untuk menurunkan `collectionRate`, `sudahBayar`,
   `belumBayar`, dan seluruh angka uang secara proporsional
   (`applyPeriodRatio`) — untuk kecamatan, kelurahan, **dan** data kendaraan
   per-unit (lihat §2.3).
5. Memilih periode default (20 Mei 2026) selalu menghasilkan angka yang
   identik dengan data mentah tanpa skala — tidak ada penyimpangan di titik
   default.

### 2.3 Periode Data pada data kendaraan per-unit (Data Kendaraan & Potensi Penagihan)

Karena CSV hanya snapshot satu waktu (tidak ada tanggal bayar per kendaraan
yang bisa dipakai mundur), status lunas/belum-lunas untuk periode yang lebih
awal disimulasikan begini (`src/data/kendaraan.js`,
`applyPeriodToRealRows`):

1. Hitung target jumlah kendaraan "lunas" pada periode tsb =
   `jumlah_lunas_saat_ini × rasio_periode`.
2. Setiap kendaraan yang saat ini berstatus Lunas diberi skor acak
   deterministik (dari plat nomornya, jadi hasilnya selalu sama untuk plat
   yang sama).
3. Urutkan berdasarkan skor, dan hanya kendaraan dengan skor terendah
   sejumlah target di atas yang **tetap** Lunas — sisanya "dimundurkan" jadi
   Belum Lunas untuk periode itu.

Sifat pentingnya: himpunan kendaraan Lunas pada periode awal (mis. Januari)
selalu merupakan **subset** dari himpunan Lunas pada periode belakangan (mis.
Mei) — konsisten dengan cerita "makin lama makin banyak yang bayar", bukan
berubah-ubah acak antar periode.

---

## 3. Filter Peran Pengguna (Admin vs Pemkot)

Dikelola lewat `src/store/authStore.js` (field `user.role`).

- **Admin** — akses penuh ke semua nilai, termasuk filter "Jenis Pendapatan"
  di halaman Potensi Penagihan (Semua / PKB / Opsen PKB / SWDKLLJ).
- **Pemkot** — filter "Jenis Pendapatan" **terkunci** hanya ke **Opsen PKB**
  (dropdown dinonaktifkan, tidak bisa memilih yang lain). Alasannya: PKB itu
  sendiri adalah pendapatan Provinsi, dan SWDKLLJ adalah dana Jasa Raharja —
  hanya Opsen PKB yang merupakan bagian pendapatan Kota/Kabupaten.
  (`src/components/potensi/PotensiFilterBar.jsx`)

Pembatasan ini **hanya** berlaku pada filter tersebut — bagian lain aplikasi
(KPI, grafik, tabel di halaman lain) tetap sama untuk kedua peran.

### 3.1 Cara kerja filter "Jenis Pendapatan"

Ini bukan filter yang membuang baris kendaraan (satu kendaraan yang belum
bayar tetap berkontribusi ke PKB, Opsen PKB, **dan** SWDKLLJ sekaligus) —
melainkan mengganti angka "potensi" mana yang dihitung sebagai "potensi"
utama di seluruh halaman (KPI, tabel per-wilayah, donut komposisi, daftar
prioritas). Memilih "Opsen PKB" akan menampilkan hanya porsi Opsen PKB dari
setiap kendaraan yang belum bayar; total gabungan tetap konsisten =
PKB-only + Opsen-only + SWDKLLJ-only.
(`src/data/potensiPenagihan.js`, `revenueAmounts()`)

---

## 4. Rumus Inti (dipakai berulang di banyak tempat)

### 4.1 Collection Rate

```
Collection Rate (%) = round(sudahBayar / jumlahKendaraan × 100, 1 desimal)
```

Selalu dihitung dari **jumlah kendaraan** (bukan dari nilai rupiah) — jadi
tidak terpengaruh besar-kecilnya nominal pajak per kendaraan.

### 4.2 Status Kepatuhan (band warna) — **tiga sistem ambang berbeda, sengaja**

| Level | Tabel OPD (`services/mockApi.js`) | Kecamatan/Kelurahan/Peta (`lib/complianceStatus.js`) | Grafik "Collection Rate OPD (%)" (`CollectionRateChart.jsx`) |
|---|---|---|---|
| Sangat Baik | ≥ 94% | ≥ 90% | ≥ 90% |
| Baik | ≥ 85% | ≥ 75% | *(tidak ada tingkat ini)* |
| Cukup | ≥ 70% | ≥ 60% | ≥ 70% |
| Rendah | ≥ 50% | ≥ 45% | ≥ 50% |
| Sangat Rendah | < 50% | < 45% | < 50% |

Tabel OPD memakai ambang dari `src/data/mock-api/dashboard.json`
(`complianceThresholds`); Kecamatan/Kelurahan/Peta memakai konstanta di
`lib/complianceStatus.js`; grafik bar "Collection Rate OPD (%)" di halaman
OPD punya konstanta `THRESHOLDS`-nya sendiri (hanya 4 tingkat, tanpa "Baik")
yang **berbeda dari tabel OPD di halaman yang sama**. **Ini bukan bug** —
tapi berarti warna batang di grafik dan label status di tabel pada halaman
OPD yang sama pun bisa tidak sinkron pada rate tertentu (mis. rate 80%:
grafik mewarnai "Cukup" karena ≥70%, tabel melabeli "Rendah" karena <85%).
Perlu diingat saat membandingkan status lintas halaman maupun lintas
komponen dalam satu halaman.

### 4.3 Delta "dari bulan lalu" (panah hijau/merah pada kartu KPI)

Dipakai di Ringkasan Kecamatan, Ringkasan Kelurahan, Perbandingan Kelurahan,
dan Potensi Penagihan (**tidak** di halaman OPD, lihat §5.1).

```
periode_sebelumnya = periode bulan kalender sebelum periode yang dipilih
                      (mundur ke Desember tahun pajak sebelumnya jika
                      periode saat ini = Januari)
Δ% = round((nilai_sekarang − nilai_sebelumnya) / nilai_sebelumnya × 100, 1)
```

(`src/data/kecamatan.js`, `getPreviousMonthPeriod` + `getKecamatanSummaryDelta`)

Arah panah (naik/turun) ditentukan oleh tanda `Δ%`. Warna (hijau/merah)
ditentukan terpisah per metrik, karena "naik" tidak selalu berarti "baik":

- Collection Rate, Penerimaan PKB/Opsen/SWDKLLJ: naik = hijau, turun = merah.
- Potensi Belum Bayar: **naik = merah**, turun = hijau (uang belum tertagih
  yang membesar itu buruk).

### 4.4 Target & angka "TODO"

Sebagian target adalah angka resmi yang sudah ditetapkan, sebagian lagi
**placeholder** karena belum ada target SWDKLLJ resmi dari Pemkot:

| Target | Nilai | Sumber |
|---|---|---|
| Collection Rate (Kecamatan/Kelurahan) | 90% | Hardcoded, `kecamatan.js` |
| Penerimaan PKB (Kecamatan/Kelurahan) | Rp 23,25 M | Hardcoded, `kecamatan.js` |
| Opsen PKB (Kecamatan/Kelurahan) | Rp 14,25 M | Hardcoded, `kecamatan.js` |
| **SWDKLLJ (Kecamatan/Kelurahan)** | **Placeholder** | `totalKendaraan × 90% × Rp35.000` — diturunkan dari target collection rate + tarif SWDKLLJ rata-rata, **bukan angka resmi**. Tandai `TODO` di `getKecamatanSummaryForYear()`. |
| Collection Rate (OPD) | 90% | `dashboardMeta.targets.avgCollectionRatePercent` |
| Penerimaan PKB (OPD) | Rp 20,15 M | `dashboardMeta.targets.totalPenerimaanPkb` |
| Opsen PKB (OPD) | Rp 13,3 M | `dashboardMeta.targets.totalOpsenPkb` |
| **SWDKLLJ (OPD)** | **Placeholder** | Target PKB OPD × rasio riil (total SWDKLLJ ÷ total PKB) dari data OPD itu sendiri. Tandai `TODO` di `mockApi.js`. |

Target Kecamatan/Kelurahan dan target OPD **berbeda set angka** — jangan
disamakan saat membandingkan dua halaman.

### 4.5 Pemisahan "Potensi Belum Bayar" per jenis pajak (PKB / Opsen / SWDKLLJ)

Untuk **Kecamatan/Kelurahan**, sumber data hanya menyimpan satu angka
gabungan "potensi belum bayar" per wilayah (bukan dipecah per jenis pajak
sejak awal), jadi dipecah ulang dengan estimasi (`getKecamatanSummaryForYear`):

```
potensi_SWDKLLJ = totalBelumBayar × Rp35.000/kendaraan
sisa            = potensi_total − potensi_SWDKLLJ
potensi_PKB     = sisa × (penerimaanPKB / (penerimaanPKB + penerimaanOpsen))
potensi_Opsen   = sisa − potensi_PKB
```

Ini adalah **estimasi proporsional**, bukan angka yang dihitung langsung per
kendaraan.

Untuk **OPD**, angkanya persis (bukan estimasi) karena setiap baris OPD sudah
menyimpan `billing`/`payment` per jenis pajak secara terpisah:
`unpaid_X = billing.X − payment.X`.

Untuk **Data Kendaraan / Potensi Penagihan** (data per-kendaraan nyata),
angkanya juga persis — setiap baris kendaraan punya kolom `pkb`, `opsenPkb`,
`swdkllj` masing-masing dari `Pokok PKB` / `Opsen PKB` / `Pokok SWDKLLJ` di
CSV asli.

---

## 5. Per Halaman

### 5.1 Tingkat Kepatuhan OPD

*Data: selalu sintetis (§1.2). Halaman "beranda" aplikasi.*

**5 Kartu KPI** (`src/components/kpi/KpiRow.jsx`, data dari
`services/mockApi.js` `buildKpi`):

1. **Rata-rata Collection Rate OPD** — rata-rata tertimbang seluruh OPD,
   delta = *vs target* 90% (bukan vs bulan lalu).
2. **Total Penerimaan PKB OPD** — jumlah `payment.pkb` semua OPD.
3. **Total Opsen PKB OPD** — jumlah `payment.opsenPkb`.
4. **Total Penerimaan SWDKLLJ** — jumlah `payment.swdkllj`. Baris footer
   kartu ini (dan kartu 2 & 3) menampilkan "Potensi Belum Bayar [jenis]" —
   lihat §4.5.
5. **OPD Tepat Waktu Lapor** — jumlah OPD dengan `reportingStatus = on_time`
   / total OPD.

Kartu 1 dan 5 punya indikator delta, dan keduanya dihitung **vs target**
(`deltaLabel: 'dari target'` / `'dari total'`), bukan vs bulan lalu — beda
dari halaman Kecamatan/Kelurahan/Potensi. Kartu 2–4 tidak punya indikator
delta sama sekali (digantikan footer "Potensi Belum Bayar"). Ini karena data
OPD tidak (belum) sadar-periode seperti data kendaraan nyata; lihat §6 untuk
detail keterbatasan ini.

**3 Grafik** (`src/components/charts/ChartsRow.jsx`):

- **Collection Rate OPD (%)** — bar horizontal, 9 OPD teratas berdasarkan
  collection rate, warna batang mengikuti ambang sendiri (§4.2, kolom
  "Grafik Collection Rate OPD" — bukan ambang yang sama dengan tabel di
  bawahnya).
- **Penerimaan PKB, Opsen & SWDKLLJ (Rp)** — bar chart 5 OPD dengan
  penerimaan tertinggi, 3 seri (PKB/Opsen/SWDKLLJ) per OPD.
- **Potensi Belum Bayar (Rp)** — bar chart 5 OPD dengan potensi belum bayar
  tertinggi (gabungan 3 jenis pajak).

**Tabel Daftar Kepatuhan OPD** (`src/components/table/ComplianceTable.jsx`) —
daftar lengkap dengan paginasi, kolom: Jumlah Kendaraan, Sudah/Belum Bayar,
Collection Rate, Penerimaan PKB/Opsen/SWDKLLJ, Potensi Belum Bayar, Status
Kepatuhan.

### 5.2 Ringkasan Kecamatan / Ringkasan Kelurahan

*Data: nyata untuk 2026, sintetis untuk tahun lain (§1).*

Kedua halaman memakai **komponen KPI yang sama**
(`KecamatanKpiRow.jsx`/`ComparisonKpiRow.jsx`, keduanya membaca
`useKecamatanData()` — level kota, bukan level kelurahan, meski dipakai di
halaman Kelurahan juga) — jadi 5 kartu KPI-nya identik di kedua halaman:

1. **Collection Rate** — delta vs bulan lalu (§4.3), progress bar vs target
   90%.
2. **Penerimaan PKB** — + footer "Potensi Belum Bayar PKB" (§4.5).
3. **Penerimaan Opsen PKB** — + footer "Potensi Belum Bayar Opsen PKB".
4. **Penerimaan SWDKLLJ** — + footer "Potensi Belum Bayar SWDKLLJ" (target =
   placeholder, §4.4).
5. **Jumlah Kendaraan** — footer breakdown Lunas / Belum Lunas (tanpa delta).

**Peta** (`KecamatanRealMap.jsx` / `KelurahanRealMap.jsx`) — choropleth warna
per wilayah berdasarkan Collection Rate, 5 band warna sama seperti §4.2
(ambang Kecamatan/Kelurahan). ⚠️ **Peta belum mengikuti filter Tahun
Pajak/Periode Data** — selalu menampilkan snapshot baseline (2026, periode
default). Ini keterbatasan yang sudah diketahui, lihat §6.

**Tabel Ranking** — daftar kecamatan/kelurahan diurutkan Collection Rate
tertinggi ke terendah.

**Grafik Tren Collection Rate** — garis bulanan Jan–Des memakai kurva
`getTrendCollectionRateForYear` (§2.2), plus titik akhir "Mei (YTD)" =
collection rate riil saat ini.

**Donut Distribusi Collection Rate** — mengelompokkan wilayah ke 4 pita:
≥90% / 75–89% / 60–74% / <60% (`kelurahan.js`, `RATE_RANGES` — beda lagi dari
ambang §4.2, dipakai khusus untuk donut ini).

**Grafik Pendapatan per Kecamatan** (khusus Ringkasan Kecamatan) — bar chart
PKB + Opsen per kecamatan.

### 5.3 Perbandingan Kelurahan

*Data: sama dengan §5.2 (level kelurahan), nyata untuk 2026.*

- KPI: sama seperti §5.2.
- **Filter perbandingan** (`ComparisonFilterBar.jsx`): pilih kecamatan +
  urutkan berdasarkan (Collection Rate / Penerimaan PKB / Potensi Belum
  Bayar / Jumlah Kendaraan / Nama A-Z).
- **Top 5 Tertinggi & Terendah** — dua tabel terpisah, hasil `sort` dari
  filter di atas, diambil 5 teratas dan 5 terbawah.
- Donut distribusi + grafik rentang Collection Rate + grafik tren — sama
  seperti §5.2.
- **Panel Insight/Rekomendasi** (`InsightRecommendationPanel.jsx`) — teks
  otomatis: kelurahan dengan collection rate tertinggi, dan jumlah kelurahan
  dengan rate <60% dari total.

### 5.4 Data Kendaraan

*Data: nyata untuk 2026 (83.497 kendaraan individual), sintetis untuk tahun
lain.*

**Filter** (`VehicleFilterPanel.jsx`): Kecamatan, Kelurahan (mengikuti
Kecamatan yang dipilih), Jenis Kendaraan, Status Bayar — filter AND
(kombinasi semua kondisi).

**4 Grafik** (`summarizeKendaraan()` di `kendaraan.js`):

- **Komposisi Jenis Kendaraan** — donut 5 kategori (§1.1).
- **Status Pembayaran** — donut Lunas vs Belum Lunas.
- **Kendaraan per Tahun Pembuatan** — bar chart, dikelompokkan per tahun
  2022–2025 individual, dan "≤ 2021" sebagai satu kelompok gabungan.
- **Top 5 Merek Kendaraan** — bar chart, **dihitung dinamis** dari 5 merek
  paling banyak muncul di data hasil filter (bukan daftar tetap) — supaya
  merek riil apa pun (Mitsubishi, Kawasaki, Isuzu, dst., bukan cuma
  Honda/Yamaha/Toyota/Suzuki/Daihatsu) bisa muncul kalau memang terbanyak.

**Tabel Data Kendaraan** — daftar lengkap kendaraan hasil filter (No Polisi,
Nama Pemilik, Alamat, wilayah, jenis, merek, tahun, jatuh tempo, status,
tunggakan, PKB/Opsen/SWDKLLJ/Total), berpaginasi.

⚠️ Data ini memuat PII asli (nama pemilik, alamat) dari CSV sumber — lihat
§6.

### 5.5 Potensi Penagihan

*Data: nyata untuk 2026 (hanya kendaraan berstatus Belum Lunas), sintetis
untuk tahun lain.*

**5 Kartu KPI** (`PotensiKpiRow.jsx`) — Total Potensi, Potensi PKB, Potensi
Opsen PKB, Potensi SWDKLLJ, Rata-rata Tunggakan per Kendaraan — semua dengan
delta *vs bulan lalu* (§4.3), dihitung ulang dengan filter "Jenis Pendapatan"
yang aktif (§3.1).

**Filter** (`PotensiFilterBar.jsx`): Kecamatan, Kelurahan, **Jenis
Pendapatan** (dibatasi per peran, §3), Jenis Kendaraan, Status Tunggakan.

**Status Tunggakan** — 3 kelompok: 1–2 Tahun / 3–5 Tahun / >5 Tahun
(`TUNGGAKAN_BUCKETS` di `potensiPenagihan.js`).

⚠️ **Keterbatasan data nyata**: CSV sumber tidak punya riwayat tunggakan
multi-tahun (setiap baris belum-bayar hanya berisi tagihan satu siklus).
`tunggakanTahun` untuk data 2026 dihitung dari selisih tanggal jatuh tempo
terakhir (`Tgl.Akhir yl`) ke tanggal referensi 20 Mei 2026, dan hasilnya
**selalu bernilai 1** untuk seluruh 45.878 kendaraan belum-lunas. Jadi untuk
Tahun Pajak 2026, kelompok "3–5 Tahun" dan ">5 Tahun" akan selalu kosong (0
kendaraan) — bukan filter yang rusak, hanya data asli yang memang tidak
punya variasi di dimensi ini. Tahun-tahun sintetis (2020–2025) tidak
mengalami keterbatasan ini karena tunggakan dibangkitkan acak 1–7 tahun.

**Tabel per Wilayah** — Potensi Penagihan per Kecamatan & per Kelurahan.

**Donut Komposisi** — PKB vs Opsen vs SWDKLLJ dari total potensi (hasil
filter Jenis Pendapatan).

**Ringkasan Tunggakan** — jumlah kendaraan & potensi rupiah per kelompok
tunggakan.

**Daftar Prioritas** — kecamatan/kelurahan dengan potensi terbesar,
diurutkan menurun.

**Panel Insight/Rekomendasi** (`PotensiInsightPanel.jsx`) — kecamatan dengan
potensi terbesar + persentase, dan persentase potensi dari kendaraan
bertunggakan >2 tahun.

### 5.6 Peta Wilayah

Peta interaktif independen (`src/api/mapApi.js`) yang menggabungkan data
Kecamatan/Kelurahan (`kecamatanList`/`kelurahanList`, snapshot baseline —
bukan reaktif terhadap Tahun Pajak/Periode Data, lihat §6) dengan boundary
GeoJSON asli. Warna wilayah mengikuti metrik yang dipilih pengguna
(Collection Rate, Jumlah Kendaraan, Kendaraan Belum Bayar, Potensi Belum
Bayar, atau Penerimaan PKB) — lihat `lib/mapMetrics.js` untuk skema
pewarnaan per metrik (§4.2 untuk Collection Rate, kuintil untuk metrik
lainnya).

### 5.7 Unduh Laporan

Menghasilkan file **sungguhan** (bukan simulasi) dalam 3 format
(`src/lib/reportExport.js`):

- **CSV** — delimiter titik-koma (`;`), BOM UTF-8 (supaya angka format
  Indonesia `1.234,5` tidak pecah kolom saat dibuka di Excel).
- **XLSX** — via `exceljs`, workbook Excel asli.
- **PDF** — via `jspdf` + `jspdf-autotable`, tabel dengan judul & metadata
  Tahun Pajak/Periode Data.

Data laporan mengikuti sumber yang sama seperti halaman terkait (§5.2, §5.4,
§5.5, §5.1) — termasuk status nyata/sintetis per tahun. Laporan "Data
Kendaraan" dan "Potensi Penagihan" dibatasi maksimum 1.000 baris per file
(generasi PDF untuk puluhan ribu baris terlalu lambat di browser) — ada
catatan di file kalau data dipotong.

---

## 6. Keterbatasan yang Diketahui (bukan bug)

| Keterbatasan | Penjelasan |
|---|---|
| **Tunggakan real selalu 1 tahun** | Lihat §5.5 — CSV sumber tidak menyimpan riwayat multi-tahun. |
| **Target SWDKLLJ = placeholder** | Belum ada angka resmi dari Pemkot; diturunkan dari target lain. Ditandai `TODO` di kode (§4.4). Ganti begitu ada angka resmi. |
| **Potensi per-jenis-pajak (Kecamatan/Kelurahan) = estimasi** | Sumber hanya simpan angka gabungan; dipecah proporsional (§4.5), bukan dihitung langsung per kendaraan (beda dengan level OPD/Kendaraan yang datanya persis). |
| **Peta tidak mengikuti Tahun Pajak/Periode Data** | `mapApi.js` memakai snapshot baseline statis. Mengubah filter ini di halaman manapun tidak mengubah warna/angka di peta. |
| **OPD selalu sintetis** | Tidak ada data OPD nyata di sumber data. |
| **Delta OPD = vs target, bukan vs bulan lalu** | Beda mekanisme dari halaman Kecamatan/Kelurahan/Potensi (§5.1). |
| **Tiga sistem ambang status berbeda** | Tabel OPD, Kecamatan/Kelurahan/Peta, dan grafik "Collection Rate OPD (%)" masing-masing pakai batas persen yang tidak sama — bahkan dua yang terakhir ada di halaman OPD yang sama (§4.2). |
| **Data kendaraan memuat PII asli** | Nama pemilik, alamat, NIK dari CSV sumber tidak disamarkan — sesuai keputusan eksplisit bahwa aplikasi ini dipakai secara internal/tepercaya. |

---

## 7. Peta File Sumber (untuk penelusuran cepat)

| Topik | File |
|---|---|
| Filter Tahun Pajak / Periode Data | `src/hooks/useDataFilters.js`, `src/store/dataFilterStore.js` |
| Agregat Kecamatan + skala periode/tahun | `src/data/kecamatan.js` |
| Agregat Kelurahan | `src/data/kelurahan.js` |
| Data kendaraan per-unit (nyata + sintetis) | `src/data/kendaraan.js` |
| Potensi Penagihan (ringkasan & filter jenis pendapatan) | `src/data/potensiPenagihan.js` |
| Data & KPI OPD | `src/services/mockApi.js` |
| Status kepatuhan (Kecamatan/Kelurahan) | `src/lib/complianceStatus.js` |
| Warna & band metrik peta | `src/lib/mapMetrics.js` |
| Ekspor laporan (CSV/XLSX/PDF) | `src/lib/reportExport.js` |
| Skrip ETL data nyata (sumber kebenaran untuk §1.1) | `scripts/build-real-kendaraan.mjs` |
