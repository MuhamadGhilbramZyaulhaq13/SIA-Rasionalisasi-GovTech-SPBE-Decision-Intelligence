import numpy as np
import pandas as pd
from datetime import datetime

rng = np.random.default_rng()
n_data = 500

prefixes = ["SIM", "e-", "SI-", "Portal ", "Smart ", "Digi", "Aplikasi ", "Dashboard ", "Layanan ", "Sistem "]
domains = [
    "Kepegawaian", "Perizinan", "Pengaduan", "Arsip", "Anggaran", "Aset", "Logistik", "Pengadaan",
    "Kesehatan", "Pendidikan", "Pajak", "Retribusi", "Kependudukan", "Sosial", "Pariwisata",
    "Kinerja", "Monitoring", "Pelaporan", "Hukum", "Informasi", "Keuangan", "Audit", "Tata Ruang",
    "Lingkungan", "Pertanian", "Perhubungan", "Komunikasi", "Statistik", "Mitigasi", "Pelayanan"
]
instansi_list = [
    "Kementerian BUMN", "Kementerian Keuangan", "Kementerian PANRB", "Kementerian Kominfo",
    "Kementerian Kesehatan", "Kementerian Pendidikan", "Pemprov Jawa Barat", "Pemkab Bekasi",
    "Pemkot Bandung", "Pemprov DKI Jakarta", "BUMN Perum Peruri", "BUMN Telkom", "BUMN Mandiri",
    "BUMN BRI", "BUMN PLN", "BUMN Pertamina", "Kementerian Dalam Negeri", "Kementerian Hukum",
    "Pemkot Cimahi", "Pemkab Purwakarta"
]
kategori_layanan = [
    "Layanan Publik (G2C)", "Administrasi Pemerintahan (G2G)", "Layanan Bisnis/BUMN (G2B)", "Layanan ASN (G2E)"
]

# Acak proporsi distribusi tier di setiap eksekusi
p_high = rng.uniform(0.18, 0.28)
p_med = rng.uniform(0.35, 0.45)
p_low = 1.0 - (p_high + p_med)

rows = []
for i in range(1, n_data + 1):
    kode = f"APP-{i:04d}"
    pref = rng.choice(prefixes)
    dom = rng.choice(domains)
    inst = rng.choice(instansi_list)
    kat = rng.choice(kategori_layanan, p=[0.35, 0.30, 0.15, 0.20])
    nama = f"{pref}{dom} ({inst.split()[-1]}) #{i}"
    
    tier = rng.choice(["High", "Medium", "Low"], p=[p_high, p_med, p_low])
    if tier == "High":
        c1, c2, c3, c4 = rng.integers(78, 100), rng.integers(75, 98), rng.integers(70, 96), rng.integers(75, 98)
    elif tier == "Medium":
        c1, c2, c3, c4 = rng.integers(50, 79), rng.integers(45, 76), rng.integers(50, 80), rng.integers(50, 78)
    else:
        c1, c2, c3, c4 = rng.integers(15, 52), rng.integers(10, 48), rng.integers(15, 52), rng.integers(20, 55)

    rows.append({
        "Kode_Aplikasi": kode,
        "Nama_Aplikasi": nama,
        "Instansi_Pengelola": inst,
        "Kategori_SIA_SPBE": kat,
        "C1_Interoperabilitas_API": int(c1),
        "C2_Keunikan_Fungsi": int(c2),
        "C3_Efisiensi_Anggaran": int(c3),
        "C4_Keamanan_Siber_SDM": int(c4)
    })

df = pd.DataFrame(rows)

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
nama_file_unik = f"Dataset_500_Aplikasi_SPBE_{timestamp}.csv"

df.to_csv(nama_file_unik, index=False)

print(f"Berhasil membuat dataset baru yang unik: {nama_file_unik}")
