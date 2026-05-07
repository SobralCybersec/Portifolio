import { render } from '@testing-library/react';
import Contact from '../Contact';

describe('Contact', () => {
  it('renders without crashing', () => {
    const { container } = render(<Contact animateSection="false" />);
    expect(container).toBeTruthy();
  });
});
