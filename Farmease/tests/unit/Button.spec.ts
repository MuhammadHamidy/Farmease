import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from '../../src/shared/ui/Button';

describe('Button Component', () => {
  it('renders default button content correctly', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Simpan',
      },
    });
    expect(wrapper.text()).toContain('Simpan');
    expect(wrapper.find('button').attributes('type')).toBe('button');
  });

  it('triggers onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    const wrapper = mount(Button, {
      props: {
        onClick: handleClick,
      },
      slots: {
        default: 'Simpan',
      },
    });

    await wrapper.find('button').trigger('click');
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('does not trigger onClick when disabled', async () => {
    const handleClick = vi.fn();
    const wrapper = mount(Button, {
      props: {
        disabled: true,
        onClick: handleClick,
      },
      slots: {
        default: 'Simpan',
      },
    });

    expect(wrapper.find('button').element.disabled).toBe(true);
    await wrapper.find('button').trigger('click');
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders loading state and disables the button', async () => {
    const handleClick = vi.fn();
    const wrapper = mount(Button, {
      props: {
        loading: true,
        onClick: handleClick,
      },
    });

    expect(wrapper.find('button').element.disabled).toBe(true);
    expect(wrapper.classes()).toContain('btn-loading');
  });
});
