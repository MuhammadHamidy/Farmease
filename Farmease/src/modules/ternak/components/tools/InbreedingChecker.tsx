import { defineComponent, ref } from 'vue';
import Typography from '@/shared/ui/Typography';

// FE-only simple pedigree overlap checker (mock)
export default defineComponent({
  name: 'InbreedingChecker',
  props: { onClose: { type: Function, default: null } },
  setup(props) {
    const form = ref({ id1: '', id2: '' });
    const result = ref<string | null>(null);

    // mock pedigree map
    const pedigree: Record<string, string[]> = {
      'D-001': ['D-X01', 'D-Y01'],
      'D-002': ['D-X02', 'D-Y02'],
      'D-003': ['D-X01', 'D-Y03'],
    };

    const check = () => {
      const p1 = pedigree[form.value.id1] || [];
      const p2 = pedigree[form.value.id2] || [];
      const overlap = p1.filter(x => p2.includes(x));
      if (overlap.length) result.value = `Peringatan: Kedua ternak berbagi ancestor: ${overlap.join(', ')}`;
      else result.value = 'Tidak terdeteksi hubungan darah dekat (FE-only).';
    };

    return () => (
      <div class="p-3">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <Typography variant="h3" weight="bold">Cek Perkawinan Sedarah (FE-only)</Typography>
          <button class="btn btn-sm btn-outline-secondary" onClick={() => props.onClose?.()}>Tutup</button>
        </div>

        <div class="row g-2 mb-3">
          <div class="col-5"><input class="form-control" placeholder="ID Ternak 1" value={form.value.id1} onInput={(e) => form.value.id1 = (e.target as HTMLInputElement).value} /></div>
          <div class="col-5"><input class="form-control" placeholder="ID Ternak 2" value={form.value.id2} onInput={(e) => form.value.id2 = (e.target as HTMLInputElement).value} /></div>
          <div class="col-2"><button class="btn btn-primary w-100" onClick={check}>Cek</button></div>
        </div>

        {result.value && (
          <div class="alert alert-warning">{result.value}</div>
        )}
      </div>
    );
  }
});
