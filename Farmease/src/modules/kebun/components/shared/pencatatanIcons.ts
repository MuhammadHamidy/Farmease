/**
 * Returns the appropriate icon src for a given Jenis Pencatatan label.
 */
export function getJenisIcon(jenis: string): string {
  const lower = jenis.toLowerCase()
  if (lower.includes('panen')) return '/icon/document.png'
  if (lower.includes('penanaman') || lower.includes('bibit')) return '/icon/lahan.png'
  if (lower.includes('pemangkasan') || lower.includes('prunning') || lower.includes('ranting') || lower.includes('gulma')) return '/icon/rumput.png'
  if (lower.includes('perawatan') || lower.includes('hama') || lower.includes('obat') || lower.includes('penyakit')) return '/icon/catat_sehat.png'
  if (lower.includes('pemupukan') || lower.includes('pupuk')) return '/icon/lahan.png'
  if (lower.includes('pembuahan') || lower.includes('perangsang')) return '/icon/document.png'
  if (lower.includes('pembersihan') || lower.includes('limbah')) return '/icon/document.png'
  return '/icon/document.png'
}

/**
 * Returns the icon for a recording form card header based on form type.
 */
export function getFormIcon(kindTitle: string): string {
  switch (kindTitle) {
    case 'Panen':
    case 'Pembuahan':    return '/icon/document.png'
    case 'Penanaman':    return '/icon/lahan.png'
    case 'Pemangkasan':  return '/icon/rumput.png'
    case 'Pemberian Obat':
    case 'Perawatan':
    case 'Pengendalian Hama & Penyakit': return '/icon/catat_sehat.png'
    case 'Pemupukan':    return '/icon/lahan.png'
    case 'Pembersihan':  return '/icon/document.png'
    default:             return '/icon/document.png'
  }
}
