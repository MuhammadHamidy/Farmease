import { defineComponent } from 'vue';
import '@/shared/assets/css/ui/admin/ListItem.css';

export default defineComponent({
  name: 'ListItem',
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    icon: { type: Function, default: null }
  },
  setup(props, { slots }) {
    return () => (
      <div class="custom-list-item bg-white border rounded-4 p-3 d-flex justify-content-between align-items-center mb-3">
        <div class="d-flex align-items-center gap-3">
          {props.icon && (
            <div class="list-icon-wrapper rounded-circle border border-dark d-flex align-items-center justify-content-center">
              {props.icon()}
            </div>
          )}
          <div>
            <h6 class="m-0 fw-bold text-dark">{props.title}</h6>
            {props.subtitle && <small class="text-secondary text-xs">{props.subtitle}</small>}
          </div>
        </div>
        <div>
          {slots.right && slots.right()}
        </div>
      </div>
    );
  }
});
