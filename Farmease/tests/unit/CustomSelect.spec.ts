import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import CustomSelect from '../../src/shared/ui/admin/Select';

describe('CustomSelect Component', () => {
  it('renders placeholder correctly when no value is selected', () => {
    const wrapper = mount(CustomSelect, {
      props: {
        modelValue: '',
        options: [
          { value: 'option1', label: 'Opsi A' },
          { value: 'option2', label: 'Opsi B' },
        ],
        placeholder: 'Pilih data kandang',
      },
    });

    expect(wrapper.text()).toContain('Pilih data kandang');
  });

  it('renders the selected option label correctly', () => {
    const wrapper = mount(CustomSelect, {
      props: {
        modelValue: 'option1',
        options: [
          { value: 'option1', label: 'Opsi A' },
          { value: 'option2', label: 'Opsi B' },
        ],
      },
    });

    expect(wrapper.text()).toContain('Opsi A');
  });

  it('opens dropdown menu and selects options on click', async () => {
    const wrapper = mount(CustomSelect, {
      props: {
        modelValue: '',
        options: [
          { value: 'option1', label: 'Opsi A' },
          { value: 'option2', label: 'Opsi B' },
        ],
      },
    });

    // Dropdown should be closed initially
    expect(wrapper.find('.custom-select-menu').exists()).toBe(false);

    // Click select box to open
    await wrapper.find('.custom-select').trigger('click');

    // Menu should be open
    expect(wrapper.find('.custom-select-menu').exists()).toBe(true);
    expect(wrapper.findAll('.custom-select-option')).toHaveLength(2);

    // Click the second option
    await wrapper.findAll('.custom-select-option')[1]!.trigger('click');

    // Emitted event should be triggered with update:modelValue
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['option2']);
  });
});
