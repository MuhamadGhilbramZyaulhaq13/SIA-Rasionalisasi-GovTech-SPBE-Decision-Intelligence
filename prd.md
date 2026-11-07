# Product Requirements Document (PRD) & Technical Specification
**Product Name:** SIA-Rasionalisasi — GovTech SPBE Decision Intelligence  
**Subtitle:** Sistem Evaluasi, Prioritas Integrasi, dan Rasionalisasi Portofolio Aplikasi Layanan Publik Berbasis Arsitektur SPBE Nasional  
**Architecture:** Client-Side Static Web Application (`index.html`, `style.css`, `app.js`)  
**Deployment Target:** Netlify / Vercel  

---

## 1. Product Overview & Vision
**SIA-Rasionalisasi** adalah platform *Decision Intelligence* tingkat *enterprise* yang dirancang untuk membantu kementerian, lembaga, pemerintah daerah, dan BUMN dalam mengevaluasi serta merasionalisasi ratusan hingga ribuan aplikasi layanan publik di dalam Sistem Informasi Arsitektur (SIA) SPBE. Mengacu pada **Perpres No. 132 Tahun 2022** (Arsitektur SPBE Nasional) dan **Perpres No. 82 Tahun 2023** (Akselerasi Transformasi Digital & GovTech INA Digital), aplikasi ini menggunakan metode **Analytical Hierarchy Process (AHP)** untuk menentukan secara objektif apakah suatu aplikasi harus:
1. **Diintegrasikan ke Ekosistem GovTech INA Digital** (portal INAku, INAgov, INApas),
2. **Direplikasi sebagai Aplikasi Bagi-Pakai (*Shared Service*)**, atau
3. **Dihentikan Operasionalnya (*Decommissioned*)** demi efisiensi anggaran TIK nasional dan pencegahan siloisasi data.

> **Penting (Branding Constraint):** Aplikasi ini adalah produk portofolio *production-grade*. **JANGAN** mencantumkan nama mahasiswa, NIM, nama kampus, atau kata-kata seperti "Tugas UTS / Kuliah" di bagian mana pun pada antarmuka aplikasi. Gunakan identitas profesional selayaknya dashboard GovTech resmi.

---

## 2. Tech Stack & Workspace Structure
Aplikasi dibangun menggunakan arsitektur *Zero-Build Static Web* agar sangat ringan, cepat, bebas dependensi `node_modules`, dan langsung siap di-*deploy* ke Netlify atau Vercel.

### 2.1 File Structure
```text
spk-ahp-spbe/
├── index.html                                  # Kerangka UI utama (4 Tab Navigasi, Modal, & CDN Links)
├── style.css                                   # Custom styling, scrollable tables, badge themes, print styles
├── app.js                                      # Core AHP Engine, CSV Parser, State Management, Chart.js logic
└── Dataset_500_Aplikasi_SPBE_INA_Digital.csv   # Dataset default 500 aplikasi SPBE (sudah tersedia di root folder)
```

### 2.2 External Libraries (via CDN di `index.html`)
* **Tailwind CSS (CDN):** `https://cdn.tailwindcss.com` (Gunakan konfigurasi warna *Slate*, *Navy/Indigo*, *Emerald*, *Amber*, dan *Rose*).
* **Chart.js (CDN):** `https://cdn.jsdelivr.net/npm/chart.js` (Untuk visualisasi grafik distribusi rasionalisasi dan analisis instansi).
* **PapaParse (CDN):** `https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js` (Untuk *parsing* cepat file CSV 500 baris dan fitur *Import/Export CSV*).
* **Lucide Icons / FontAwesome (CDN):** Untuk ikon UI modern pada header, kartu metrik, dan tombol aksi.
* **Google Fonts:** Gunakan font `'Inter'` atau `'Plus Jakarta Sans'` untuk teks utama dan `'JetBrains Mono'` untuk angka matriks/skor desimal.

---

## 3. Data Schema & Default Dataset Integration
Saat halaman pertama kali dibuka (`DOMContentLoaded`), `app.js` wajib mengambil data secara otomatis menggunakan `fetch('./Dataset_500_Aplikasi_SPBE_INA_Digital.csv')`.

### 3.1 Struktur Kolom CSV (`Dataset_500_Aplikasi_SPBE_INA_Digital.csv`)
File CSV memiliki 500 baris data aplikasi (`APP-0001` s.d. `APP-0500`) dengan tepat 8 kolom *header* berikut:
1. `Kode_Aplikasi` (String, contoh: `APP-0001`)
2. `Nama_Aplikasi` (String, contoh: `SIMKepegawaian (BUMN) #1`)
3. `Instansi_Pengelola` (String, contoh: `Kementerian BUMN`, `Pemprov Jawa Barat`, dll.)
4. `Kategori_SIA_SPBE` (String: `Layanan Publik (G2C)`, `Administrasi Pemerintahan (G2G)`, `Layanan Bisnis/BUMN (G2B)`, `Layanan ASN (G2E)`)
5. `C1_Interoperabilitas_API` (Integer `0–100`: Skor kesiapan standar REST API & Metadata SIA SPBE)
6. `C2_Keunikan_Fungsi` (Integer `0–100`: Tingkat keunikan fungsi / bebas duplikasi aplikasi)
7. `C3_Efisiensi_Anggaran` (Integer `0–100`: Skor kelayakan biaya pemeliharaan TIK vs manfaat)
8. `C4_Keamanan_Siber_SDM` (Integer `0–100`: Skor audit keamanan CSIRT & kesiapan SDM TI)

### 3.2 Fallback Generator (Keamanan Data)
Jika karena alasan tertentu pengguna membuka file tanpa server lokal sehingga `fetch` CSV gagal, `app.js` harus menyediakan:
1. Pesan notifikasi elegan beserta tombol **"Unggah File CSV Manual (`<input type="file">`)**" dan **"Unduh Template CSV"**.
2. Fungsi *fallback data seed* agar dashboard tidak pernah tampil kosong/rusak.

---

## 4. Mathematical Specification (Core AHP Engine — 100% Excel Parity)
Seluruh perhitungan di dalam `app.js` **WAJIB 100% identik** hingga 4 angka di belakang koma dengan perhitungan buku kerja Excel acuan.

### 4.1 Definisi 4 Kriteria Utama ($n = 4$)
* **C1:** Kesiapan Interoperabilitas (API & Metadata)
* **C2:** Tingkat Keunikan Fungsi (Bebas Duplikasi)
* **C3:** Efisiensi Anggaran & Beban Pemeliharaan
* **C4:** Kesiapan Keamanan Siber & SDM

### 4.2 Matriks Perbandingan Berpasangan Default ($4 \times 4$)
Nilai *default* matriks perbandingan berpasangan skala Saaty (1–9) pada bagian segitiga atas adalah:
* $C1 \text{ vs } C2 = 2$
* $C1 \text{ vs } C3 = 3$
* $C1 \text{ vs } C4 = 4$
* $C2 \text{ vs } C3 = 2$
* $C2 \text{ vs } C4 = 3$
* $C3 \text{ vs } C4 = 2$

Diagonal utama selalu bernilai $1$ ($a_{ii} = 1$), dan segitiga bawah selalu dihitung otomatis menggunakan rumus resiprokal penuh ($a_{ji} = \frac{1}{a_{ij}}$):

$$A = \begin{bmatrix} 1 & 2 & 3 & 4 \\ \frac{1}{2} & 1 & 2 & 3 \\ \frac{1}{3} & \frac{1}{2} & 1 & 2 \\ \frac{1}{4} & \frac{1}{3} & \frac{1}{2} & 1 \end{bmatrix}$$

### 4.3 Normalisasi Matriks & Bobot Prioritas Kriteria ($W$)
1. **Jumlah Kolom ($S_j$):**
   $$S_j = \sum_{i=1}^{4} a_{ij}$$
   *(Pada kondisi default: $S_1 = 2,0833$; $S_2 = 3,8333$; $S_3 = 6,5000$; $S_4 = 10,0000$)*
2. **Matriks Normalisasi ($r_{ij}$):**
   $$r_{ij} = \frac{a_{ij}}{S_j}$$
3. **Vektor Bobot Prioritas Kriteria ($W_i$):**
   $$W_i = \frac{1}{4} \sum_{j=1}^{4} r_{ij}$$
   *(Hasil default wajib menghasilkan: **$W_{C1} = 0,4658$**, **$W_{C2} = 0,2771$**, **$W_{C3} = 0,1611$**, **$W_{C4} = 0,0960$**)*

### 4.4 Pengujian Konsistensi (Consistency Ratio / $CR$)
Untuk $n = 4$, nilai *Random Index* ($RI$) standar Saaty adalah **$0,90$**.
1. **Eigen Value Maksimum ($\lambda_{\text{maks}}$):**
   $$\lambda_{\text{maks}} = \sum_{j=1}^{4} \left( S_j \times W_j \right)$$
   *(Hasil default: **$\lambda_{\text{maks}} = 4,0310$**)*
2. **Consistency Index ($CI$):**
   $$CI = \frac{\lambda_{\text{maks}} - n}{n - 1} = \frac{\lambda_{\text{maks}} - 4}{3}$$
   *(Hasil default: **$CI = 0,0103$**)*
3. **Consistency Ratio ($CR$):**
   $$CR = \frac{CI}{RI} = \frac{CI}{0,90}$$
   *(Hasil default: **$CR = 0,0115$** atau **$1,15\%$**)*
4. **Aturan Validasi Konsistensi:**
   * Jika $CR \le 0,10$: Tampilkan status **"KONSISTEN (Valid — $CR \le 0,10$)"** dengan warna **Emerald/Hijau**.
   * Jika $CR > 0,10$: Tampilkan peringatan **"TIDAK KONSISTEN ($CR > 0,10$ — Mohon Revisi Matriks)"** dengan warna **Rose/Merah**.

### 4.5 Rumus Perhitungan Skor Akhir & Perangkingan 500 Aplikasi
Untuk setiap aplikasi ke-$k$ ($k = 1, 2, \dots, N$):
1. **Normalisasi Skor Mentah ($0-100$ menjadi skala $0-1$):**
   $$x_{k,j} = \frac{\text{Skor}_{k,j}}{100} \quad \text{untuk } j \in \{C1, C2, C3, C4\}$$
2. **Nilai Terbobot per Kriteria ($v_{k,j}$):**
   $$v_{k,j} = x_{k,j} \times W_j$$
3. **Total Skor AHP ($V_k$):**
   $$V_k = \sum_{j=1}^{4} v_{k,j} = \left(\frac{C1_k}{100} \times W_{C1}\right) + \left(\frac{C2_k}{100} \times W_{C2}\right) + \left(\frac{C3_k}{100} \times W_{C3}\right) + \left(\frac{C4_k}{100} \times W_{C4}\right)$$
4. **Aturan Klasifikasi Rekomendasi Keputusan SPBE:**
   * **$V_k \ge 0,70$:** **`Integrasi ke INA Digital`** (Badge Hijau / Emerald — pada dataset default menghasilkan **131 aplikasi**)
   * **$0,45 \le V_k < 0,70$:** **`Replikasi (Shared Service)`** (Badge Kuning / Amber — pada dataset default menghasilkan **191 aplikasi**)
   * **$V_k < 0,45$:** **`Dihentikan (Decommissioned)`** (Badge Merah / Rose — pada dataset default menghasilkan **178 aplikasi**)
5. **Perangkingan (Ranking):**
   * Urutkan berdasarkan $V_k$ dari tertinggi ke terendah (Peringkat `1` hingga `500`). Gunakan *standard competition ranking* atau urutan indeks terurut yang rapi.

---

## 5. UI/UX Design & Layout Architecture (4-Tab Enterprise Dashboard)

### 5.1 Top Navigation Header
* **Kiri:** Logo ikon perisai/jaringan digital + Nama Produk **"SIA-Rasionalisasi"** + Subjudul *"GovTech SPBE Portfolio Decision Intelligence"*.
* **Kanan:**
  * Badge Regulasi: `Perpres 132/2022 & 82/2023 Compliant`
  * Indikator Aktif: `CR: 0.0115 (Konsisten)` (ter-update otomatis)
  * Tombol Aksi Cepat: **Import CSV**, **Tambah Aplikasi**, dan **Export Hasil CSV**.

### 5.2 Tab Navigation Bar
Buat sistem navigasi 4 Tab interaktif yang berpindah secara instan tanpa me-*reload* halaman:

#### **TAB 1: Ringkasan Eksekutif & Analitik (Executive Dashboard)**
* **4 KPI Summary Cards di bagian atas:**
  1. **Total Portofolio Dievaluasi:** `500 Aplikasi` (Lintas 20 Instansi & 4 Kategori Layanan SPBE).
  2. **Prioritas Integrasi INA Digital ($\ge 0,70$):** `131 Aplikasi (26,2%)` — Siap masuk ekosistem INAku/INAgov/INApas.
  3. **Replikasi Bagi-Pakai / Shared Service ($0,45 - 0,69$):** `191 Aplikasi (38,2%)` — Konsolidasi lintas unit kerja.
  4. **Rekomendasi Decommissioned ($< 0,45$):** `178 Aplikasi (35,6%)` — Penghentian aplikasi silo/duplikat untuk efisiensi anggaran.
* **2 Panel Grafik Interaktif (Chart.js):**
  * **Grafik Kiri (Bar / Doughnut Chart):** Distribusi hasil keputusan rasionalisasi portofolio aplikasi SPBE.
  * **Grafik Kanan (Horizontal Bar / Radar Chart):** Profil bobot prioritas kriteria AHP ($W_{C1}$ s.d. $W_{C4}$) atau distribusi rekomendasi per Kategori Layanan SIA SPBE (`G2C`, `G2G`, `G2B`, `G2E`).
* **Tabel "Top 10 Prioritas Utama Integrasi INA Digital" & "Bottom 5 Kandidat Decommissioned":** Menampilkan pratinjau cepat aplikasi dengan skor tertinggi dan terendah.

#### **TAB 2: Konfigurasi Matriks AHP & Uji Konsistensi (AHP Engine & Sensitivity Simulator)**
* **Panel Kiri — Matriks Perbandingan Berpasangan Interaktif ($4 \times 4$):**
  * Sel segitiga atas ($C1\text{-}C2$, $C1\text{-}C3$, $C1\text{-}C4$, $C2\text{-}C3$, $C2\text{-}C4$, $C3\text{-}C4$) berupa `<select>` atau `<input type="number">` dengan pilihan skala Saaty (`1/9` s.d. `9`).
  * Sel diagonal bernilai `1.000` (terkunci) dan sel segitiga bawah otomatis menampilkan hasil `1 / nilai_atas` secara *real-time*.
  * Baris bawah menampilkan **Total Kolom ($S_j$)**.
  * Sediakan tombol **"Hitung Ulang Bobot & Perangkingan"** dan **"Reset ke Standar SPBE (Default)"**.
* **Panel Kanan — Matriks Normalisasi & Bobot Prioritas ($W$):**
  * Menampilkan tabel hasil normalisasi ($r_{ij}$) setiap sel dan kolom **Bobot Prioritas ($W_i$)** dalam bentuk desimal (`0.4658`) serta persentase bar (`46.58%`).
* **Panel Bawah — Kartu Audit Konsistensi Matriks (CR Validator):**
  * Menampilkan kotak rumus dan nilai aktual: $n = 4$, $\lambda_{\text{maks}} = 4,0310$, $CI = 0,0103$, $RI = 0,90$, dan $CR = 0,0115$.
  * Menampilkan lencana status validasi (**KONSISTEN** jika $CR \le 0,10$, **TIDAK KONSISTEN** jika $CR > 0,10$).

#### **TAB 3: Hasil Perhitungan AHP & Perangkingan Portofolio (AHP Scoring & Ranking)**
* **Control & Filter Bar:**
  * Pencarian *real-time* berdasarkan Kode/Nama Aplikasi atau Nama Instansi.
  * Filter Dropdown **Rekomendasi Keputusan** (`Semua Status`, `Integrasi ke INA Digital`, `Replikasi (Shared Service)`, `Dihentikan (Decommissioned)`).
  * Filter Dropdown **Kategori SIA SPBE** dan **Instansi Pengelola**.
  * Pilihan jumlah data per halaman (*Pagination*: `25`, `50`, `100`, atau `Tampilkan Semua 500 Baris`).
* **Tabel Perhitungan Lengkap:**
  * Kolom: `Peringkat`, `Kode`, `Nama Aplikasi`, `Instansi`, `Skor Mentah (C1..C4)`, `Nilai Terbobot (C1×W1 .. C4×W4)`, `Total Skor AHP` (ditebalkan, 4 desimal), dan `Status Rekomendasi SPBE` (dengan warna *badge* yang jelas).
  * Klik pada baris aplikasi akan membuka **Modal Detail Evaluasi Aplikasi** yang menjabarkan rincian perhitungan matematis aplikasi tersebut langkah demi langkah.

#### **TAB 4: Manajemen Dataset Portofolio Aplikasi (Dataset Explorer & CRUD)**
* **Fitur Manajemen Data:**
  * Menampilkan tabel 500 baris data mentah (`Kode_Aplikasi` s.d. `C4_Keamanan_Siber_SDM`).
  * **Modal "Tambah Aplikasi Baru":** Form input untuk menambahkan alternatif aplikasi baru ke dalam tabel (otomatis langsung dihitung skor AHP dan peringkatnya).
  * **Fitur Edit & Hapus Baris:** Memungkinkan simulasi perubahan skor salah satu aplikasi untuk menguji perubahan peringkat secara langsung.
  * **Upload CSV & Download Dataset:** Memungkinkan pengguna mengunggah file `.csv` eksternal atau mengunduh dataset yang sedang aktif.

---

## 6. Non-Functional & Quality Requirements
1. **Presisi Angka:** Semua tampilan bobot, matriks normalisasi, $CI$, $CR$, dan Total Skor AHP harus diformat rapi menggunakan `toFixed(4)` (4 angka di belakang koma).
2. **Responsivitas & Screenshot-Ready:** Tata letak harus terlihat sangat rapi pada layar laptop (`1366x768` maupun `1920x1080`) dengan kontras teks yang tajam agar sangat jelas ketika diambil tangkapan layarnya (*screenshot*) untuk dokumentasi teknis.
3. **Zero Console Errors:** Pastikan tidak ada error JavaScript, *broken chart canvas* saat berganti tab (gunakan `chartInstance.destroy()` sebelum menggambar ulang grafik Chart.js), ataupun kegagalan *fetch* path relatif.