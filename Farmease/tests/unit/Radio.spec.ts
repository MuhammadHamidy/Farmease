import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Radio from '../../src/shared/ui/Radio';

describe('Radio Component', () => {
  it('renders unchecked by default', () => {
    const wrapper = mount(Radio, {
      props: {
        modelValue: 'opsiB',
        value: 'opsiA',
        name: 'gender',
      },
    });

    expect(wrapper.find('input').element.checked).toBe(false);
  });

  it('renders checked when modelValue matches value', () => {
    const wrapper = mount(Radio, {
      props: {
        modelValue: 'opsiA',
        value: 'opsiA',
        name: 'gender',
      },
    });

    expect(wrapper.find('input').element.checked).toBe(true);
  });

  it('emits update:modelValue when changed', async () => {
    const wrapper = mount(Radio, {
      props: {
        modelValue: 'opsiB',
        value: 'opsiA',
        name: 'gender',
      },
    });

    await wrapper.find('input').setValue(true);

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['opsiA']);
  });
});
