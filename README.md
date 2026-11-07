# SIA-Rasionalisasi — GovTech SPBE Decision Intelligence

> **Sistem Evaluasi, Prioritas Integrasi, dan Rasionalisasi Portofolio Aplikasi Layanan Publik Berbasis Arsitektur SPBE Nasional**

Platform *Decision Intelligence* tingkat enterprise untuk membantu kementerian, lembaga, pemerintah daerah, dan BUMN dalam mengevaluasi serta merasionalisasi ratusan hingga ribuan aplikasi layanan publik dalam Sistem Informasi Arsitektur (SIA) SPBE.

---

## 📋 Daftar Isi

- [Latar Belakang Regulasi](#-latar-belakang-regulasi)
- [Fitur Utama](#-fitur-utama)
- [Teknologi](#-teknologi)
- [Instalasi & Menjalankan](#-instalasi--menjalankan)
- [Struktur Proyek](#-struktur-proyek)
- [Metode AHP](#-metode-ahp-analytical-hierarchy-process)
- [Klasifikasi Rekomendasi](#-klasifikasi-rekomendasi)
- [Dataset](#-dataset)
- [Deployment](#-deployment)
- [Lisensi](#-lisensi)

---

## ⚖️ Latar Belakang Regulasi

Aplikasi ini mengacu pada:

| Peraturan | Deskripsi |
|-----------|-----------|
| **Perpres No. 132 Tahun 2022** | Arsitektur SPBE Nasional |
| **Perpres No. 82 Tahun 2023** | Akselerasi Transformasi Digital & GovTech INA Digital |

Tujuan: Mencegah siloisasi data, efisiensi anggaran TIK nasional, dan mendorong integrasi ke ekosistem **INAku**, **INAgov**, **INApas**.

---

## 🚀 Fitur Utama

### 1. **Ringkasan Eksekutif (Executive Dashboard)**
- 4 KPI Cards: Total Portofolio, Integrasi, Replikasi, Decommissioned
- Visualisasi Chart.js: Distribusi hasil & Bobot Prioritas Kriteria
- Quick view: Top 10 Prioritas Integrasi & Bottom 5 Kandidat Decommissioned

### 2. **Konfigurasi AHP (AHP Engine & Sensitivity Simulator)**
- Matriks Perbandingan Berpasangan 4×4 interaktif (Skala Saaty 1/9 – 9)
- Auto-reciprocal & Column Sums real-time
- Matriks Normalisasi & Bobot Prioritas (W) dengan visualisasi bar
- **CR Validator**: λmax, CI, RI, CR dengan status KONSISTEN/TIDAK KONSISTEN

### 3. **Perangkingan Portofolio (AHP Scoring & Ranking)**
- Filter real-time: Search, Rekomendasi, Kategori SIA, Instansi
- Pagination: 25/50/100/Semua
- 14 kolom detail: Skor mentah, nilai terbobot per kriteria, total skor AHP
- Modal detail perhitungan langkah-demi-langkah per aplikasi

### 4. **Manajemen Dataset (Dataset Explorer & CRUD)**
- Tabel 500 baris data mentah
- **Tambah/Edit/Hapus** aplikasi (auto-recalculate AHP)
- Upload CSV eksternal & Download dataset/template CSV

---

## 🛠️ Teknologi

| Kategori | Teknologi |
|----------|-----------|
| **Arsitektur** | Zero-Build Static Web (HTML/CSS/JS vanilla) |
| **Styling** | Tailwind CSS (CDN) + Custom CSS |
| **Charts** | Chart.js (CDN) |
| **CSV Parser** | PapaParse (CDN) |
| **Icons** | Font Awesome 6 (CDN) / Lucide |
| **Fonts** | Inter, JetBrains Mono (Google Fonts) |
| **Deployment** | Netlify / Vercel / GitHub Pages |

> **Zero dependencies** — tidak ada `node_modules`, tidak perlu build step.

---

## ▶️ Instalasi & Menjalankan

### Prasyarat
- Python 3 (untuk local server) **ATAU** any static file server

### Cara Cepat

```bash
# Clone repository
git clone https://github.com/<username>/spk-ahp-spbe.git
cd spk-ahp-spbe

# Jalankan local server (Python 3)
python -m http.server 8080

# Atau Python 2
python -m SimpleHTTPServer 8080

# Buka browser
# http://localhost:8080
```

> ⚠️ **Wajib via HTTP server** (bukan `file://`) agar `fetch('./Dataset_500_Aplikasi_SPBE_INA_Digital.csv')` berfungsi. Jika dibuka langsung sebagai file, akan otomatis menampilkan data demo + tombol upload CSV.

---

## 📁 Struktur Proyek

```
spk-ahp-spbe/
├── index.html                              # Kerangka UI utama (4 Tab, Modal, CDN Links)
├── style.css                               # Custom styling, scrollable tables, badge themes, print styles
├── app.js                                  # Core AHP Engine, CSV Parser, State Management, Chart.js logic
├── Dataset_500_Aplikasi_SPBE_INA_Digital.csv  # Dataset default 500 aplikasi SPBE
├── prd.md                                  # Product Requirements Document & Technical Specification
├── .gitignore                              # Git ignore rules
└── README.md                               # This file
```

---

## 🧮 Metode AHP (Analytical Hierarchy Process)

### 4 Kriteria Utama
| Kode | Kriteria | Deskripsi |
|------|----------|-----------|
| **C1** | Kesiapan Interoperabilitas | Skor kesiapan standar REST API & Metadata SIA SPBE |
| **C2** | Tingkat Keunikan Fungsi | Tingkat keunikan fungsi / bebas duplikasi aplikasi |
| **C3** | Efisiensi Anggaran | Skor kelayakan biaya pemeliharaan TIK vs manfaat |
| **C4** | Keamanan Siber & SDM | Skor audit keamanan CSIRT & kesiapan SDM TI |

### Matriks Perbandingan Berpasangan Default (Saaty 1–9)
```
        C1   C2   C3   C4
C1      1    2    3    4
C2     1/2   1    2    3
C3     1/3  1/2   1    2
C4     1/4  1/3  1/2   1
```

### Hasil Default (Excel Parity — 4 desimal)
| Parameter | Nilai |
|-----------|-------|
| **Bobot (W)** | C1=0.4658, C2=0.2771, C3=0.1611, C4=0.0960 |
| **λmax** | 4.0310 |
| **CI** | 0.0103 |
| **RI (n=4)** | 0.90 |
| **CR** | 0.0115 (1.15%) ✅ **KONSISTEN** |

### Rumus Skor Akhir
```
Vk = (C1k/100 × W1) + (C2k/100 × W2) + (C3k/100 × W3) + (C4k/100 × W4)
```

---

## 🏷️ Klasifikasi Rekomendasi

| Skor AHP (Vk) | Rekomendasi | Badge | Default Count |
|---------------|-------------|-------|---------------|
| **≥ 0.70** | **Integrasi ke INA Digital** | 🟢 Emerald | 131 aplikasi |
| **0.45 – 0.69** | **Replikasi (Shared Service)** | 🟡 Amber | 191 aplikasi |
| **< 0.45** | **Dihentikan (Decommissioned)** | 🔴 Rose | 178 aplikasi |

---

## 📊 Dataset

**File:** `Dataset_500_Aplikasi_SPBE_INA_Digital.csv`

| Kolom | Tipe | Contoh |
|-------|------|--------|
| `Kode_Aplikasi` | String | `APP-0001` |
| `Nama_Aplikasi` | String | `SIMKepegawaian (BUMN) #1` |
| `Instansi_Pengelola` | String | `Kementerian BUMN` |
| `Kategori_SIA_SPBE` | Enum | `Layanan Publik (G2C)`, `Administrasi Pemerintahan (G2G)`, `Layanan Bisnis/BUMN (G2B)`, `Layanan ASN (G2E)` |
| `C1_Interoperabilitas_API` | Integer (0–100) | `68` |
| `C2_Keunikan_Fungsi` | Integer (0–100) | `55` |
| `C3_Efisiensi_Anggaran` | Integer (0–100) | `67` |
| `C4_Keamanan_Siber_SDM` | Integer (0–100) | `63` |

### Template CSV
```csv
Kode_Aplikasi,Nama_Aplikasi,Instansi_Pengelola,Kategori_SIA_SPBE,C1_Interoperabilitas_API,C2_Keunikan_Fungsi,C3_Efisiensi_Anggaran,C4_Keamanan_Siber_SDM
APP-0001,Contoh Aplikasi,Kementerian Contoh,Layanan Publik (G2C),75,80,65,70
```

---

## 🌐 Deployment

### Netlify (Recommended)
1. Push ke GitHub
2. Connect repository di Netlify
3. Build command: *(kosong)* — **No build step**
4. Publish directory: `.` (root)
5. Deploy!

### Vercel
```bash
npx vercel deploy --prod
# Atau connect via dashboard Vercel
```

### GitHub Pages
1. Settings → Pages
2. Source: `Deploy from a branch`
3. Branch: `main` / `/ (root)`
4. Save

> **Catatan**: Karena pure static files, deployment instan di platform manapun.

---

## 📝 Catatan Penting

### Branding Constraint (PRD)
> Aplikasi ini adalah produk portofolio **production-grade**. **JANGAN** mencantumkan nama mahasiswa, NIM, nama kampus, atau kata-kata seperti "Tugas UTS / Kuliah" di bagian mana pun pada antarmuka aplikasi. Gunakan identitas profesional selayaknya dashboard GovTech resmi.

### Presisi Angka
Semua tampilan bobot, matriks normalisasi, CI, CR, dan Total Skor AHP diformat menggunakan `toFixed(4)` (4 angka di belakang koma) untuk **100% Excel parity**.

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile responsive (1366×768, 1920×1080)

---

## 📄 Lisensi

Proyek ini dikembangkan untuk keperluan evaluasi dan rasionalisasi portofolio aplikasi SPBE sesuai regulasi nasional.

---

## 🤝 Kontribusi

Issue dan PR欢迎 untuk:
- Perbaikan bug perhitungan AHP
- Penambahan fitur visualisasi
- Optimasi performa dataset besar
- Peningkatan aksesibilitas (WCAG)

---

**Dibangun dengan ❤️ untuk ekosistem GovTech Indonesia**  
*SIA-Rasionalisasi — SPBE Portfolio Decision Intelligence*