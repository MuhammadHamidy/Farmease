/**
 * Returns the appropriate icon src for a given Jenis Pencatatan label.
 */
export function getJenisIcon(jenis: string): string {
  const lower = jenis.toLowerCase()
  if (lower.includes('panen')) return '/icon/Property 1=panen.png'
  if (lower.includes('penanaman') || lower.includes('bibit')) return '/icon/Property 1=bibit.png'
  if (lower.includes('pemangkasan') || lower.includes('prunning')) return '/icon/Property 1=prunning.png'
  if (lower.includes('perawatan') || lower.includes('hama') || lower.includes('obat')) return '/icon/catat_sehat.png'
  if (lower.includes('pemupukan') || lower.includes('pupuk')) return '/icon/rumput.png'
  return '/icon/document.png'
}

/**
 * Returns the icon for a recording form card header based on form type.
 */
export function getFormIcon(kindTitle: string): string {
  switch (kindTitle) {
    case 'Panen': return '/icon/Property 1=panen.png'
    case 'Penanaman': return '/icon/Property 1=bibit.png'
    case 'Pemangkasan': return '/icon/Property 1=prunning.png'
    case 'Pemberian Obat': return '/icon/catat_sehat.png'
    case 'Pemupukan': return '/icon/rumput.png'
    default: return '/icon/document.png'
  }
}
