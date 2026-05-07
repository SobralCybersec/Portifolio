import { render } from '@testing-library/react';
import LivePreview from '../LivePreview';

describe('LivePreview', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <LivePreview 
        title="Test" 
        description="Test desc" 
        content="Test content" 
        category="test" 
      />
    );
    expect(container).toBeInTheDocument();
  });
});
