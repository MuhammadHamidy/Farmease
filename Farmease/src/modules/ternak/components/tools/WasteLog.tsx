import { defineComponent, ref } from 'vue';
import Typography from '@/shared/ui/Typography';

export default defineComponent({
  name: 'WasteLog',
  props: { onClose: { type: Function, default: null } },
  setup(props) {
    const records = ref([
      { id: 1, date: '2026-04-01', qty: 10, unit: 'kg' },
    ]);

    const form = ref({ date: '', qty: '' });

    const add = () => {
      records.value.push({ id: Date.now(), date: form.value.date || new Date().toISOString().slice(0,10), qty: Number(form.value.qty) || 0, unit: 'kg' });
      form.value.date = '';
      form.value.qty = '';
    };

    return () => (
      <div class="p-3">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <Typography variant="h3" weight="bold">Catatan Kotoran (FE-only)</Typography>
          <button class="btn btn-sm btn-outline-secondary" onClick={() => props.onClose?.()}>Tutup</button>
        </div>

        <div class="row g-2 mb-3">
          <div class="col-6"><input class="form-control" type="date" value={form.value.date} onInput={(e) => form.value.date = (e.target as HTMLInputElement).value} /></div>
          <div class="col-4"><input class="form-control" placeholder="Jumlah (kg)" value={form.value.qty} onInput={(e) => form.value.qty = (e.target as HTMLInputElement).value} /></div>
          <div class="col-2"><button class="btn btn-primary w-100" onClick={add}>Tambah</button></div>
        </div>

        <ul class="list-group">
          {records.value.map(r => (
            <li class="list-group-item d-flex justify-content-between" key={r.id}>
              <div>{r.date}</div>
              <div class="fw-bold">{r.qty} {r.unit}</div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
});
