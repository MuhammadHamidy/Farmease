import { defineComponent, ref } from 'vue';
import Typography from '@/shared/ui/Typography';

export default defineComponent({
  name: 'WeightHistory',
  props: { onClose: { type: Function, default: null } },
  setup(props) {
    const records = ref([
      { id: 1, ternak: 'D-001', date: '2026-03-01', weight: 40 },
      { id: 2, ternak: 'D-001', date: '2026-04-01', weight: 42 },
    ]);

    const form = ref({ ternak: '', date: '', weight: '' });

    const addRecord = () => {
      records.value.push({ id: Date.now(), ternak: form.value.ternak || 'D-000', date: form.value.date || new Date().toISOString().slice(0,10), weight: Number(form.value.weight) || 0 });
      form.value.ternak = '';
      form.value.date = '';
      form.value.weight = '';
    };

    return () => (
      <div class="p-3">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <Typography variant="h3" weight="bold">Riwayat Berat (FE-only)</Typography>
          <button class="btn btn-sm btn-outline-secondary" onClick={() => props.onClose?.()}>Tutup</button>
        </div>

        <div class="mb-3 row g-2">
          <div class="col-4"><input class="form-control" placeholder="ID Ternak" value={form.value.ternak} onInput={(e) => form.value.ternak = (e.target as HTMLInputElement).value} /></div>
          <div class="col-4"><input class="form-control" type="date" value={form.value.date} onInput={(e) => form.value.date = (e.target as HTMLInputElement).value} /></div>
          <div class="col-3"><input class="form-control" placeholder="Berat (kg)" value={form.value.weight} onInput={(e) => form.value.weight = (e.target as HTMLInputElement).value} /></div>
          <div class="col-1"><button class="btn btn-primary w-100" onClick={addRecord}>Tambah</button></div>
        </div>

        <div>
          <ul class="list-group">
            {records.value.map(r => (
              <li class="list-group-item d-flex justify-content-between" key={r.id}>
                <div>
                  <strong>{r.ternak}</strong>
                  <div class="text-muted" style={{ fontSize: '0.85rem' }}>{r.date}</div>
                </div>
                <div class="fw-bold">{r.weight} kg</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
});
