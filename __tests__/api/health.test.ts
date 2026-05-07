import { GET } from '@/app/api/health/route';

describe('Health Check API', () => {
  it('returns healthy status', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('uptime');
    expect(data).toHaveProperty('environment');
    expect(data).toHaveProperty('memory');
  });

  it('includes memory usage information', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.memory).toHaveProperty('used');
    expect(data.memory).toHaveProperty('total');
    expect(data.memory).toHaveProperty('unit');
    expect(data.memory.unit).toBe('MB');
  });

  it('returns valid timestamp', async () => {
    const response = await GET();
    const data = await response.json();

    const timestamp = new Date(data.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.getTime()).not.toBeNaN();
  });
});
