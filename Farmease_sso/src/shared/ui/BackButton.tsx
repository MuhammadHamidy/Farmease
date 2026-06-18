import { defineComponent, type PropType } from 'vue';
import Button, { type ButtonVariant, type ButtonSize, type ButtonShape } from '@/shared/ui/Button';

export default defineComponent({
  name: 'BackButton',
  props: {
    onClick: {
      type: Function as PropType<(payload: MouseEvent) => void>,
      required: true
    },
    label: {
      type: String,
      default: 'Kembali'
    },
    variant: {
      type: String as PropType<ButtonVariant>,
      default: 'outline'
    },
    size: {
      type: String as PropType<ButtonSize>,
      default: 'md'
    },
    shape: {
      type: String as PropType<ButtonShape>,
      default: 'pill'
    },
    className: {
      type: String,
      default: 'fw-bold px-4 py-2'
    },
    title: {
      type: String,
      default: 'Kembali'
    },
    style: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    return () => (
      <Button
        variant={props.variant}
        size={props.size}
        shape={props.shape}
        onClick={props.onClick}
        className={`${props.className} back-btn-hover`}
        title={props.title}
        style={props.style}
        v-slots={{
          iconLeft: () => <img src="/icon/left-row.png" alt="Kembali" style={{ width: '18px', height: '18px', objectFit: 'contain' }} class="back-btn-icon" />,
          default: () => props.label
        }}
      />
    );
  }
});
