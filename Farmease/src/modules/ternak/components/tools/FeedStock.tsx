import { defineComponent, ref } from 'vue';
import Typography from '@/shared/ui/Typography';

export default defineComponent({
  name: 'FeedStock',
  props: { onClose: { type: Function, default: null } },
  setup(props) {
    const stocks = ref([
      { id: 'FS-001', name: 'Rumput Segar', qty: 120, unit: 'kg' },
      { id: 'FS-002', name: 'Konsentrat', qty: 45, unit: 'kg' },
    ]);

    const form = ref({ source: '', amount: '', unit: 'kg', converted: '' });

    const addConversion = () => {
      const id = `FS-${Date.now().toString().slice(-4)}`;
      const amt = Number(form.value.amount) || 0;
      stocks.value.push({ id, name: form.value.source || 'Hasil Panen', qty: amt, unit: form.value.unit });
      form.value.source = '';
      form.value.amount = '';
      form.value.converted = '';
    };

    return () => (
      <div class="p-3">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <Typography variant="h3" weight="bold">Stok Pakan (FE-only)</Typography>
          <button class="btn btn-sm btn-outline-secondary" onClick={() => props.onClose?.()}>Tutup</button>
        </div>

        <div class="mb-3">
          <label class="form-label">Sumber Hasil</label>
          <input class="form-control mb-2" value={form.value.source} onInput={(e) => form.value.source = (e.target as HTMLInputElement).value} />
          <div class="d-flex gap-2">
            <input class="form-control" placeholder="Jumlah" value={form.value.amount} onInput={(e) => form.value.amount = (e.target as HTMLInputElement).value} />
            <select class="form-select" value={form.value.unit} onInput={(e) => form.value.unit = (e.target as HTMLSelectElement).value}>
              <option>kg</option>
              <option>ikat</option>
              <option>liter</option>
            </select>
          </div>
          <div class="mt-2 text-end">
            <button class="btn btn-sm btn-primary" onClick={addConversion}>Konversi & Tambah ke Stok</button>
          </div>
        </div>

        <div>
          <Typography variant="h4" weight="semibold">Daftar Stok</Typography>
          <ul class="list-group mt-2">
            {stocks.value.map(s => (
              <li class="list-group-item d-flex justify-content-between align-items-center" key={s.id}>
                <div>
                  <strong>{s.name}</strong>
                  <div class="text-muted" style={{ fontSize: '0.85rem' }}>{s.id}</div>
                </div>
                <div>{s.qty} {s.unit}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
});
