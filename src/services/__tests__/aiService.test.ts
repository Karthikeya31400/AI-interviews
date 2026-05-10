import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiService } from '../aiService';

// Mock global fetch
global.fetch = vi.fn();

describe('aiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generateInterviewQuestions should call backend API', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: '["What is React?", "How does useEffect work?"]' })
    });

    const questions = await aiService.generateInterviewQuestions('Technical', 'Frontend Engineer', 2);
    
    expect(fetch).toHaveBeenCalledWith('/api/ai/generate', expect.any(Object));
    expect(questions).toHaveLength(2);
    expect(questions[0]).toBe('What is React?');
  });

  it('evaluateAnswer should return structured evaluation', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: '{ "score": 8, "feedback": "Good answer", "modelAnswer": "..." }' })
    });

    const evaluation = await aiService.evaluateAnswer('What is React?', 'A library for building UI');
    
    expect(evaluation.score).toBe(8);
    expect(evaluation.feedback).toBe('Good answer');
  });

  it('analyzeResume should return ATS score and gaps', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: '{ "atsScore": 85, "feedback": "Solid resume", "improvements": [], "missingKeywords": ["Docker"], "skillGaps": [] }' })
    });

    const analysis = await aiService.analyzeResume('Resume text...');
    
    expect(analysis.atsScore).toBe(85);
    expect(analysis.missingKeywords).toContain('Docker');
  });
});
