import { renderHook } from '@testing-library/react';
import { useClickSound } from '@/hooks/useClickSound';

describe('useClickSound Hook', () => {
  it('initializes without errors', () => {
    const { result } = renderHook(() => useClickSound());
    expect(result.current).toBeUndefined();
  });

  it('handles click events', () => {
    const { result } = renderHook(() => useClickSound());
    
    // Simulate click
    const clickEvent = new MouseEvent('click', { bubbles: true });
    document.dispatchEvent(clickEvent);
    
    expect(result.current).toBeUndefined();
  });
});
