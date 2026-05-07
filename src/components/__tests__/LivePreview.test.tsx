import { render } from '@testing-library/react';
import LivePreview from '../LivePreview';

describe('LivePreview', () => {
  it('renders without crashing', () => {
    const { container } = render(<LivePreview />);
    expect(container).toBeTruthy();
  });
});
