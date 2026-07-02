import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Badge from '../../src/shared/ui/Badge';

describe('Badge Component', () => {
  it('renders default slot content correctly', () => {
    const wrapper = mount(Badge, {
      slots: {
        default: 'Sakit',
      },
    });
    expect(wrapper.text()).toBe('Sakit');
  });

  it('applies custom className correctly', () => {
    const wrapper = mount(Badge, {
      props: {
        className: 'custom-badge-class',
      },
      slots: {
        default: 'Sehat',
      },
    });
    expect(wrapper.classes()).toContain('custom-badge-class');
  });

  it('renders with success variant styles', () => {
    const wrapper = mount(Badge, {
      props: {
        variant: 'success',
      },
      slots: {
        default: 'Aktif',
      },
    });
    const element = wrapper.element as HTMLElement;
    expect(element.style.color).toBe('var(--color-secondary)');
  });

  it('renders with danger variant styles', () => {
    const wrapper = mount(Badge, {
      props: {
        variant: 'danger',
      },
      slots: {
        default: 'Sakit',
      },
    });
    const element = wrapper.element as HTMLElement;
    expect(element.style.color).toBe('var(--color-error)');
  });
});
