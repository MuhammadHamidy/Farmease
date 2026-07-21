import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Toggle from '../../src/shared/ui/Toggle';

describe('Toggle Component', () => {
  it('renders false check state by default', () => {
    const wrapper = mount(Toggle, {
      props: {
        modelValue: false,
      },
    });

    expect(wrapper.find('input').element.checked).toBe(false);
  });

  it('renders true checked state when modelValue is true', () => {
    const wrapper = mount(Toggle, {
      props: {
        modelValue: true,
      },
    });

    expect(wrapper.find('input').element.checked).toBe(true);
  });

  it('emits update:modelValue when toggled', async () => {
    const wrapper = mount(Toggle, {
      props: {
        modelValue: false,
      },
    });

    const checkbox = wrapper.find('input');
    await checkbox.setValue(true);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
  });
});
