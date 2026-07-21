import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import Typography from '@/shared/ui/Typography';

export default defineComponent({
  name: 'DashboardStats',
  props: {
    totalAnimals: { type: Number, required: true },
    healthyAnimals: { type: Number, required: true },
    pregnantAnimals: { type: Number, required: true },
    birahiAnimals: { type: Number, required: true },
    sickAnimals: { type: Number, required: true },
  },
  setup(props) {
    const router = useRouter();

    const handleNavigate = (statusFilter?: string) => {
      if (statusFilter) {
        router.push({ name: 'ternak-daftar', query: { status: statusFilter } });
      } else {
        router.push({ name: 'ternak-daftar' });
      }
    };

    const statusItems = [
      { label: 'Total Populasi Ternak', value: props.totalAnimals, icon: '/icon/domba.png', color: '#3d2f24', bg: '#f4ebe4', filter: undefined },
      { label: 'Domba Sehat', value: props.healthyAnimals, icon: '/icon/sheep_kesehatan.png', color: '#198754', bg: '#e8f5e9', filter: 'Sehat' },
      { label: 'Domba Hamil', value: props.pregnantAnimals, icon: '/icon/sheep_hamil.png', color: '#ff9800', bg: '#fff3e0', filter: 'Hamil' },
      { label: 'Domba Birahi', value: props.birahiAnimals, icon: '/icon/catat_kawin.png', color: '#795548', bg: '#efebe9', filter: 'Birahi', filterHue: 'hue-rotate(240deg)' },
      { label: 'Domba Sakit', value: props.sickAnimals, icon: '/icon/warning.png', color: '#dc3545', bg: '#ffebee', filter: 'Sakit' },
    ];

    return () => (
      <div class="bg-white rounded-5 border shadow-sm p-4 p-md-5 h-100 text-start">
        <div class="d-flex align-items-center gap-2 mb-3">
          <img src="/icon/domba.png" alt="Populasi" style={{ width: '22px', height: '22px', objectFit: 'contain', opacity: 0.7 }} />
          <Typography variant="h4" weight="extrabold" className="m-0">Ringkasan Populasi Ternak</Typography>
        </div>
        <Typography variant="p" size="text-xs" color="secondary" className="d-block mb-4">
          Klik pada baris status untuk melihat daftar domba secara detail.
        </Typography>

        <div class="table-responsive rounded-4 overflow-hidden border">
          <table class="table table-hover align-middle mb-0" style={{ cursor: 'pointer' }}>
            <thead class="table-light">
              <tr>
                <th scope="col" style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6c757d', padding: '1rem 1.25rem' }}>Status Kesehatan</th>
                <th scope="col" class="text-end" style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6c757d', padding: '1rem 1.25rem', width: '120px' }}>Jumlah</th>
                <th scope="col" class="text-end" style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6c757d', padding: '1rem 1.25rem', width: '100px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {statusItems.map(item => (
                <tr 
                  key={item.label}
                  onClick={() => handleNavigate(item.filter)}
                  style={{ transition: 'all 0.2s' }}
                >
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <div class="d-flex align-items-center gap-3">
                      <div class="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', backgroundColor: item.bg, flexShrink: 0 }}>
                        <img src={item.icon} style={{ width: '18px', height: '18px', objectFit: 'contain', filter: item.filterHue }} />
                      </div>
                      <span class="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>{item.label}</span>
                    </div>
                  </td>
                  <td class="text-end fw-extrabold text-dark" style={{ padding: '0.9rem 1.25rem', fontSize: '1.05rem', color: item.color }}>
                    {item.value} <span class="small text-muted fw-normal" style={{ fontSize: '0.8rem' }}>Ekor</span>
                  </td>
                  <td class="text-end" style={{ padding: '0.9rem 1.25rem' }}>
                    <span class="fw-bold" style={{ color: '#8B5A2B', fontSize: '0.85rem' }}>
                      Lihat →
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
});
