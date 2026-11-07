# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JS (zero-build, no `node_modules`): `index.html`, `style.css`, `app.js`. Library eksternal via CDN: Tailwind CSS, Chart.js, PapaParse, Lucide Icons / FontAwesome, Google Fonts (Inter / Plus Jakarta Sans, JetBrains Mono). Deployment target: Netlify / Vercel.

## Users

Pegawai dan pengambil keputusan di kementerian, lembaga, pemerintah daerah, dan BUMN yang bertugas mengevaluasi serta merasionalisasi portofolio aplikasi layanan publik dalam Sistem Informasi Arsitektur (SIA) SPBE. Kerja utama: menentukan apakah suatu aplikasi harus diintegrasikan ke ekosistem GovTech INA Digital, direplikasi sebagai Shared Service, atau dihentikan operasionalnya untuk efisiensi anggaran TIK.

## Product Purpose

SIA-Rasionalisasi adalah platform Decision Intelligence tingkat enterprise untuk evaluasi dan rasionalisasi ratusan hingga ribuan aplikasi layanan publik SIA SPBE. Menggunakan metode Analytical Hierarchy Process (AHP) dengan 4 kriteria (C1–C4) dan presisi 4 desimal (100% parity dengan perhitungan buku kerja Excel acuan) untuk menghasilkan rekomendasi keputusan SPBE yang objektif, konsisten, dan auditable.

## Positioning

Platform decision intelligence berbasis AHP yang cocok untuk lingkungan pemerintahan, dengan perhitungan matematis yang 100% identik dengan Excel (λmax, CI, CR, bobot prioritas W), arsitektur static ringan tanpa dependensi build, dan branding profesional GovTech resmi (tanpa unsur akademik/mahasiswa).

## Operating Context

Mengacu pada Perpres No. 132 Tahun 2022 (Arsitektur SPBE Nasional) dan Perpres No. 82 Tahun 2023 (Akselerasi Transformasi Digital & GovTech INA Digital). Digunakan untuk evaluasi portofolio aplikasi layanan publik lintas 20 instansi dan 4 kategori layanan SIA SPBE (G2C, G2G, G2B, G2E), dengan 500 baris data default dan fitur import/export CSV eksternal.

## Capabilities and Constraints

- Engine AHP: matriks perbandingan berpasangan 4×4 (skala Saaty 1–9), normalisasi, vektor bobot prioritas W, uji konsistensi (CR dengan RI = 0,90 untuk n = 4), validasi konsisten jika CR ≤ 0,10
- Skor akhir per aplikasi dengan klasifikasi: Integrasi ke INA Digital (≥ 0,70), Replikasi / Shared Service (0,45 – 0,69), Dihentikan / Decommissioned (< 0,45)
- Perangkingan 500 aplikasi dari skor tertinggi ke terendah (standard competition ranking)
- 4 tab UI: Executive Dashboard, AHP Engine & Sensitivity Simulator, AHP Scoring & Ranking, Dataset Explorer & CRUD
- Fallback generator dan notifikasi elegan jika fetch CSV gagal; tombol Unggah File CSV Manual dan Unduh Template CSV
- Semua angka bobot, matriks normalisasi, CI, CR, dan Total Skor AHP diformat `toFixed(4)`
- Zero console error; Chart.js `chartInstance.destroy()` sebelum menggambar ulang saat pergantian tab

## Brand Commitments

Nama produk: **SIA-Rasionalisasi**. Subjudul: *"GovTech SPBE Portfolio Decision Intelligence"*. Badge regulasi: `Perpres 132/2022 & 82/2023 Compliant`. JANGAN mencantumkan nama mahasiswa, NIM, nama kampus, atau kata-kata seperti "Tugas UTS / Kuliah" di bagian mana pun antarmuka. Identitas profesional selayaknya dashboard GovTek resmi.

## Evidence on Hand

- `prd.md` — Product Requirements Document & Technical Specification (sumber kebenaran produk)
- `Dataset_500_Aplikasi_SPBE_INA_Digital.csv` — Dataset default 500 aplikasi SPBE (8 kolom header, 500 baris)
- `index.html`, `style.css`, `app.js` — Implementasi visual dan engine AHP yang sudah ada (incumbent)

## Product Principles

1. **Presisi matematis terjamin** — Semua perhitungan AHP wajib 100% identik dengan Excel acuan hingga 4 desimal.
2. **Produksi-grade, bukan akademik** — Antarmuka profesional GovTech; tidak ada unsur mahasiswa, kampus, atau tugas kuliah.
3. **Tidak pernah rusak saat data hilang** — Fallback data seed dan notifikasi elegan memastikan dashboard tidak tampil kosong.
4. **Evaluasi auditable** — Setiap aplikasi memiliki modal detail evaluasi langkah demi langkah yang bisa divalidasi.
5. **Zero-build dan ringan** — Siap deploy ke Netlify/Vercel tanpa dependensi build atau runtime sisi server.

## Accessibility & Inclusion

Kontras teks tajam untuk screenshot-ready dokumentasi teknis; layout responsif pada layar laptop (1366×768 dan 1920×1080). Standar a11y spesifik belum ditetapkan dalam PRD.