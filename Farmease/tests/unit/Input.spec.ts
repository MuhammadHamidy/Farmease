import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Input from '../../src/shared/ui/Input';

describe('Input Component', () => {
  it('renders default values and placeholder correctly', () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: 'Toni',
        placeholder: 'Nama domba...',
      },
    });

    const input = wrapper.find('input');
    expect(input.element.value).toBe('Toni');
    expect(input.attributes('placeholder')).toBe('Nama domba...');
  });

  it('emits update:modelValue on input change', async () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: '',
      },
    });

    const input = wrapper.find('input');
    await input.setValue('Garut');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Garut']);
  });

  it('renders custom input types correctly', () => {
    const wrapper = mount(Input, {
      props: {
        type: 'number',
      },
    });

    expect(wrapper.find('input').attributes('type')).toBe('number');
  });

  it('disables input when disabled prop is true', () => {
    const wrapper = mount(Input, {
      props: {
        disabled: true,
      },
    });

    expect(wrapper.find('input').element.disabled).toBe(true);
  });
});
