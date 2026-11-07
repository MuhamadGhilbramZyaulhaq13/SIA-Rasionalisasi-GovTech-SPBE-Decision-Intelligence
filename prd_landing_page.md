# Product Requirements Document (PRD): Enterprise Landing Page Upgrade
**Product Name:** SIA-Rasionalisasi — GovTech SPBE Decision Intelligence  
**Scope:** Dedicated High-Converting Enterprise Landing Page & Seamless Workspace Switcher  
**Integration Mode:** Non-Destructive Upgrade (Preserve existing 4-Tab AHP Application & Logic in `index.html`, `style.css`, and `app.js`)

---

## 1. Objective & Integration Strategy
Aplikasi utama **SIA-Rasionalisasi** (4-Tab AHP Decision Workspace beserta logika perhitungan CSV 500 aplikasi) **SUDAH DIBANGUN dan BERFUNGSI**. 

Tujuan dari PRD ini adalah membangun **Enterprise Landing Page** berstandar *SaaS / GovTech profesional* yang berfungsi sebagai halaman muka utama (*front-door experience*) sebelum pengguna masuk ke dalam *Workspace AHP*.

### Aturan Integrasi (CRITICAL CONSTRAINTS untuk AI Developer):
1. **JANGAN MERUSAK KODE EKSISTING:** Pertahankan 100% kode perhitungan AHP, parser CSV, tabel 4-tab, dan grafik Chart.js yang sudah ada di `index.html`, `style.css`, dan `app.js`.
2. **Arsitektur Dual-View (`#landing-view` & `#workspace-view`):**
   * Bungkus seluruh antarmuka aplikasi 4-tab yang sudah ada ke dalam satu kontainer `<div id="workspace-view" class="hidden">...</div>`.
   * Buat kontainer baru `<div id="landing-view">...</div>` yang tampil secara *default* saat website pertama kali dibuka.
   * Buat fungsi JavaScript sederhana `switchView('landing' | 'workspace', targetTabId)` agar saat tombol CTA di Landing Page diklik, halaman melakukan transisi mulus ke `#workspace-view` (dan otomatis membuka Tab yang relevan), serta tambahkan tombol **`← Beranda Produk`** di header Workspace untuk kembali ke Landing Page kapan saja.
3. **Zero Academic Branding:** Jangan cantumkan nama mahasiswa, NIM, kampus, atau istilah tugas kuliah. Tampilkan murni sebagai produk *GovTech Enterprise* resmi.

---

## 2. Visual Identity & Design System
* **Design Aesthetic:** *Clean, Authoritative GovTech & Modern B2B SaaS* — white backgrounds, generous whitespace, crisp typography, subtle borders. Think Stripe/Linear in light mode only.
* **Color Palette (Minimal):**
  * **Background:** Pure white (`#FFFFFF`) for all sections.
  * **Surface:** White cards on white background, separated by `border-slate-200` (1px) and subtle `shadow-sm` on hover.
  * **Primary Accent (Single):** Deep Indigo `#3B4FAE` — used only for primary buttons, active states, and key metric highlights.
  * **Text:** `slate-900` for headings, `slate-600` for body, `slate-400` for muted labels.
  * **Semantic Status Colors (Restrained, only in data display):**
    * *Integrasi INA Digital:* Emerald `#059669` (text only, no fills)
    * *Shared Service:* Amber `#D97706` (text only, no fills)
    * *Decommissioned:* Rose `#E11D48` (text only, no fills)
* **Typography:**
  * *Heading & Body:* `'Inter'` (`tracking-tight` for large headings, normal for body).
  * *Numbers, Weights, Metrics:* `'JetBrains Mono'` (`font-mono tabular-nums`).
* **No Gradients. No Dark Backgrounds. No Glassmorphism. No Radial Glows. No Backdrop Blur.**

---

## 3. Section-by-Section Anatomy of the Landing Page

### Section 1: Sticky Clean Navigation Bar
* **Position:** `fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200` (subtle blur only for scroll separation, not glassmorphism).
* **Left:** Simple shield icon (SVG, 24×24, stroke only) + Brand Name **"SIA-Rasionalisasi"** (Inter Medium, slate-900) + small badge `v1.0` (slate-500, 11px, uppercase).
* **Center (Smooth Scroll Links, Inter Regular, slate-600, hover slate-900):**
  * `Urgensi SPBE` (`#urgensi`)
  * `Arsitektur Kriteria` (`#arsitektur`)
  * `Matriks Kebijakan` (`#kebijakan`)
  * `Metodologi AHP` (`#metodologi`)
* **Right (Action Buttons):**
  * Secondary (Ghost): `"Unduh Dataset (500 CSV)"` — outline button, border-slate-300, text slate-700, hover bg-slate-50.
  * Primary (Solid Indigo): `"Buka Workspace AHP →"` — bg-indigo-700, text-white, hover bg-indigo-600, calls `switchView('workspace', 'tab-dashboard')`.

---

### Section 2: Above-the-Fold Hero Section (5-Second Value Hook)
* **Background:** Pure white. No grid patterns, no radial gradients, no decorative shapes.
* **Layout:** Two-column (desktop) / stacked (mobile). Left: copy. Right: static preview frame.
* **Eyebrow Badge (Pill, minimal):** 
  `Instrumen Kepatuhan Perpres No. 132/2022 & Perpres No. 82/2023` — bg-slate-100, text-slate-700, px-3 py-1, rounded-full, 13px.
* **Main Headline (H1, Inter, tracking-tight, slate-900, 48px/56px desktop):**
  **"Hentikan Siloisasi. Rasionalisasi Portofolio Aplikasi Layanan Publik Secara Objektif."**
  *No gradient text. Plain slate-900.*
* **Sub-headline (Inter, slate-600, 20px/30px, max-width 540px):**
  *"Platform Decision Intelligence berbasis Analytical Hierarchy Process (AHP) untuk mengaudit, memprioritaskan, dan mengintegrasikan ratusan aplikasi instansi pemerintah & BUMN ke dalam ekosistem GovTech INA Digital demi efisiensi anggaran TIK nasional."*
* **Dual CTA Cluster (stacked on mobile, side-by-side desktop):**
  * **Primary CTA:** `"Jalankan Simulasi Portofolio (500 Aplikasi) →"` — solid indigo button, opens `#workspace-view` on Tab Dashboard/Ranking.
  * **Secondary CTA:** `"Kalibrasi Matriks & Uji CR"` — ghost button (outline slate-300), opens `#workspace-view` on Tab Kalkulator Matriks AHP.
* **Hero Preview Frame (Right Column):**
  * White card, 1px slate-200 border, rounded-xl, subtle shadow-sm.
  * No glassmorphism. Clean border only.
  * Content (static representation of dashboard state):
    * Status Badge: `Consistency Ratio (CR): 0.0115 ≤ 0.10 (VALID)` — text-emerald-700 on bg-emerald-50, small pill.
    * 3 Mini Metric Rows (JetBrains Mono numbers, slate-900 labels):
      * `131` Integrasi INA Digital (26.2%) — emerald text for number
      * `191` Shared Service (38.2%) — amber text for number
      * `178` Decommissioned (35.6%) — rose text for number
    * Sample Ranking Row: `APP-0162 — DigiKinerja (Pemprov DKI Jakarta) | Skor AHP: 0.9353` — mono font for scores.
    * Bottom CTA inside frame: `"Klik untuk Masuk ke Mode Interaktif Penuh"` — full-width indigo button.

---

### Section 3: The Empirical Paradox & Authority Bar (`#urgensi`)
* **Background:** White. Section padding: 80px vertical (desktop), 60px (mobile).
* **Section Label (Small, uppercase, tracking-wider, slate-500, 13px):** `DATA EMPIRIS SPBE`
* **Section Title (H2, Inter, tracking-tight, slate-900, 36px/44px):** `Paradoks Tata Kelola Aplikasi Pemerintah`
* **Subtitle (slate-600, 18px, max-width 600px):** `Berdasarkan data Indeks SPBE 2023 dan audit arsitektur sistem lintas instansi.`
* **Layout:** 4-column grid (desktop) / 2-column (tablet) / 1-column (mobile). Equal-width cards.
* **Each Card (White, 1px slate-200 border, rounded-xl, p-6, hover shadow-md, transition-shadow):**
  * **Large Number (JetBrains Mono, 48px, font-bold, slate-900):** `27.000+`, `38%`, `40%`, `0.0115`
  * **Metric Label (Inter Medium, 16px, slate-700):** e.g., `Aplikasi Pemerintah Terfragmentasi`
  * **Description (Inter Regular, 15px, slate-600, 2-3 lines):** Concise context.
  * **No icons. No colored backgrounds. Clean typography only.**

| # | Number | Label | Description |
|---|--------|-------|-------------|
| 1 | `27.000+` | Aplikasi Pemerintah Terfragmentasi | Berjalan terfragmentasi di pusat & daerah, menyebabkan duplikasi fungsi dan pemborosan anggaran pemeliharaan tahunan. |
| 2 | `38%` | Sistem Masih Silo | Paradoks instansi berpredikat SPBE "Memuaskan" (Indeks 4,41), namun 38% aplikasinya belum memiliki standar API dan metadata seragam. |
| 3 | `40%` | Pengelola Non-TI | Kesenjangan kompetensi SDM pengelola SPBE di tengah tingginya resistensi birokrasi terhadap integrasi sistem. |
| 4 | `CR = 0.0115` | Presisi Matematis | Menghilangkan subjektivitas persetujuan anggaran (*clearance* TIK) dengan ambang batas konsistensi Saaty $CR \le 0,10$. |

---

### Section 4: Asymmetric Bento Grid — 4 Kriteria Domain SIA SPBE (`#arsitektur`)
* **Background:** White.
* **Section Label:** `ARSITEKTUR KRITERIA`
* **Section Title:** `Pemetaan Multi-Kriteria Berbasis 6 Domain Arsitektur SIA SPBE`
* **Layout:** CSS Grid 12-column. Asymmetric cards with spans reflecting weight proportions. Gap: 24px.
* **Card Style:** White, 1px slate-200 border, rounded-xl, p-6 (desktop), p-4 (mobile). No shadows at rest. Hover: shadow-md.
* **Card Content Structure:**
  * **Weight Badge (Top Right, JetBrains Mono, 14px, indigo-700):** e.g., `W = 0.4658 (46.58%)`
  * **Criterion Code (Small, uppercase, tracking-wider, slate-500, 12px):** `C1 — Kesiapan Interoperabilitas`
  * **Title (Inter SemiBold, 20px, slate-900):** `API & Metadata`
  * **Domain Tags (Inline, slate-100 bg, slate-600 text, px-2 py-0.5, rounded, 12px):** `Domain Aplikasi`, `Data & Informasi`, `Infrastruktur PDN`
  * **Description (Inter Regular, 15px, slate-600):** 2-3 sentences.
  * **Visual Indicator (Bottom, minimal):** Two inline labels: `REST API Ready` (emerald-700 text, emerald-50 bg) vs `Monolithic Silo` (slate-500 text, slate-100 bg).

**Card Specs:**

| Card | Span | Weight | Code | Title | Key Visual |
|------|------|--------|------|-------|------------|
| 1 | 7 col | 46.58% | C1 | Kesiapan Interoperabilitas (API & Metadata) | `REST API Ready` / `Monolithic Silo` badges |
| 2 | 5 col | 27.71% | C2 | Tingkat Keunikan Fungsi (Bebas Duplikasi) | Reference to `Srikandi`, `SP4N-LAPOR!` |
| 3 | 6 col | 16.11% | C3 | Efisiensi Anggaran & Beban Pemeliharaan | Cost-to-impact ratio callout |
| 4 | 6 col | 9.60% | C4 | Kesiapan Keamanan Siber & Kompetensi SDM | CSIRT/BSSN, enkripsi, tim TI internal |

---

### Section 5: 3-Tier Policy Decision Matrix — Ekosistem INA Digital (`#kebijakan`)
* **Background:** White.
* **Section Label:** `MATRIKS KEBIJAKAN`
* **Section Title:** `Tiga Jalur Rekomendasi Kebijakan Rasionalisasi Portofolio`
* **Subtitle:** `Setiap aplikasi yang dievaluasi dipetakan secara otomatis ke dalam tiga klasifikasi tindakan berdasarkan Total Skor Prioritas Global ($V_k$).`
* **Layout:** 3-column grid (desktop) / stacked (mobile). Equal width cards.
* **Card Style:** White, 1px slate-200 border, rounded-xl, p-6. **No colored backgrounds.** Top border accent only (3px solid) for tier differentiation.
* **Card Structure:**
  * **Top Accent Border:** 3px solid — Emerald (Card 1), Amber (Card 2), Rose (Card 3).
  * **Policy Label (Uppercase, tracking-wider, 13px, font-medium):** Color matches accent border (emerald-700, amber-700, rose-700).
  * **Target Ecosystem (slate-600, 14px):** e.g., `Portal INAku, INAgov, & INApas`
  * **Portfolio Stat (JetBrains Mono, 36px, font-bold, slate-900):** `131`, `191`, `178`
  * **Stat Label (slate-500, 14px):** `Aplikasi (26,2%)`
  * **Description (slate-600, 15px):** 2 sentences.
  * **Action Button (Full width, outline style matching accent color):** e.g., `"Lihat 131 Aplikasi Prioritas →"` — border-emerald-300, text-emerald-700, hover bg-emerald-50.

**Card Details:**

| # | Policy Label | Accent | Target | Count | % | Description | Button |
|---|--------------|--------|--------|-------|---|-------------|--------|
| 1 | INTEGRASI KE INA DIGITAL | Emerald | INAku, INAgov, INApas | 131 | 26.2% | Aplikasi berkinerja tinggi dengan kesiapan API matang dan fungsi layanan inti. | Lihat 131 Aplikasi Prioritas → |
| 2 | REPLIKASI (SHARED SERVICE) | Amber | Konsolidasi Aplikasi Umum Bagi-Pakai | 191 | 38.2% | Aplikasi fungsional yang perlu distandarisasi agar bisa dipakai bersama tanpa membangun ulang. | Lihat 191 Aplikasi Shared Service → |
| 3 | DIHENTIKAN (DECOMMISSIONED) | Rose | Moratorium & Penghentian Anggaran | 178 | 35.6% | Aplikasi *legacy* yang berjalan silo, fungsi duplikat, keamanan lemah, dan membebani server. | Audit 178 Aplikasi Redundan → |

---

### Section 6: Transparent Mathematical Pipeline (`#metodologi`)
* **Background:** White.
* **Section Label:** `METODOLOGI AHP`
* **Section Title:** `Transparansi Algoritma: Dari Skala Saaty hingga Pemeringkatan Ratusan Aplikasi`
* **Layout:** 3-step horizontal pipeline (desktop) / vertical stack (mobile). Connected by subtle dotted line (slate-200) through center icons.
* **Step Card (White, 1px slate-200 border, rounded-xl, p-6, relative):**
  * **Step Number (Top Left, JetBrains Mono, 48px, font-bold, slate-200):** `01`, `02`, `03`
  * **Step Title (Inter SemiBold, 20px, slate-900):** e.g., `Matriks Perbandingan Berpasangan (4 × 4)`
  * **Technical Detail (slate-600, 15px, JetBrains Mono for formulas):** Plain text, no code blocks.
  * **Connector:** SVG dot (12px, indigo) on dotted line between cards.

**Step Details:**

| Step | Title | Detail |
|------|-------|--------|
| 01 | Matriks Perbandingan Berpasangan ($4 \times 4$) | Input penilaian skala kepentingan Saaty (1–9) dengan perhitungan resiprokal otomatis ($a_{ji} = 1/a_{ij}$). |
| 02 | Normalisasi & Validasi Rasio Konsistensi ($CR$) | Ekstraksi vektor bobot prioritas ($W$), nilai Eigen maksimum ($\lambda_{\text{maks}} = 4,0310$), $CI = 0,0103$, dan validasi ketat $CR = 0,0115 \le 0,10$. |
| 03 | Sintesis Skor Portofolio ($N = 500$ Aplikasi) | Perkalian matriks skor teknis ternormalisasi terhadap vektor bobot kriteria $W$ dalam waktu $<50\text{ ms}$ di sisi klien (*client-side engine*). |

---

### Section 7: Bottom Conversion Banner & Enterprise Footer
* **Conversion Banner:**
  * **Background:** White. Border-top: 1px solid slate-200. Padding: 60px 24px.
  * **Content:** Centered, max-width 640px.
  * **Headline (Inter SemiBold, 24px, slate-900):** `Siap Mengaudit Portofolio Aplikasi Instansi Anda?`
  * **Subtext (slate-600, 16px):** `Mulai evaluasi berbasis data dalam hitungan detik. Tidak perlu instalasi — sepenuhnya berjalan di browser.`
  * **Buttons (Side-by-side, gap 12px):**
    * Primary: `"Buka Workspace Evaluasi Sekarang"` — solid indigo.
    * Secondary: `"Unggah CSV Portofolio Baru"` — ghost (outline slate-300).

* **Footer:**
  * **Background:** White. Border-top: 1px solid slate-200. Padding: 48px 24px.
  * **Layout:** 3-column grid (desktop) / stacked (mobile).
  * **Column 1 (Product):** `SIA-Rasionalisasi v1.0` (Inter Medium, slate-900) + `Enterprise GovTech Decision Intelligence` (slate-500, 14px).
  * **Column 2 (Regulasi):** Links to Perpres No. 132/2022 & Perpres No. 82/2023 (slate-600, hover slate-900, underline on hover).
  * **Column 3 (System Status):** `System Status: Client-Side AHP Engine Ready (100% Excel Parity)` (JetBrains Mono, 13px, emerald-700).
  * **Bottom Bar:** Copyright line (slate-400, 13px, centered on mobile).

---

## 4. Interaction & Motion Specifications (Restrained)
* **View Transition:** `switchView()` — 150ms ease-out opacity + 4px translateY crossfade. No spring, no bounce.
* **Scroll Spy:** Nav links update active state (indigo text) on scroll. Smooth scroll behavior.
* **Hover States:** Buttons — 150ms background/border color transition. Cards — 150ms shadow transition (sm → md).
* **Reduced Motion:** Respect `prefers-reduced-motion: reduce` — disable all transitions, instant state changes.
* **Focus Visible:** 2px solid indigo outline, 2px offset — on all interactive elements.
* **No Parallax. No Scroll Animations. No Entrance Animations. No Idle Loops.**

---

## 5. Responsive Breakpoints
* **Mobile:** < 640px — Single column, stacked cards, reduced padding (24px → 16px).
* **Tablet:** 640px – 1024px — 2-column grids where appropriate, hero stacks.
* **Desktop:** > 1024px — Full asymmetric grids, side-by-side hero, 3-column policy cards.
* **Wide:** > 1280px — Max content width 1200px, centered.

---

## 6. Accessibility Requirements
* Semantic HTML5: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<article>`.
* Heading hierarchy: H1 (hero) → H2 (sections) → H3 (card titles).
* Color contrast: All text ≥ 4.5:1 (WCAG AA). Semantic colors only as text on light backgrounds.
* Keyboard navigable: All interactive elements reachable and operable.
* ARIA: `aria-current="page"` on active nav link, `aria-label` on icon-only buttons.
* Alt text: Descriptive for shield icon and any illustrative SVGs.

---

## 7. File Structure Impact (Non-Destructive)
* **`index.html`:** Wrap existing app in `#workspace-view`, add `#landing-view` before it, add nav + footer markup.
* **`style.css`:** Append landing page styles at end (namespace with `#landing-view` prefix). No changes to existing workspace styles.
* **`app.js`:** Add `switchView()` function + nav scroll spy + smooth scroll polyfill. No changes to AHP logic.
* **Assets:** Only new SVG icons (shield, chevron, external link). No images, no illustrations, no WebGL, no Canvas.

---

## 8. Acceptance Criteria
1. Landing page loads as default view (`#landing-view` visible, `#workspace-view` hidden).
2. All 7 sections render correctly at all breakpoints.
3. Primary CTA navigates to workspace and opens Tab Dashboard.
4. Secondary CTAs navigate to correct tabs (Matrix Calculator, Ranking with filters).
5. "Beranda Produk" button in workspace header returns to landing view.
6. No gradient, dark background, glassmorphism, or radial glow appears anywhere.
7. Single accent color (Indigo #3B4FAE) used consistently for primary actions.
8. Semantic colors (Emerald/Amber/Rose) appear only as text on light backgrounds in data contexts.
9. Page passes axe-core automated accessibility audit (0 violations).
10. Lighthouse Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95.
11. Existing AHP workspace functions identically after integration.