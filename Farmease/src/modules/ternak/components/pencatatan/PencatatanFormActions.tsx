import { defineComponent } from 'vue';
import Button from '@/shared/ui/Button';
import Typography from '@/shared/ui/Typography';

export default defineComponent({
  name: 'PencatatanFormActions',
  props: {
    saved: { type: Boolean, default: false },
    submitLabel: { type: String, default: 'Simpan Catatan' },
    cancelLabel: { type: String, default: '' },
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    return () => (
      <div class="col-12 d-flex gap-3 align-items-center flex-wrap pt-2">
        {props.cancelLabel && (
          <Button variant="secondary" shape="pill" onClick={() => emit('cancel')}>
            {props.cancelLabel}
          </Button>
        )}
        <Button variant="primary" shape="pill" className="shadow-sm" onClick={() => emit('submit')}>
          {props.submitLabel}
        </Button>
        {props.saved && (
          <Typography variant="span" size="text-sm" color="almond-beige" weight="semibold">
            ✓ Berhasil disimpan!
          </Typography>
        )}
      </div>
    );
  },
});
