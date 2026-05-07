import { render } from '@testing-library/react';
import Hero from '../Hero';

describe('Hero', () => {
  it.skip('renders without crashing', () => {
    const { container } = render(<Hero animateSection="false" />);
    expect(container).toBeTruthy();
  });
});
