import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PencatatanScopeCard',
  props: {
    active: { type: Boolean, default: false },
    iconSrc: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    onSelect: { type: Function, default: null },
  },
  setup(props) {
    return () => (
      <button
        type="button"
        class={['peternakan-row-card', props.active ? 'filled' : '']}
        style={{ minWidth: '180px' }}
        onClick={() => props.onSelect?.()}
      >
        <div class="peternakan-row-icon-box">
          <img src={props.iconSrc} alt={props.title} style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
        </div>
        <div class="peternakan-row-body">
          <span class="peternakan-row-title">{props.title}</span>
          <span class="peternakan-row-desc">{props.description}</span>
        </div>
      </button>
    );
  },
});
