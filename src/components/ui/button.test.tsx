import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders an accessible button', () => {
    render(<Button>Continue</Button>);

    expect(screen.getByRole('button', { name: 'Continue' })).toHaveAttribute(
      'type',
      'button',
    );
  });
});
