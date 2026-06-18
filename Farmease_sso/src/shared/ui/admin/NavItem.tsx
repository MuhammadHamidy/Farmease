import { defineComponent } from 'vue';
import '@/shared/assets/css/ui/admin/NavItem.css';

export default defineComponent({
  name: 'NavItem',
  props: {
    text: { type: String, required: true },
    active: { type: Boolean, default: false },
    icon: { type: Function, default: null }
  },
  setup(props) {
    return () => (
      <div class={["nav-item-box d-flex align-items-center gap-3 py-2 px-3 rounded-3", props.active ? "active" : "inactive"]}>
        {props.icon && props.icon()}
        <span class="fw-bold">{props.text}</span>
      </div>
    );
  }
});
