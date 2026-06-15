import { defineComponent } from 'vue';
import type { PropType } from 'vue';

export type PencatatanMode = 'individu' | 'kelompok';

export default defineComponent({
  name: 'PencatatanModeToggle',
  props: {
    modelValue: { type: String as PropType<PencatatanMode>, required: true },
    onUpdateModelValue: { type: Function as PropType<(v: PencatatanMode) => void>, default: null },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const setMode = (mode: PencatatanMode) => {
      if (props.disabled) return;
      emit('update:modelValue', mode);
      props.onUpdateModelValue?.(mode);
    };

    return () => (
      <div 
        class={['pencatatan-mode-toggle', props.disabled ? 'is-disabled' : '']} 
        role="group" 
        aria-label="Mode pencatatan"
      >
        <button
          type="button"
          class={['pencatatan-mode-btn', props.modelValue === 'individu' ? 'is-active' : '']}
          onClick={() => setMode('individu')}
          disabled={props.disabled}
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
          disabled={props.disabled}
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

