import { defineComponent, computed, type PropType } from 'vue';
import Typography from '@/shared/ui/Typography';
import { pencatatanSubmissions } from '@/modules/ternak/store/operatorAdmin';

export default defineComponent({
  name: 'CageConditionChart',
  props: {
    cagesList: { type: Array as PropType<any[]>, required: true },
    sheepList: { type: Array as PropType<any[]>, required: true },
  },
  setup(props) {
    const checkIsSheepBirahi = (s: any) => {
      let hasCheckedEstrus = false;
      let latestEstrusCheck: string | null = null;
      let latestTime = 0;
      
      pencatatanSubmissions.value.forEach(sub => {
        if (sub.approvalStatus === 'rejected') return;
        const dataObj: any = (sub.payload as any)?.data || sub.payload;
        const items = dataObj?.items || [];
        items.forEach((item: any) => {
          if ((item.name === 'Cek Birahi' || item.name === 'Pencatatan Birahi') && (String(item.targetId) === String(s.code) || String(item.targetId) === String(s.id))) {
            hasCheckedEstrus = true;
            const time = sub.submittedAt ? new Date(sub.submittedAt).getTime() : Date.now();
            if (time > latestTime) {
              latestTime = time;
              latestEstrusCheck = item.hasilPemeriksaan || '';
            }
          }
        });
      });

      if (hasCheckedEstrus && latestEstrusCheck) {
        return latestEstrusCheck === 'birahi';
      }
      return !!s.is_ready_to_mate || s.mating_status === 'Birahi (Siap Kawin)';
    };

    const cagesData = computed(() => {
      const activeSheep = props.sheepList.filter(s => !['Mati', 'Terjual', 'Disembelih'].includes(s.status));
      
      return props.cagesList.map(cage => {
        const cageSheep = activeSheep.filter(s => s.cage_code === cage.code);
        const count = cageSheep.length;
        const capacity = cage.capacity || 15;
        const percentage = Math.min((count / capacity) * 100, 100);
        
        // Status breakdown
        const healthy = cageSheep.filter(s => s.status === 'Sehat' && !checkIsSheepBirahi(s)).length;
        const pregnant = cageSheep.filter(s => s.status === 'Hamil' || s.status === 'hamil').length;
        const birahi = cageSheep.filter(s => checkIsSheepBirahi(s)).length;
        const sick = cageSheep.filter(s => s.status === 'Sakit' || s.status === 'sakit').length;
        
        // Warning level based on density
        let progressColor = '#34a853'; // Green safe
        let warningText = 'Aman';
        if (count > capacity) {
          progressColor = '#ea4335'; // Red overcrowded
          warningText = 'Penuh (Overcap)';
        } else if (count >= capacity * 0.8) {
          progressColor = '#fbbc05'; // Orange warning
          warningText = 'Padat';
        }

        return {
          ...cage,
          count,
          capacity,
          percentage,
          progressColor,
          warningText,
          breakdown: { healthy, pregnant, birahi, sick }
        };
      });
    });

    return () => (
      <div class="bg-white rounded-5 border shadow-sm p-4 p-md-5 h-100">
        <div class="d-flex align-items-center justify-content-between mb-4 gap-3">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <img src="/icon/kandang.png" alt="Kandang" style={{ width: '22px', height: '22px', objectFit: 'contain', opacity: 0.7 }} />
              <Typography variant="h4" weight="extrabold" className="m-0">Kondisi & Kepadatan Kandang</Typography>
            </div>
            <Typography variant="p" size="text-xs" color="secondary" className="m-0">
              Rasio kapasitas kandang dan persebaran status kesehatan domba
            </Typography>
          </div>
        </div>

        <div class="d-flex flex-column gap-4">
          {cagesData.value.length === 0 ? (
            <div class="text-center py-5 text-secondary">
              <p class="m-0">Tidak ada data kandang terdaftar</p>
            </div>
          ) : (
            cagesData.value.map(c => (
              <div key={c.id} class="p-3 rounded-4 border bg-light-hover transition-all" style={{ backgroundColor: '#FAF9F6' }}>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <span class="fw-bold text-dark fs-6 d-block">{c.name}</span>
                    <span class="text-muted small">Tipe: {c.type === 'koloni' ? 'Koloni (Grup)' : 'Baterai (Individu)'}</span>
                  </div>
                  <div class="text-end">
                    <span class="badge rounded-pill px-2.5 py-1 text-white fw-bold" style={{ backgroundColor: c.progressColor, fontSize: '0.72rem' }}>
                      {c.count} / {c.capacity} Ekor ({c.warningText})
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div class="w-100 bg-secondary-subtle rounded-pill mb-3" style={{ height: '8px', overflow: 'hidden' }}>
                  <div 
                    class="h-100 rounded-pill transition-all" 
                    style={{ width: `${c.percentage}%`, backgroundColor: c.progressColor }}
                  />
                </div>

                {/* Status Breakdown Row */}
                <div class="row g-2 text-center" style={{ fontSize: '0.75rem' }}>
                  <div class="col-3">
                    <div class="bg-white rounded-3 py-1 border border-light-cream">
                      <span class="text-muted d-block small">Sehat</span>
                      <strong class="text-success">{c.breakdown.healthy}</strong>
                    </div>
                  </div>
                  <div class="col-3">
                    <div class="bg-white rounded-3 py-1 border border-light-cream">
                      <span class="text-muted d-block small">Hamil</span>
                      <strong class="text-warning">{c.breakdown.pregnant}</strong>
                    </div>
                  </div>
                  <div class="col-3">
                    <div class="bg-white rounded-3 py-1 border border-light-cream">
                      <span class="text-muted d-block small">Birahi</span>
                      <strong class="text-primary">{c.breakdown.birahi}</strong>
                    </div>
                  </div>
                  <div class="col-3">
                    <div class="bg-white rounded-3 py-1 border border-light-cream">
                      <span class="text-muted d-block small">Sakit</span>
                      <strong class="text-danger">{c.breakdown.sick}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
});
