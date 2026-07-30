/**
 * Centralized Translation & Formatter Utility (i18n Mappers)
 * Farmease Peternakan & Kebun
 * 
 * Maps machine-readable normalized English backend enums and status codes
 * to user-friendly localized Indonesian UI text.
 */

// 1. Gender Translation Map
export const formatGender = (gender?: string): string => {
  if (!gender) return '—';
  const lower = gender.toLowerCase().trim();
  if (lower === 'male' || lower === 'jantan') return 'Jantan (Pejantan)';
  if (lower === 'female' || lower === 'betina') return 'Betina (Indukan)';
  return gender;
};

// 2. Sheep Status Translation Map
export const formatSheepStatus = (status?: string): string => {
  if (!status) return '—';
  const lower = status.toLowerCase().trim();
  switch (lower) {
    case 'active':
    case 'aktif':
      return 'Aktif';
    case 'pregnant':
    case 'hamil':
      return 'Hamil';
    case 'sold':
    case 'dijual':
    case 'terjual':
      return 'Terjual';
    case 'deceased':
    case 'mati':
      return 'Mati';
    case 'slaughtered':
    case 'disembelih':
      return 'Disembelih';
    case 'sick':
    case 'sakit':
      return 'Sakit';
    case 'external':
    case 'eksternal':
      return 'Donor Eksternal';
    case 'productive':
    case 'produktif':
      return 'Produktif';
    default:
      return status;
  }
};

// 3. Mating Readiness & Status Code Translation Map
export const formatMatingReadiness = (readinessCode?: string, defaultStatus?: string): string => {
  const code = (readinessCode || defaultStatus || '').trim();
  if (!code) return 'Belum Pencatatan Birahi';

  const upper = code.toUpperCase();
  if (upper === 'MATING_READY' || code === 'Siap Kawin' || code === 'Birahi (Siap Kawin)' || code === 'Ya (Siap Kawin / Birahi)') {
    return 'Ya (Siap Kawin / Birahi)';
  }
  if (upper === 'UNDERAGE' || code === 'Tidak (Belum Cukup Umur)') {
    return 'Tidak (Belum Cukup Umur)';
  }
  if (upper === 'PREGNANT' || code === 'Tidak (Sedang Hamil)') {
    return 'Tidak (Sedang Hamil)';
  }
  if (upper === 'SICK' || code === 'Tidak (Sedang Sakit)') {
    return 'Tidak (Sedang Sakit)';
  }
  if (upper === 'NOT_IN_HEAT' || code === 'Tidak Birahi') {
    return 'Tidak Birahi';
  }
  if (upper === 'IN_MATING_PROCESS' || code === 'Tidak (Sedang Kawin/Proses)') {
    return 'Tidak (Sedang Kawin / Proses)';
  }
  if (upper === 'PENDING_APPROVAL' || code === 'Tidak (Menunggu Persetujuan Kawin)') {
    return 'Tidak (Menunggu Persetujuan Kawin)';
  }
  if (upper === 'NOT_READY' || code === 'Tidak (Belum Siap / Sedang Pemulihan)') {
    return 'Tidak (Belum Siap / Sedang Pemulihan)';
  }
  if (upper === 'NOT_APPLICABLE') {
    return 'Tidak Berlaku';
  }

  return code;
};

// 4. Mating Method Translation Map
export const formatMatingMethod = (method?: string): string => {
  if (!method) return '—';
  const lower = method.toLowerCase().trim();
  if (lower === 'natural' || lower === 'alami' || lower === 'kawin alam' || lower === 'kawin alami') {
    return 'Kawin Alam';
  }
  if (lower === 'artificial_insemination' || lower === 'artificial' || lower === 'ib' || lower === 'inseminasi buatan') {
    return 'Inseminasi Buatan (IB)';
  }
  return method;
};

// 5. Inbreeding Risk Category Translation Map
export const formatRiskCategory = (category?: string, level?: string): string => {
  const cat = (category || level || '').toUpperCase().trim();
  switch (cat) {
    case 'VERY_HIGH':
    case 'SANGAT TINGGI':
      return 'Sangat Tinggi';
    case 'HIGH':
    case 'TINGGI':
      return 'Tinggi';
    case 'MEDIUM':
    case 'AMBANG BATAS':
      return 'Ambang Batas';
    case 'LOW':
    case 'RENDAH':
      return 'Rendah';
    case 'VERY_LOW':
    case 'SAFE':
    case 'SANGAT RENDAH':
      return 'Sangat Rendah';
    default:
      return category || 'Tidak Diketahui';
  }
};

// 6. Pregnancy Status Translation Map
export const formatPregnancyStatus = (status?: string): string => {
  if (!status) return '—';
  const lower = status.toLowerCase().trim();
  switch (lower) {
    case 'gestating':
    case 'dikandung':
    case 'proses':
      return 'Dalam Kandungan (Hamil)';
    case 'delivered':
    case 'melahirkan':
    case 'sukses':
      return 'Melahirkan';
    case 'miscarried':
    case 'keguguran':
    case 'gagal':
      return 'Keguguran';
    default:
      return status;
  }
};

// 7. General Task Status Translation Map
export const formatTaskStatus = (status?: string): string => {
  if (!status) return '—';
  const lower = status.toLowerCase().trim();
  switch (lower) {
    case 'pending':
    case 'belum':
      return 'Belum';
    case 'in_progress':
    case 'proses':
      return 'Sedang Berlangsung';
    case 'completed':
    case 'done':
    case 'selesai':
      return 'Selesai';
    case 'overdue':
    case 'terlambat':
      return 'Terlambat';
    default:
      return status;
  }
};
