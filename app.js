/**
 * SIA-Rasionalisasi — GovTech SPBE Decision Intelligence
 * Core AHP Engine | CSV Parser | State Management | Chart.js Logic
 * Perpres No. 132/2022 & No. 82/2023 Compliant
 */

'use strict';

// ===========================================================================
// 1. GLOBAL STATE
// ===========================================================================

let appData = [];        // Array of application objects from CSV
let ahpWeights = [];     // [W_C1, W_C2, W_C3, W_C4]
let rankedData = [];     // appData sorted by AHP score with rank
let currentPage = 1;
let perPage = 25;
let chartDistribusi = null;
let chartKriteria = null;

// AHP consistency results
let ahpConsistency = { lambdaMax: 0, ci: 0, ri: 0.90, cr: 0, isConsistent: true };
let ahpNormalized = [];  // 4x4 normalized matrix
let ahpColSums = [];     // [S1, S2, S3, S4]

// Default pairwise matrix (Saaty scale, upper triangle)
const DEFAULT_PAIRWISE = [
  [1,     2,   3,   4],
  [1/2,   1,   2,   3],
  [1/3, 1/2,   1,   2],
  [1/4, 1/3, 1/2,   1]
];

// Active pairwise matrix (mutable)
let pairwiseMatrix = DEFAULT_PAIRWISE.map(row => [...row]);

// Saaty scale options for dropdowns
const SAATY_OPTIONS = [
  { value: '1/9', label: '1/9 — Sangat Tidak Penting', num: 1/9 },
  { value: '1/8', label: '1/8', num: 1/8 },
  { value: '1/7', label: '1/7', num: 1/7 },
  { value: '1/6', label: '1/6', num: 1/6 },
  { value: '1/5', label: '1/5 — Tidak Penting', num: 1/5 },
  { value: '1/4', label: '1/4', num: 1/4 },
  { value: '1/3', label: '1/3 — Sedikit Tidak Penting', num: 1/3 },
  { value: '1/2', label: '1/2', num: 1/2 },
  { value: '1',   label: '1 — Sama Penting', num: 1 },
  { value: '2',   label: '2', num: 2 },
  { value: '3',   label: '3 — Sedikit Lebih Penting', num: 3 },
  { value: '4',   label: '4', num: 4 },
  { value: '5',   label: '5 — Lebih Penting', num: 5 },
  { value: '6',   label: '6', num: 6 },
  { value: '7',   label: '7 — Sangat Lebih Penting', num: 7 },
  { value: '8',   label: '8', num: 8 },
  { value: '9',   label: '9 — Mutlak Lebih Penting', num: 9 },
];

// Upper triangle pairs: [row, col]
const UPPER_PAIRS = [
  [0,1], [0,2], [0,3],
  [1,2], [1,3],
  [2,3]
];

const KRITERIA_LABELS = [
  'C1 — Interoperabilitas API',
  'C2 — Keunikan Fungsi',
  'C3 — Efisiensi Anggaran',
  'C4 — Keamanan & SDM'
];

// ===========================================================================
// 2. UTILITY FUNCTIONS
// ===========================================================================

/**
 * Format number to fixed decimals
 */
function fmt(num, decimals = 4) {
  return Number(num).toFixed(decimals);
}

/**
 * Debounce function
 */
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Generate CSV string from array of objects
 */
function generateCSV(data, columns) {
  const header = columns.map(c => c.label).join(',');
  const rows = data.map(row =>
    columns.map(c => {
      const val = row[c.key] ?? '';
      const str = String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',')
  );
  return [header, ...rows].join('\n');
}

/**
 * Trigger browser download
 */
function downloadFile(content, filename, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob(['﻿' + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const colors = {
    success: 'bg-emerald-800 text-white',
    error:   'bg-rose-700 text-white',
    warning: 'bg-amber-600 text-white',
    info:    'bg-indigo-700 text-white'
  };
  const icons = {
    success: 'fa-circle-check',
    error:   'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info:    'fa-circle-info'
  };
  const toast = document.createElement('div');
  toast.className = `flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${colors[type] || colors.info} animate-fade-in max-w-sm`;
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.5s'; }, 3000);
  setTimeout(() => toast.remove(), 3500);
}

/**
 * Find closest Saaty option value for a numeric pairwise value
 */
function findSaatyValue(num) {
  let best = SAATY_OPTIONS[0];
  let minDiff = Math.abs(num - best.num);
  for (const opt of SAATY_OPTIONS) {
    const diff = Math.abs(num - opt.num);
    if (diff < minDiff) { minDiff = diff; best = opt; }
  }
  return best.value;
}

// ===========================================================================
// 3. AHP ENGINE
// ===========================================================================

/**
 * Calculate column sums of the 4x4 matrix
 */
function calculateColumnSums(matrix) {
  return [0,1,2,3].map(j => matrix.reduce((sum, row) => sum + row[j], 0));
}

/**
 * Normalize matrix by column sums
 */
function normalizeMatrix(matrix, colSums) {
  return matrix.map(row => row.map((val, j) => val / colSums[j]));
}

/**
 * Calculate priority weights (row averages of normalized matrix)
 */
function calculateWeights(normalizedMatrix) {
  return normalizedMatrix.map(row => row.reduce((s, v) => s + v, 0) / 4);
}

/**
 * Calculate AHP consistency metrics
 */
function calculateConsistency(colSums, weights) {
  const n = 4;
  const ri = 0.90;
  const lambdaMax = colSums.reduce((s, sj, j) => s + sj * weights[j], 0);
  const ci = (lambdaMax - n) / (n - 1);
  const cr = ci / ri;
  return {
    lambdaMax,
    ci,
    ri,
    cr,
    isConsistent: cr <= 0.10
  };
}

/**
 * Calculate AHP score for a single application
 */
function calcScore(app, weights) {
  return (app.c1 / 100) * weights[0]
       + (app.c2 / 100) * weights[1]
       + (app.c3 / 100) * weights[2]
       + (app.c4 / 100) * weights[3];
}

/**
 * Determine recommendation based on score
 */
function getRecommendation(score) {
  if (score >= 0.70) return 'Integrasi ke INA Digital';
  if (score >= 0.45) return 'Replikasi (Shared Service)';
  return 'Dihentikan (Decommissioned)';
}

/**
 * Build pairwise matrix from UI selects
 */
function buildPairwiseFromUI() {
  const matrix = DEFAULT_PAIRWISE.map(row => [...row]);
  for (const [r, c] of UPPER_PAIRS) {
    const sel = document.getElementById(`pw-${r}-${c}`);
    if (!sel) continue;
    const opt = SAATY_OPTIONS.find(o => o.value === sel.value);
    if (opt) {
      matrix[r][c] = opt.num;
      matrix[c][r] = 1 / opt.num;
    }
  }
  return matrix;
}

/**
 * Run the full AHP pipeline and update all state
 */
function calculateAll() {
  // 1. Build pairwise matrix from UI
  pairwiseMatrix = buildPairwiseFromUI();

  // 2. Column sums
  ahpColSums = calculateColumnSums(pairwiseMatrix);

  // 3. Normalize
  ahpNormalized = normalizeMatrix(pairwiseMatrix, ahpColSums);

  // 4. Weights
  ahpWeights = calculateWeights(ahpNormalized);

  // 5. Consistency
  ahpConsistency = calculateConsistency(ahpColSums, ahpWeights);

  // 6. Score & rank all apps
  const scored = appData.map((app, idx) => {
    const score = calcScore(app, ahpWeights);
    const weighted = [
      (app.c1 / 100) * ahpWeights[0],
      (app.c2 / 100) * ahpWeights[1],
      (app.c3 / 100) * ahpWeights[2],
      (app.c4 / 100) * ahpWeights[3],
    ];
    return { ...app, _origIdx: idx, score, weighted, recommendation: getRecommendation(score) };
  });

  scored.sort((a, b) => b.score - a.score);
  scored.forEach((app, i) => { app.rank = i + 1; });
  rankedData = scored;

  // 7. Render everything
  renderAll();
}

// ===========================================================================
// 4. RENDER FUNCTIONS
// ===========================================================================

/**
 * Render all UI panels
 */
function renderAll() {
  renderDashboardKPIs();
  renderCharts();
  renderTop10Bottom5();
  renderAHPMatrix();
  renderRankingTable();
  renderDatasetTable();
  updateHeaderCR();
  updateBriefingHeader();
}

/**
 * Update header CR badge (top nav)
 */
function updateHeaderCR() {
  const badge = document.getElementById('header-cr-badge');
  if (!badge) return;
  if (ahpConsistency.isConsistent) {
    badge.className = 'badge-konsisten text-xs px-2.5 py-1 rounded-full font-mono font-medium';
    badge.textContent = `CR: ${fmt(ahpConsistency.cr)} ✓`;
  } else {
    badge.className = 'badge-tidak-konsisten text-xs px-2.5 py-1 rounded-full font-mono font-medium';
    badge.textContent = `CR: ${fmt(ahpConsistency.cr)} ✗`;
  }
}

/**
 * Update briefing header (Tab 1)
 */
function updateBriefingHeader() {
  // Timestamp
  const tsEl = document.getElementById('briefing-timestamp');
  if (tsEl) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    tsEl.textContent = `Data per: ${dateStr} ${timeStr}`;
  }

  // CR status in briefing header
  const crEl = document.getElementById('briefing-cr-status');
  if (crEl) {
    if (ahpConsistency.isConsistent) {
      crEl.innerHTML = `<span class="iconify" data-icon="mdi:check-circle" data-width="12" data-height="12" style="color:var(--gov-emerald)"></span> CR: ${fmt(ahpConsistency.cr)} (Konsisten)`;
    } else {
      crEl.innerHTML = `<span class="iconify" data-icon="mdi:alert-circle" data-width="12" data-height="12" style="color:var(--gov-rose)"></span> CR: ${fmt(ahpConsistency.cr)} (Tidak Konsisten)`;
    }
  }

  // Print footer date
  const printDateEl = document.getElementById('briefing-print-date');
  if (printDateEl) {
    const now = new Date();
    printDateEl.textContent = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
}

/**
 * Render dashboard KPI cards (briefing layout)
 */
function renderDashboardKPIs() {
  const total = rankedData.length;
  const integrasi = rankedData.filter(a => a.recommendation === 'Integrasi ke INA Digital').length;
  const replikasi = rankedData.filter(a => a.recommendation === 'Replikasi (Shared Service)').length;
  const decomm = rankedData.filter(a => a.recommendation === 'Dihentikan (Decommissioned)').length;

  setText('kpi-total', total);
  setText('kpi-integrasi', integrasi);
  setText('kpi-replikasi', replikasi);
  setText('kpi-decommissioned', decomm);

  if (total > 0) {
    setText('kpi-integrasi-pct', `${((integrasi/total)*100).toFixed(1)}% — Skor ≥ 0.70`);
    setText('kpi-replikasi-pct', `${((replikasi/total)*100).toFixed(1)}% — Skor 0.45–0.69`);
    setText('kpi-decommissioned-pct', `${((decomm/total)*100).toFixed(1)}% — Skor < 0.45`);
  }
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/**
 * Render Chart.js charts (destroy first to avoid canvas reuse error)
 */
function renderCharts() {
  // Doughnut chart: distribution
  const ctxD = document.getElementById('chart-distribusi');
  if (ctxD) {
    if (chartDistribusi) { chartDistribusi.destroy(); chartDistribusi = null; }
    const integrasi = rankedData.filter(a => a.recommendation === 'Integrasi ke INA Digital').length;
    const replikasi = rankedData.filter(a => a.recommendation === 'Replikasi (Shared Service)').length;
    const decomm = rankedData.filter(a => a.recommendation === 'Dihentikan (Decommissioned)').length;

    chartDistribusi = new Chart(ctxD, {
      type: 'doughnut',
      data: {
        labels: ['Integrasi INA Digital', 'Replikasi (Shared Service)', 'Dihentikan'],
        datasets: [{
          data: [integrasi, replikasi, decomm],
          backgroundColor: ['#059669', '#d97706', '#dc2626'],
          borderColor: ['#ffffff', '#ffffff', '#ffffff'],
          borderWidth: 3,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: 'Inter', size: 12 },
              color: '#334155',
              padding: 16,
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = ctx.dataset.data.reduce((s, v) => s + v, 0);
                const pct = ((ctx.raw / total) * 100).toFixed(1);
                return ` ${ctx.label}: ${ctx.raw} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  // Bar chart: criteria weights
  const ctxK = document.getElementById('chart-kriteria');
  if (ctxK) {
    if (chartKriteria) { chartKriteria.destroy(); chartKriteria = null; }
    chartKriteria = new Chart(ctxK, {
      type: 'bar',
      data: {
        labels: ['C1\nInteroperabilitas', 'C2\nKeunikan Fungsi', 'C3\nEfisiensi Anggaran', 'C4\nKeamanan & SDM'],
        datasets: [{
          label: 'Bobot Prioritas (W)',
          data: ahpWeights.map(w => parseFloat(fmt(w))),
          backgroundColor: ['#4f46e5', '#7c3aed', '#a855f7', '#c084fc'],
          borderColor: ['#3730a3', '#5b21b6', '#7e22ce', '#9333ea'],
          borderWidth: 1.5,
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` W = ${fmt(ctx.raw)} (${(ctx.raw * 100).toFixed(2)}%)`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 0.6,
            ticks: {
              font: { family: 'JetBrains Mono', size: 11 },
              color: '#64748b',
              callback: v => (v * 100).toFixed(0) + '%'
            },
            grid: { color: '#f1f5f9' }
          },
          x: {
            ticks: {
              font: { family: 'Inter', size: 11 },
              color: '#64748b'
            },
            grid: { display: false }
          }
        }
      }
    });
  }
}

/**
 * Render Top 10 and Bottom 5 tables (briefing layout)
 */
function renderTop10Bottom5() {
  const top10 = rankedData.slice(0, 10);
  const bottom5 = rankedData.slice(-5).reverse();

  renderBriefingTable('table-top10', top10, 'integrasi');
  renderBriefingTable('table-bottom5', bottom5, 'decommissioned');
}

function renderBriefingTable(id, data, type) {
  const tbody = document.getElementById(id);
  if (!tbody) return;

  const rankColor = type === 'integrasi' ? 'var(--gov-emerald)' : 'var(--gov-rose)';

  tbody.innerHTML = data.map(app => `
    <tr class="cursor-pointer" onclick="openDetailModal(${app._origIdx})">
      <td class="briefing-col-rank rank" style="color: ${rankColor}">${app.rank}</td>
      <td class="briefing-col-kode kode">${esc(app.kode)}</td>
      <td class="briefing-col-nama nama" title="${esc(app.nama)}">${esc(app.nama)}</td>
      <td class="briefing-col-instansi instansi" title="${esc(app.instansi)}">${esc(app.instansi)}</td>
      <td class="briefing-col-score score" style="color: ${rankColor}">${fmt(app.score)}</td>
    </tr>
  `).join('');
}

/**
 * Render AHP Matrix (Tab 2)
 */
function renderAHPMatrix() {
  // Update reciprocal cells
  const reciprocals = [
    [1,0], [2,0], [2,1], [3,0], [3,1], [3,2]
  ];
  for (const [r, c] of reciprocals) {
    const el = document.getElementById(`pw-${r}-${c}`);
    if (el) el.textContent = fmt(pairwiseMatrix[r][c]);
  }

  // Column sums
  for (let j = 0; j < 4; j++) {
    setText(`col-sum-${j}`, fmt(ahpColSums[j]));
  }

  // Normalized matrix table
  const tbody = document.getElementById('normalized-body');
  if (tbody) {
    const rows = ['C1','C2','C3','C4'];
    tbody.innerHTML = rows.map((label, i) => `
      <tr>
        <td class="p-2 font-semibold text-slate-600 bg-slate-50">${label}</td>
        ${[0,1,2,3].map(j => `
          <td class="p-2 font-mono text-sm text-slate-700">${fmt(ahpNormalized[i][j])}</td>
        `).join('')}
        <td class="p-2 font-mono text-sm font-bold text-indigo-700">${fmt(ahpWeights[i])}</td>
      </tr>
    `).join('');
  }

  // Weight bars
  const barsDiv = document.getElementById('weight-bars');
  if (barsDiv) {
    const labels = ['C1','C2','C3','C4'];
    const colors = ['indigo', 'violet', 'purple', 'fuchsia'];
    barsDiv.innerHTML = labels.map((label, i) => {
      const pct = (ahpWeights[i] * 100).toFixed(2);
      return `
        <div class="flex items-center gap-3">
          <span class="text-xs font-semibold text-slate-600 w-6">${label}</span>
          <div class="flex-1 bg-slate-100 rounded-full h-5 relative overflow-hidden">
            <div class="h-full rounded-full bg-indigo-600 transition-all duration-700 flex items-center justify-end pr-2"
                 style="width:${pct}%">
              <span class="text-xs font-bold text-white">${pct}%</span>
            </div>
          </div>
          <span class="font-mono text-sm font-bold text-indigo-700 w-16 text-right">${fmt(ahpWeights[i])}</span>
        </div>
      `;
    }).join('');
  }

  // CR Validator
  setText('cr-lambda', fmt(ahpConsistency.lambdaMax));
  setText('cr-ci', fmt(ahpConsistency.ci));
  setText('cr-ri', fmt(ahpConsistency.ri, 2));
  setText('cr-value', fmt(ahpConsistency.cr));
  setText('cr-ci-formula', fmt(ahpConsistency.ci));
  setText('cr-value-formula', fmt(ahpConsistency.cr));

  const badge = document.getElementById('cr-status-badge');
  if (badge) {
    if (ahpConsistency.isConsistent) {
      badge.className = 'badge-konsisten text-sm px-4 py-2 rounded-full font-semibold';
      badge.textContent = '✅ KONSISTEN (CR ≤ 0.10)';
    } else {
      badge.className = 'badge-tidak-konsisten text-sm px-4 py-2 rounded-full font-semibold';
      badge.textContent = '⚠️ TIDAK KONSISTEN (CR > 0.10 — Mohon Revisi Matriks)';
    }
  }
}

// ===========================================================================
// 5. RANKING TABLE
// ===========================================================================

let filteredData = [];

function getFilteredData() {
  const search = (document.getElementById('search-ranking')?.value || '').toLowerCase().trim();
  const filterRek = document.getElementById('filter-rekomendasi')?.value || '';
  const filterKat = document.getElementById('filter-kategori')?.value || '';
  const filterIns = document.getElementById('filter-instansi')?.value || '';

  return rankedData.filter(app => {
    if (search && !(
      app.kode.toLowerCase().includes(search) ||
      app.nama.toLowerCase().includes(search) ||
      app.instansi.toLowerCase().includes(search)
    )) return false;
    if (filterRek && app.recommendation !== filterRek) return false;
    if (filterKat && app.kategori !== filterKat) return false;
    if (filterIns && app.instansi !== filterIns) return false;
    return true;
  });
}

function renderRankingTable() {
  filteredData = getFilteredData();
  const total = filteredData.length;
  const perPageNum = perPage === 'all' ? total : parseInt(perPage);
  const totalPages = perPage === 'all' ? 1 : Math.ceil(total / perPageNum);
  if (currentPage > totalPages) currentPage = Math.max(1, totalPages);

  const start = (currentPage - 1) * (perPage === 'all' ? total : perPageNum);
  const end = perPage === 'all' ? total : Math.min(start + perPageNum, total);
  const pageData = filteredData.slice(start, end);

  const tbody = document.getElementById('table-ranking');
  if (tbody) {
    if (pageData.length === 0) {
      tbody.innerHTML = `<tr><td colspan="14" class="text-center py-12 text-slate-400">Tidak ada data yang sesuai filter.</td></tr>`;
    } else {
      tbody.innerHTML = pageData.map(app => {
        const badgeClass = getBadgeClass(app.recommendation);
        return `
          <tr class="cursor-pointer" onclick="openDetailModal(${app._origIdx})">
            <td class="text-center font-mono font-bold text-slate-800">${app.rank}</td>
            <td class="font-mono text-xs text-slate-500">${esc(app.kode)}</td>
            <td class="font-medium text-slate-700 max-w-[180px]">
              <div class="truncate" title="${esc(app.nama)}">${esc(app.nama)}</div>
            </td>
            <td class="text-xs text-slate-500 max-w-[130px]">
              <div class="truncate" title="${esc(app.instansi)}">${esc(app.instansi)}</div>
            </td>
            <td class="text-center font-mono text-sm">${app.c1}</td>
            <td class="text-center font-mono text-sm">${app.c2}</td>
            <td class="text-center font-mono text-sm">${app.c3}</td>
            <td class="text-center font-mono text-sm">${app.c4}</td>
            <td class="text-right font-mono text-xs text-slate-600">${fmt(app.weighted[0])}</td>
            <td class="text-right font-mono text-xs text-slate-600">${fmt(app.weighted[1])}</td>
            <td class="text-right font-mono text-xs text-slate-600">${fmt(app.weighted[2])}</td>
            <td class="text-right font-mono text-xs text-slate-600">${fmt(app.weighted[3])}</td>
            <td class="text-right font-mono font-bold text-slate-900">${fmt(app.score)}</td>
            <td class="text-center"><span class="${badgeClass} badge text-xs px-2 py-1 rounded-full whitespace-nowrap">${esc(app.recommendation)}</span></td>
          </tr>
        `;
      }).join('');
    }
  }

  // Results count
  setText('results-count', `Menampilkan ${pageData.length > 0 ? start + 1 : 0}–${end} dari ${total} aplikasi`);

  // Pagination
  renderPagination(totalPages, perPageNum, total, start, end);
}

function renderPagination(totalPages, perPageNum, total, start, end) {
  const container = document.getElementById('pagination-controls');
  if (!container) return;

  const infoText = `<span class="text-xs text-slate-500">Halaman ${currentPage} dari ${totalPages} (${total} total)</span>`;

  if (totalPages <= 1) {
    container.innerHTML = infoText;
    return;
  }

  const makeBtn = (label, page, disabled = false, active = false) => `
    <button class="pagination-btn ${active ? 'active' : ''}"
            onclick="goToPage(${page})"
            ${disabled ? 'disabled' : ''}
            style="${disabled ? 'opacity:0.4;cursor:not-allowed' : ''}">
      ${label}
    </button>
  `;

  let pages = [];
  pages.push(makeBtn('‹', currentPage - 1, currentPage === 1));

  // Show limited page numbers
  const range = 2;
  const start_page = Math.max(1, currentPage - range);
  const end_page = Math.min(totalPages, currentPage + range);

  if (start_page > 1) { pages.push(makeBtn('1', 1)); if (start_page > 2) pages.push('<span class="text-slate-400 px-1">…</span>'); }
  for (let p = start_page; p <= end_page; p++) pages.push(makeBtn(p, p, false, p === currentPage));
  if (end_page < totalPages) { if (end_page < totalPages - 1) pages.push('<span class="text-slate-400 px-1">…</span>'); pages.push(makeBtn(totalPages, totalPages)); }

  pages.push(makeBtn('›', currentPage + 1, currentPage === totalPages));

  container.innerHTML = `
    ${infoText}
    <div class="flex items-center gap-1">${pages.join('')}</div>
  `;
}

window.goToPage = function(page) {
  currentPage = page;
  renderRankingTable();
};

// ===========================================================================
// 6. DATASET TABLE (TAB 4)
// ===========================================================================

function renderDatasetTable() {
  const tbody = document.getElementById('table-dataset');
  if (!tbody) return;
  tbody.innerHTML = appData.map((app, i) => `
    <tr>
      <td class="text-center text-xs text-slate-400 font-mono">${i + 1}</td>
      <td class="font-mono text-xs text-slate-500">${esc(app.kode)}</td>
      <td class="text-sm font-medium text-slate-700 max-w-[180px]">
        <div class="truncate" title="${esc(app.nama)}">${esc(app.nama)}</div>
      </td>
      <td class="text-xs text-slate-500 max-w-[130px]">
        <div class="truncate" title="${esc(app.instansi)}">${esc(app.instansi)}</div>
      </td>
      <td class="text-xs">
        <span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px]">${esc(app.kategori)}</span>
      </td>
      <td class="text-center font-mono text-sm">${app.c1}</td>
      <td class="text-center font-mono text-sm">${app.c2}</td>
      <td class="text-center font-mono text-sm">${app.c3}</td>
      <td class="text-center font-mono text-sm">${app.c4}</td>
      <td class="text-center">
        <div class="flex items-center justify-center gap-1">
          <button class="text-indigo-600 hover:text-indigo-800 p-1 rounded" onclick="openEditModal(${i})" title="Edit">
            <i class="fa-solid fa-pen text-xs"></i>
          </button>
          <button class="text-rose-600 hover:text-rose-800 p-1 rounded" onclick="deleteApp(${i})" title="Hapus">
            <i class="fa-solid fa-trash text-xs"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ===========================================================================
// 7. MODAL FUNCTIONS
// ===========================================================================

/**
 * Open modal by ID
 */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('active');
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('active');
  }
}

/**
 * Open detail modal for an application
 */
window.openDetailModal = function(origIdx) {
  const app = rankedData.find(a => a._origIdx === origIdx);
  if (!app) return;

  const badgeClass = getBadgeClass(app.recommendation);
  const body = document.getElementById('modal-detail-body');
  if (!body) return;

  body.innerHTML = `
    <div class="space-y-5">
      <!-- App Info -->
      <div class="bg-slate-50 rounded-lg p-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <p class="text-xs text-slate-400 font-medium uppercase tracking-wide">Kode Aplikasi</p>
            <p class="font-mono font-semibold text-slate-700 mt-0.5">${esc(app.kode)}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-medium uppercase tracking-wide">Peringkat</p>
            <p class="font-mono font-bold text-indigo-700 text-lg mt-0.5">#${app.rank}</p>
          </div>
          <div class="col-span-2">
            <p class="text-xs text-slate-400 font-medium uppercase tracking-wide">Nama Aplikasi</p>
            <p class="font-semibold text-slate-800 mt-0.5">${esc(app.nama)}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-medium uppercase tracking-wide">Instansi</p>
            <p class="text-sm text-slate-700 mt-0.5">${esc(app.instansi)}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-medium uppercase tracking-wide">Kategori SIA SPBE</p>
            <p class="text-sm text-slate-700 mt-0.5">${esc(app.kategori)}</p>
          </div>
        </div>
      </div>

      <!-- Scoring Detail -->
      <div>
        <h4 class="text-sm font-semibold text-slate-700 mb-3">Rincian Perhitungan AHP</h4>
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="bg-slate-100">
              <th class="text-left p-2 text-xs font-semibold text-slate-600">Kriteria</th>
              <th class="text-right p-2 text-xs font-semibold text-slate-600">Skor Mentah</th>
              <th class="text-right p-2 text-xs font-semibold text-slate-600">÷ 100</th>
              <th class="text-right p-2 text-xs font-semibold text-slate-600">× Bobot (W)</th>
              <th class="text-right p-2 text-xs font-semibold text-slate-600">= Nilai Terbobot</th>
            </tr>
          </thead>
          <tbody>
            ${[
              { label: 'C1 — Interoperabilitas API', raw: app.c1, weight: ahpWeights[0], weighted: app.weighted[0] },
              { label: 'C2 — Keunikan Fungsi',       raw: app.c2, weight: ahpWeights[1], weighted: app.weighted[1] },
              { label: 'C3 — Efisiensi Anggaran',    raw: app.c3, weight: ahpWeights[2], weighted: app.weighted[2] },
              { label: 'C4 — Keamanan & SDM',        raw: app.c4, weight: ahpWeights[3], weighted: app.weighted[3] },
            ].map(r => `
              <tr class="border-b border-slate-100">
                <td class="p-2 text-slate-700">${r.label}</td>
                <td class="p-2 text-right font-mono font-semibold text-slate-800">${r.raw}</td>
                <td class="p-2 text-right font-mono text-slate-500">${fmt(r.raw / 100)}</td>
                <td class="p-2 text-right font-mono text-indigo-600">${fmt(r.weight)}</td>
                <td class="p-2 text-right font-mono font-bold text-slate-800">${fmt(r.weighted)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="bg-slate-50 font-bold">
              <td colspan="4" class="p-2 text-slate-700">Total Skor AHP (V<sub>k</sub>)</td>
              <td class="p-2 text-right font-mono text-lg text-indigo-700">${fmt(app.score)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Recommendation -->
      <div class="flex items-center justify-between p-4 rounded-lg border ${app.recommendation === 'Integrasi ke INA Digital' ? 'bg-emerald-50 border-emerald-200' : app.recommendation === 'Replikasi (Shared Service)' ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'}">
        <div>
          <p class="text-xs font-medium text-slate-500 uppercase tracking-wide">Rekomendasi Keputusan SPBE</p>
          <p class="font-bold text-slate-800 mt-0.5">${esc(app.recommendation)}</p>
        </div>
        <span class="${badgeClass} badge text-sm px-3 py-1.5 rounded-full font-semibold">${esc(app.recommendation)}</span>
      </div>
    </div>
  `;
  openModal('modal-detail');
};

/**
 * Open edit modal for dataset row
 */
window.openEditModal = function(idx) {
  const app = appData[idx];
  if (!app) return;
  document.getElementById('edit-index').value = idx;
  document.getElementById('edit-kode').value = app.kode;
  document.getElementById('edit-nama').value = app.nama;
  document.getElementById('edit-instansi').value = app.instansi;
  document.getElementById('edit-kategori').value = app.kategori;
  document.getElementById('edit-c1').value = app.c1;
  document.getElementById('edit-c2').value = app.c2;
  document.getElementById('edit-c3').value = app.c3;
  document.getElementById('edit-c4').value = app.c4;
  openModal('modal-edit-app');
};

/**
 * Delete an application row
 */
window.deleteApp = function(idx) {
  if (!confirm(`Hapus aplikasi "${appData[idx]?.nama}"?`)) return;
  appData.splice(idx, 1);
  calculateAll();
  showToast('Aplikasi berhasil dihapus.', 'success');
};

// ===========================================================================
// 8. FILTER DROPDOWNS
// ===========================================================================

function populateFilterDropdowns() {
  const categories = [...new Set(appData.map(a => a.kategori))].sort();
  const instansis = [...new Set(appData.map(a => a.instansi))].sort();

  const katSel = document.getElementById('filter-kategori');
  if (katSel) {
    katSel.innerHTML = '<option value="">Semua Kategori</option>' +
      categories.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
  }

  const insSel = document.getElementById('filter-instansi');
  if (insSel) {
    insSel.innerHTML = '<option value="">Semua Instansi</option>' +
      instansis.map(i => `<option value="${esc(i)}">${esc(i)}</option>`).join('');
  }
}

// ===========================================================================
// 9. AHP MATRIX SELECT INIT
// ===========================================================================

function initMatrixSelects() {
  for (const [r, c] of UPPER_PAIRS) {
    const sel = document.getElementById(`pw-${r}-${c}`);
    if (!sel) continue;
    sel.innerHTML = SAATY_OPTIONS.map(opt =>
      `<option value="${opt.value}">${opt.label}</option>`
    ).join('');
    sel.className = 'matrix-select border border-slate-300 rounded-md px-2 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-slate-800';
  }
  resetAHPSelects();
}

function resetAHPSelects() {
  const defaults = {
    'pw-0-1': '2', 'pw-0-2': '3', 'pw-0-3': '4',
    'pw-1-2': '2', 'pw-1-3': '3',
    'pw-2-3': '2'
  };
  for (const [id, val] of Object.entries(defaults)) {
    const sel = document.getElementById(id);
    if (sel) sel.value = val;
  }
}

// ===========================================================================
// 10. BADGE HELPER
// ===========================================================================

function getBadgeClass(recommendation) {
  if (recommendation === 'Integrasi ke INA Digital') return 'badge-integrasi';
  if (recommendation === 'Replikasi (Shared Service)') return 'badge-replikasi';
  return 'badge-decommissioned';
}

function esc(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===========================================================================
// 11. CSV IMPORT / EXPORT
// ===========================================================================

function parseAndLoadCSV(text) {
  const result = Papa.parse(text, { header: true, skipEmptyLines: true, dynamicTyping: false });
  if (!result.data || result.data.length === 0) {
    showToast('File CSV kosong atau tidak valid.', 'error');
    return false;
  }
  const required = ['Kode_Aplikasi','Nama_Aplikasi','Instansi_Pengelola','Kategori_SIA_SPBE','C1_Interoperabilitas_API','C2_Keunikan_Fungsi','C3_Efisiensi_Anggaran','C4_Keamanan_Siber_SDM'];
  const headers = result.meta.fields || [];
  const missing = required.filter(r => !headers.includes(r));
  if (missing.length > 0) {
    showToast(`Kolom tidak ditemukan: ${missing.join(', ')}`, 'error');
    return false;
  }
  appData = result.data.map(row => ({
    kode:     (row.Kode_Aplikasi || '').trim(),
    nama:     (row.Nama_Aplikasi || '').trim(),
    instansi: (row.Instansi_Pengelola || '').trim(),
    kategori: (row.Kategori_SIA_SPBE || '').trim(),
    c1: parseInt(row.C1_Interoperabilitas_API) || 0,
    c2: parseInt(row.C2_Keunikan_Fungsi) || 0,
    c3: parseInt(row.C3_Efisiensi_Anggaran) || 0,
    c4: parseInt(row.C4_Keamanan_Siber_SDM) || 0,
  })).filter(a => a.kode);
  return true;
}

function exportResultsCSV() {
  const cols = [
    { key: 'rank',           label: 'Peringkat' },
    { key: 'kode',           label: 'Kode_Aplikasi' },
    { key: 'nama',           label: 'Nama_Aplikasi' },
    { key: 'instansi',       label: 'Instansi_Pengelola' },
    { key: 'kategori',       label: 'Kategori_SIA_SPBE' },
    { key: 'c1',             label: 'C1_Interoperabilitas_API' },
    { key: 'c2',             label: 'C2_Keunikan_Fungsi' },
    { key: 'c3',             label: 'C3_Efisiensi_Anggaran' },
    { key: 'c4',             label: 'C4_Keamanan_Siber_SDM' },
    { key: 'w1',             label: 'V_C1xW1' },
    { key: 'w2',             label: 'V_C2xW2' },
    { key: 'w3',             label: 'V_C3xW3' },
    { key: 'w4',             label: 'V_C4xW4' },
    { key: 'score',          label: 'Total_Skor_AHP' },
    { key: 'recommendation', label: 'Rekomendasi_SPBE' },
  ];
  const data = rankedData.map(a => ({
    ...a,
    w1: fmt(a.weighted[0]), w2: fmt(a.weighted[1]), w3: fmt(a.weighted[2]), w4: fmt(a.weighted[3]),
    score: fmt(a.score),
  }));
  downloadFile(generateCSV(data, cols), 'SIA-Rasionalisasi-Hasil-AHP.csv');
  showToast('Ekspor CSV berhasil!', 'success');
}

function downloadDatasetCSV() {
  const cols = [
    { key: 'kode',     label: 'Kode_Aplikasi' },
    { key: 'nama',     label: 'Nama_Aplikasi' },
    { key: 'instansi', label: 'Instansi_Pengelola' },
    { key: 'kategori', label: 'Kategori_SIA_SPBE' },
    { key: 'c1',       label: 'C1_Interoperabilitas_API' },
    { key: 'c2',       label: 'C2_Keunikan_Fungsi' },
    { key: 'c3',       label: 'C3_Efisiensi_Anggaran' },
    { key: 'c4',       label: 'C4_Keamanan_Siber_SDM' },
  ];
  downloadFile(generateCSV(appData, cols), 'Dataset-SPBE-Aktif.csv');
  showToast('Dataset berhasil diunduh!', 'success');
}

function downloadTemplateCSV() {
  const header = 'Kode_Aplikasi,Nama_Aplikasi,Instansi_Pengelola,Kategori_SIA_SPBE,C1_Interoperabilitas_API,C2_Keunikan_Fungsi,C3_Efisiensi_Anggaran,C4_Keamanan_Siber_SDM';
  const example = 'APP-0001,Contoh Aplikasi,Kementerian Contoh,Layanan Publik (G2C),75,80,65,70';
  downloadFile(header + '\n' + example, 'Template-Dataset-SPBE.csv');
  showToast('Template CSV diunduh!', 'info');
}

// ===========================================================================
// 12. FALLBACK SEED DATA
// ===========================================================================

function generateFallbackData() {
  const instansis = ['Kementerian Kominfo','Kementerian Kesehatan','Kementerian Keuangan','Pemprov Jawa Barat','Pemkot Bandung','BUMN PLN'];
  const kategoris = ['Layanan Publik (G2C)','Administrasi Pemerintahan (G2G)','Layanan Bisnis/BUMN (G2B)','Layanan ASN (G2E)'];
  const result = [];
  for (let i = 1; i <= 20; i++) {
    result.push({
      kode: `APP-${String(i).padStart(4,'0')}`,
      nama: `Aplikasi Demo #${i}`,
      instansi: instansis[i % instansis.length],
      kategori: kategoris[i % kategoris.length],
      c1: Math.floor(Math.random() * 100),
      c2: Math.floor(Math.random() * 100),
      c3: Math.floor(Math.random() * 100),
      c4: Math.floor(Math.random() * 100),
    });
  }
  return result;
}

function showFallbackUI() {
  const area = document.getElementById('notification-area');
  if (!area) return;
  area.className = 'mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4';
  area.innerHTML = `
    <div class="flex items-start gap-3">
      <i class="fa-solid fa-triangle-exclamation text-amber-500 mt-0.5"></i>
      <div class="flex-1">
        <p class="font-semibold text-amber-800">Dataset CSV tidak dapat dimuat otomatis</p>
        <p class="text-sm text-amber-700 mt-1">File <code>Dataset_500_Aplikasi_SPBE_INA_Digital.csv</code> harus diakses melalui server lokal. Saat ini menampilkan <strong>data demo</strong>.</p>
        <div class="flex gap-2 mt-3">
          <label class="btn-primary text-xs px-3 py-1.5 rounded-lg cursor-pointer inline-flex items-center">
            <i class="fa-solid fa-upload mr-1.5"></i>Unggah File CSV
            <input type="file" id="fallback-upload" accept=".csv" class="hidden">
          </label>
          <button onclick="downloadTemplateCSV()" class="btn-outline text-xs px-3 py-1.5 rounded-lg">
            <i class="fa-solid fa-file-csv mr-1.5"></i>Unduh Template CSV
          </button>
        </div>
      </div>
    </div>
  `;
  area.classList.remove('hidden');

  document.getElementById('fallback-upload')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (parseAndLoadCSV(ev.target.result)) {
        populateFilterDropdowns();
        calculateAll();
        area.classList.add('hidden');
        showToast(`${appData.length} aplikasi berhasil dimuat dari ${file.name}`, 'success');
      }
    };
    reader.readAsText(file, 'UTF-8');
  });
}

// ===========================================================================
// 13. LANDING / WORKSPACE VIEW SWITCHING (Cross-page Navigation)
// ===========================================================================

/**
 * Navigate between index.html (landing) and workspace.html (workspace).
 * Since landing and workspace are now separate pages, we use window.location
 * with query parameters for deep linking to specific tabs.
 *
 * @param {string} view - 'landing' or 'workspace'
 * @param {string} targetTabId - optional tab id to open when switching to workspace
 */
function switchView(view, targetTabId) {
  if (view === 'workspace') {
    // Navigate to workspace.html with optional tab parameter
    const url = targetTabId ? `workspace.html?tab=${encodeURIComponent(targetTabId)}` : 'workspace.html';
    window.location.href = url;
  } else {
    // Navigate back to landing page (index.html)
    window.location.href = 'index.html';
  }
}

// Expose globally for inline handlers
window.switchView = switchView;

/**
 * Initialize workspace tab from URL parameter (for deep linking from landing page)
 */
function initWorkspaceFromURL() {
  const params = new URLSearchParams(window.location.search);
  const targetTab = params.get('tab');
  if (targetTab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    const targetBtn = document.getElementById(targetTab);
    const targetContent = document.getElementById(`content-${targetTab}`);
    if (targetBtn) targetBtn.classList.add('active');
    if (targetContent) targetContent.classList.add('active');

    // Re-render charts when showing dashboard
    if (targetTab === 'dashboard' && typeof renderCharts === 'function') {
      renderCharts();
    }
  }
}

// ===========================================================================
// 14. EVENT LISTENERS & INITIALIZATION
// ===========================================================================

document.addEventListener('DOMContentLoaded', () => {

  // --- Init AHP selects ---
  initMatrixSelects();

  // --- Fetch CSV ---
  // Gunakan base path yang tepat untuk GitHub Pages / static deployment
  // Lokal: fetch dari root, GitHub Pages: ambil base dari pathname
  const isGitHubPages = window.location.hostname.includes('github.io');
  const basePath = isGitHubPages ? window.location.pathname.match(/^\/[^/]*\//)?.[0] : '';
  const csvPath = basePath + 'Dataset_500_Aplikasi_SPBE_INA_Digital.csv';

  fetch(csvPath)
    .then(r => {
      if (!r.ok) throw new Error('Network response was not ok');
      return r.text();
    })
    .then(text => {
      if (parseAndLoadCSV(text)) {
        populateFilterDropdowns();
        calculateAll();
        showToast(`${appData.length} aplikasi SPBE berhasil dimuat.`, 'success');
      } else {
        appData = generateFallbackData();
        populateFilterDropdowns();
        calculateAll();
        showFallbackUI();
      }
    })
    .catch(() => {
      appData = generateFallbackData();
      populateFilterDropdowns();
      calculateAll();
      showFallbackUI();
    });

  // --- Tab switching ---
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`content-${tab}`)?.classList.add('active');
      // Re-render charts when switching to dashboard (canvas reuse prevention)
      if (tab === 'dashboard') {
        renderCharts();
      }
    });
  });

  // --- AHP Buttons ---
  document.getElementById('btn-recalculate')?.addEventListener('click', () => {
    calculateAll();
    showToast('Bobot dan perangkingan berhasil dihitung ulang.', 'success');
  });

  document.getElementById('btn-reset-ahp')?.addEventListener('click', () => {
    resetAHPSelects();
    calculateAll();
    showToast('Matriks direset ke standar SPBE default.', 'info');
  });

  // --- Ranking Filters ---
  const debouncedRender = debounce(() => { currentPage = 1; renderRankingTable(); }, 300);
  document.getElementById('search-ranking')?.addEventListener('input', debouncedRender);
  document.getElementById('filter-rekomendasi')?.addEventListener('change', () => { currentPage = 1; renderRankingTable(); });
  document.getElementById('filter-kategori')?.addEventListener('change', () => { currentPage = 1; renderRankingTable(); });
  document.getElementById('filter-instansi')?.addEventListener('change', () => { currentPage = 1; renderRankingTable(); });
  document.getElementById('per-page')?.addEventListener('change', (e) => {
    perPage = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
    currentPage = 1;
    renderRankingTable();
  });

  // --- Import CSV ---
  const triggerImport = () => document.getElementById('file-input-csv')?.click();
  document.getElementById('btn-import-csv')?.addEventListener('click', triggerImport);
  document.getElementById('file-input-csv')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (parseAndLoadCSV(ev.target.result)) {
        populateFilterDropdowns();
        calculateAll();
        showToast(`${appData.length} aplikasi berhasil diimpor dari ${file.name}`, 'success');
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  });

  // --- Upload CSV (Dataset Tab) ---
  document.getElementById('upload-csv')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (parseAndLoadCSV(ev.target.result)) {
        populateFilterDropdowns();
        calculateAll();
        showToast(`Dataset diperbarui: ${appData.length} aplikasi.`, 'success');
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  });

  // --- Export CSV ---
  document.getElementById('btn-export-csv')?.addEventListener('click', exportResultsCSV);

  // --- Download dataset & template ---
  document.getElementById('btn-download-dataset')?.addEventListener('click', downloadDatasetCSV);
  document.getElementById('btn-download-template')?.addEventListener('click', downloadTemplateCSV);

  // --- Landing Page CTA Buttons ---
  // Navigation CTA (top right)
  document.getElementById('landing-cta-primary')?.addEventListener('click', () => {
    switchView('workspace', 'tab-dashboard');
  });

  // Hero CTAs
  document.getElementById('hero-cta-simulasi')?.addEventListener('click', () => {
    switchView('workspace', 'tab-dashboard');
  });
  document.getElementById('hero-cta-kalibrasi')?.addEventListener('click', () => {
    switchView('workspace', 'tab-ahp');
  });

  // Preview frame CTA
  document.getElementById('preview-cta-enter')?.addEventListener('click', () => {
    switchView('workspace', 'tab-dashboard');
  });

  // Policy Matrix CTAs (Section 5)
  document.querySelectorAll('#kebijakan button[data-target-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.targetTab;
      const filter = btn.dataset.filter;
      switchView('workspace', tab);
      // Set filter after view switch
      setTimeout(() => {
        const filterSel = document.getElementById('filter-rekomendasi');
        if (filterSel && filter) {
          filterSel.value = filter;
          filterSel.dispatchEvent(new Event('change'));
        }
      }, 50);
    });
  });

  // Bottom Banner CTAs
  document.getElementById('banner-cta-workspace')?.addEventListener('click', () => {
    switchView('workspace', 'tab-dashboard');
  });
  document.getElementById('banner-cta-upload')?.addEventListener('click', () => {
    switchView('workspace', 'tab-dataset');
    // Trigger file input
    setTimeout(() => {
      document.getElementById('upload-csv')?.click();
    }, 50);
  });

  // Back to Landing button in workspace header
  document.getElementById('btn-back-to-landing')?.addEventListener('click', () => {
    switchView('landing');
  });

  // Smooth scroll for anchor links in landing nav
  document.querySelectorAll('#landing-nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update URL without scroll jump
        history.pushState(null, '', `#${targetId}`);
      }
    });
  });

  // Scroll spy for landing nav active state
  const landingNavLinks = document.querySelectorAll('#landing-nav .landing-nav-link');
  const landingSections = Array.from(landingNavLinks).map(link => document.getElementById(link.getAttribute('href').slice(1))).filter(Boolean);

  const activateNavLink = () => {
    const scrollY = window.scrollY + 120; // offset for sticky nav
    let current = landingSections.length - 1;
    for (let i = 0; i < landingSections.length; i++) {
      const section = landingSections[i];
      if (section.offsetTop > scrollY) {
        current = i > 0 ? i - 1 : 0;
        break;
      }
    }
    landingNavLinks.forEach((link, idx) => {
      if (idx === current) {
        link.classList.add('text-slate-900');
        link.classList.remove('text-slate-600');
      } else {
        link.classList.remove('text-slate-900');
        link.classList.add('text-slate-600');
      }
    });
  };

  window.addEventListener('scroll', activateNavLink, { passive: true });
  activateNavLink();

  // --- Add App Modal ---
  const openAdd = () => {
    document.getElementById('form-add-app')?.reset();
    openModal('modal-add-app');
  };
  document.getElementById('btn-add-app')?.addEventListener('click', openAdd);
  document.getElementById('btn-add-app-header')?.addEventListener('click', openAdd);

  document.getElementById('btn-submit-add-app')?.addEventListener('click', () => {
    const nama     = document.getElementById('add-nama')?.value.trim();
    const instansi = document.getElementById('add-instansi')?.value.trim();
    const kategori = document.getElementById('add-kategori')?.value;
    const c1 = parseInt(document.getElementById('add-c1')?.value);
    const c2 = parseInt(document.getElementById('add-c2')?.value);
    const c3 = parseInt(document.getElementById('add-c3')?.value);
    const c4 = parseInt(document.getElementById('add-c4')?.value);

    if (!nama || !instansi || !kategori || isNaN(c1) || isNaN(c2) || isNaN(c3) || isNaN(c4)) {
      showToast('Mohon lengkapi semua field.', 'warning');
      return;
    }
    if ([c1,c2,c3,c4].some(v => v < 0 || v > 100)) {
      showToast('Skor harus antara 0 dan 100.', 'warning');
      return;
    }

    const maxNum = appData.reduce((max, a) => {
      const n = parseInt(a.kode.replace('APP-', '')) || 0;
      return n > max ? n : max;
    }, 0);
    const kode = `APP-${String(maxNum + 1).padStart(4, '0')}`;

    appData.push({ kode, nama, instansi, kategori, c1, c2, c3, c4 });
    populateFilterDropdowns();
    calculateAll();
    closeModal('modal-add-app');
    showToast(`Aplikasi "${nama}" berhasil ditambahkan.`, 'success');
  });

  // --- Edit App Modal ---
  document.getElementById('btn-submit-edit-app')?.addEventListener('click', () => {
    const idx      = parseInt(document.getElementById('edit-index')?.value);
    const nama     = document.getElementById('edit-nama')?.value.trim();
    const instansi = document.getElementById('edit-instansi')?.value.trim();
    const kategori = document.getElementById('edit-kategori')?.value;
    const c1 = parseInt(document.getElementById('edit-c1')?.value);
    const c2 = parseInt(document.getElementById('edit-c2')?.value);
    const c3 = parseInt(document.getElementById('edit-c3')?.value);
    const c4 = parseInt(document.getElementById('edit-c4')?.value);

    if (!nama || !instansi || !kategori || isNaN(c1) || isNaN(c2) || isNaN(c3) || isNaN(c4)) {
      showToast('Mohon lengkapi semua field.', 'warning');
      return;
    }
    if ([c1,c2,c3,c4].some(v => v < 0 || v > 100)) {
      showToast('Skor harus antara 0 dan 100.', 'warning');
      return;
    }

    appData[idx] = { ...appData[idx], nama, instansi, kategori, c1, c2, c3, c4 };
    populateFilterDropdowns();
    calculateAll();
    closeModal('modal-edit-app');
    showToast(`Perubahan pada "${nama}" berhasil disimpan.`, 'success');
  });

  // --- Modal close (overlay + close buttons) ---
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });
  document.querySelectorAll('.modal-close, [data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.close || btn.closest('.modal-overlay')?.id;
      if (target) closeModal(target);
    });
  });

});
