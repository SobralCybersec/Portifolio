import { render, waitFor } from '@testing-library/react';
import Contact from '../contact/Contact';

describe('Contact', () => {
  it('renders without crashing', async () => {
    const { container } = render(<Contact animateSection="false" />);
    await waitFor(() => expect(container.querySelector('canvas')).toBeInTheDocument());
    expect(container).toBeTruthy();
  });
});
