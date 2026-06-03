import { defineComponent } from 'vue';
import type { PropType } from 'vue';

export type PencatatanMode = 'individu' | 'kelompok';

export default defineComponent({
  name: 'PencatatanModeToggle',
  props: {
    modelValue: { type: String as PropType<PencatatanMode>, required: true },
    onUpdateModelValue: { type: Function as PropType<(v: PencatatanMode) => void>, default: null },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const setMode = (mode: PencatatanMode) => {
      emit('update:modelValue', mode);
      props.onUpdateModelValue?.(mode);
    };

    return () => (
      <div class="pencatatan-mode-toggle" role="group" aria-label="Mode pencatatan">
        <button
          type="button"
          class={['pencatatan-mode-btn', props.modelValue === 'individu' ? 'is-active' : '']}
          onClick={() => setMode('individu')}
        >
          <img
            src="/icon/domba.png"
            alt=""
            class="pencatatan-mode-icon"
            style={{ opacity: props.modelValue === 'individu' ? 1 : 0.5 }}
          />
          Per Ternak
        </button>
        <button
          type="button"
          class={['pencatatan-mode-btn', props.modelValue === 'kelompok' ? 'is-active' : '']}
          onClick={() => setMode('kelompok')}
        >
          <img
            src="/icon/kandang.png"
            alt=""
            class="pencatatan-mode-icon"
            style={{ opacity: props.modelValue === 'kelompok' ? 1 : 0.5 }}
          />
          Per Kandang
        </button>
      </div>
    );
  },
});
