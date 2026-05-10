import { describe, it, expect, vi } from 'vitest';
// Note: In a real environment, we'd mock better-sqlite3
// For this test, we verify the service calls the right endpoints

import { dataService } from '../dataService';

global.fetch = vi.fn();

describe('dataService', () => {
  it('getInterviews should fetch from backend', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: '1', score: 85 }])
    });

    const interviews = await dataService.getInterviews('user123');
    
    expect(fetch).toHaveBeenCalledWith('/api/interviews?userId=user123');
    expect(interviews[0].score).toBe(85);
  });

  it('saveInterview should post to backend', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'new-id' })
    });

    const result = await dataService.saveInterview({
      userId: 'user123',
      type: 'Technical',
      position: 'Dev',
      status: 'completed',
      score: 90,
      feedback: 'Excellent',
      questions: ['Q1'],
      evaluation: {}
    });
    
    expect(fetch).toHaveBeenCalledWith('/api/interviews', expect.objectContaining({
      method: 'POST'
    }));
    expect(result.id).toBe('new-id');
  });
});
