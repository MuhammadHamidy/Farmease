import { defineComponent, ref } from 'vue';
import Typography from '@/shared/ui/Typography';

export default defineComponent({
  name: 'ActivityLog',
  props: { onClose: { type: Function, default: null } },
  setup(props) {
    const logs = ref([
      { id: 1, time: '2026-04-08 09:23', text: 'Masuk data berat untuk D-001' },
      { id: 2, time: '2026-04-09 10:12', text: 'Tambah pengguna OPT002' },
    ]);

    const addLog = (text = 'Aktivitas baru (FE-only)') => {
      logs.value.unshift({ id: Date.now(), time: new Date().toISOString().replace('T', ' ').slice(0,19), text });
    };

    return () => (
      <div class="p-3">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <Typography variant="h3" weight="bold">Log Aktivitas (FE-only)</Typography>
          <div>
            <button class="btn btn-sm btn-outline-secondary me-2" onClick={() => props.onClose?.()}>Tutup</button>
            <button class="btn btn-sm btn-primary" onClick={() => addLog()}>Tambah Log</button>
          </div>
        </div>

        <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
          <ul class="list-group">
            {logs.value.map(l => (
              <li class="list-group-item" key={l.id}>
                <div class="d-flex justify-content-between">
                  <div>{l.text}</div>
                  <div class="text-muted" style={{ fontSize: '0.8rem' }}>{l.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
});
