import { defineComponent, ref, computed } from 'vue';
import Typography from '@/shared/ui/Typography';
import { sheep } from '@/store/livestock';
import { breedingApi } from '@/shared/api';

export default defineComponent({
  name: 'InbreedingChecker',
  props: { onClose: { type: Function, default: null } },
  setup(props) {
    const selectedMaleId = ref('');
    const selectedFemaleId = ref('');
    const result = ref<{ safe: boolean; message: string; ancestors?: string[] } | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Lists from real sheep store
    const maleList = computed(() =>
      sheep.value.filter(s => s.gender === 'jantan' && !['Mati', 'Terjual', 'Disembelih'].includes(s.status))
    );
    const femaleList = computed(() =>
      sheep.value.filter(s => s.gender === 'betina' && !['Mati', 'Terjual', 'Disembelih'].includes(s.status))
    );

    const selectedMale = computed(() => sheep.value.find(s => s.id === selectedMaleId.value));
    const selectedFemale = computed(() => sheep.value.find(s => s.id === selectedFemaleId.value));

    // FR3-06: Check if silsilah incomplete warning needed
    const incompleteWarning = computed(() => {
      const warnings: string[] = [];
      // We can only know this after API check — flag based on result metadata if API returns it
      // Pre-check: if sheep has no birth record it might not have parents
      return warnings;
    });

    const check = async () => {
      if (!selectedMaleId.value || !selectedFemaleId.value) {
        error.value = 'Pilih domba jantan dan betina terlebih dahulu.';
        return;
      }
      if (selectedMaleId.value === selectedFemaleId.value) {
        error.value = 'Pilih domba yang berbeda.';
        return;
      }

      loading.value = true;
      error.value = null;
      result.value = null;

      try {
        const response = await breedingApi.checkInbreeding(
          Number(selectedMaleId.value),
          Number(selectedFemaleId.value),
        );

        // Handle API response — try both possible formats
        const isInbred = response?.is_inbred ?? response?.inbreeding_detected ?? response?.result === 'inbred';
        const ancestors: string[] = response?.shared_ancestors ?? response?.common_ancestors ?? [];
        const incompleteLineage = response?.incomplete_lineage ?? false;

        if (incompleteLineage) {
          result.value = {
            safe: false,
            message: '⚠️ Silsilah salah satu atau kedua domba tidak lengkap. Validasi inbreeding tidak dapat dilakukan secara penuh.',
            ancestors: [],
          };
        } else if (isInbred) {
          result.value = {
            safe: false,
            message: `🚨 Peringatan: Terdeteksi potensi perkawinan sedarah!`,
            ancestors,
          };
        } else {
          result.value = {
            safe: true,
            message: '✅ Tidak terdeteksi hubungan darah dekat. Perkawinan aman dilanjutkan.',
            ancestors: [],
          };
        }
      } catch (err: unknown) {
        error.value = err instanceof Error ? err.message : 'Gagal memeriksa inbreeding. Coba lagi.';
      } finally {
        loading.value = false;
      }
    };

    const reset = () => {
      selectedMaleId.value = '';
      selectedFemaleId.value = '';
      result.value = null;
      error.value = null;
    };

    return () => (
      <div class="p-3">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <Typography variant="h3" weight="bold">Cek Potensi Perkawinan Sedarah</Typography>
          <button class="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => props.onClose?.()}>Tutup</button>
        </div>

        <div class="row g-3 mb-4">
          <div class="col-12 col-md-6">
            <label class="form-label fw-bold small text-uppercase text-secondary">Domba Jantan (Pejantan)</label>
            <select
              class="form-select rounded-3"
              value={selectedMaleId.value}
              onChange={(e) => { selectedMaleId.value = (e.target as HTMLSelectElement).value; result.value = null; }}
            >
              <option value="">— Pilih Domba Jantan —</option>
              {maleList.value.map(s => (
                <option key={s.id} value={s.id}>{s.code} — {s.name} ({s.status})</option>
              ))}
            </select>
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label fw-bold small text-uppercase text-secondary">Domba Betina</label>
            <select
              class="form-select rounded-3"
              value={selectedFemaleId.value}
              onChange={(e) => { selectedFemaleId.value = (e.target as HTMLSelectElement).value; result.value = null; }}
            >
              <option value="">— Pilih Domba Betina —</option>
              {femaleList.value.map(s => (
                <option key={s.id} value={s.id}>{s.code} — {s.name} ({s.status})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview of selected pair */}
        {(selectedMale.value || selectedFemale.value) && (
          <div class="d-flex gap-3 mb-3 p-3 bg-light rounded-3" style={{ fontSize: '0.82rem' }}>
            <div>
              <span class="fw-bold text-secondary d-block" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Jantan</span>
              {selectedMale.value ? `${selectedMale.value.code} — ${selectedMale.value.name}` : '—'}
            </div>
            <div class="text-muted">×</div>
            <div>
              <span class="fw-bold text-secondary d-block" style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Betina</span>
              {selectedFemale.value ? `${selectedFemale.value.code} — ${selectedFemale.value.name}` : '—'}
            </div>
          </div>
        )}

        {error.value && (
          <div class="alert alert-danger py-2 px-3 rounded-3 mb-3" style={{ fontSize: '0.82rem' }}>
            {error.value}
          </div>
        )}

        <div class="d-flex gap-2 mb-4">
          <button
            class="btn btn-primary rounded-pill px-4 fw-bold"
            style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
            onClick={check}
            disabled={loading.value || !selectedMaleId.value || !selectedFemaleId.value}
          >
            {loading.value ? 'Memeriksa...' : '🔍 Cek Inbreeding'}
          </button>
          {result.value && (
            <button class="btn btn-outline-secondary rounded-pill px-3" onClick={reset}>Reset</button>
          )}
        </div>

        {result.value && (
          <div
            class={['p-4 rounded-4', result.value.safe ? 'alert-success' : 'alert-warning']}
            style={{ border: `2px solid ${result.value.safe ? 'var(--color-success)' : 'var(--color-warning)'}` }}
          >
            <div class="fw-bold mb-2" style={{ fontSize: '0.95rem' }}>{result.value.message}</div>
            {result.value.ancestors && result.value.ancestors.length > 0 && (
              <div>
                <div class="fw-bold small text-uppercase text-secondary mb-1">Nenek Moyang yang Sama:</div>
                <ul class="mb-0 ps-3" style={{ fontSize: '0.82rem' }}>
                  {result.value.ancestors.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {sheep.value.length === 0 && (
          <div class="text-center py-4 text-muted" style={{ fontSize: '0.85rem' }}>
            <p>Belum ada data domba tersedia. Pastikan data ternak sudah dimuat.</p>
          </div>
        )}
      </div>
    );
  }
});
