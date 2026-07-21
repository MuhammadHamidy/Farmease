import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Typography from '../../src/shared/ui/Typography';

describe('Typography Component', () => {
  it('renders slot text and default HTML element tag (p)', () => {
    const wrapper = mount(Typography, {
      slots: {
        default: 'Hello World',
      },
    });

    expect(wrapper.find('p').exists()).toBe(true);
    expect(wrapper.text()).toBe('Hello World');
  });

  it('renders as custom tag when variant prop is changed', () => {
    const wrapper = mount(Typography, {
      props: {
        variant: 'h3',
      },
      slots: {
        default: 'Judul H3',
      },
    });

    expect(wrapper.find('h3').exists()).toBe(true);
  });

  it('applies custom styles according to size and weight props', () => {
    const wrapper = mount(Typography, {
      props: {
        size: 'text-xl',
        weight: 'extrabold',
      },
      slots: {
        default: 'Bold Text',
      },
    });

    const element = wrapper.element as HTMLElement;
    expect(element.style.fontSize).toBe('var(--font-size-xl)');
    expect(element.style.fontWeight).toBe('800');
  });
});
