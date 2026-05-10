async function callGenerate(model: string, prompt: string, config: any = {}) {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, config })
  });
  if (!response.ok) throw new Error('AI request failed');
  return await response.json();
}

async function callChat(model: string, history: any[], message: string, config: any = {}) {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, history, message, config })
  });
  if (!response.ok) throw new Error('AI chat failed');
  return await response.json();
}

export const aiService = {
  async generateInterviewQuestions(type: string, position: string, count: number = 10) {
    const prompt = `Generate ${count} high-quality, professional interview questions for a ${position} ${type} interview. 
    The questions should range from basic to advanced.
    Return as a JSON array of strings.`;
    
    const response = await callGenerate("gemini-3-flash-preview", prompt, {
      responseMimeType: "application/json"
    });

    return JSON.parse(response.text);
  },

  async evaluateAnswer(question: string, answer: string) {
    const prompt = `Evaluate this interview answer:
    Question: ${question}
    Answer: ${answer}
    
    Provide a score (0-10), brief feedback, and a model answer.
    Return as JSON: { "score": number, "feedback": string, "modelAnswer": string }`;

    const response = await callGenerate("gemini-3-flash-preview", prompt, {
      responseMimeType: "application/json"
    });

    return JSON.parse(response.text);
  },

  async analyzeResume(text: string) {
    const prompt = `Analyze this resume text for ATS compatibility and overall quality:
    Resume: ${text}
    
    Return as JSON with metrics:
    {
      "atsScore": number,
      "feedback": string,
      "improvements": string[],
      "missingKeywords": string[],
      "skillGaps": string[]
    }`;

    const response = await callGenerate("gemini-3.1-pro-preview", prompt, {
      responseMimeType: "application/json"
    });

    return JSON.parse(response.text);
  },

  async interviewChat(history: { role: 'user' | 'model', text: string }[], message: string, position: string, type: string, resumeContext?: string) {
    const prompt = `Analyze the candidate's last answer and then provide:
    1. An overall score (0-100).
    2. Detailed metrics for:
       - relevance: score (0-10)
       - technicalDepth: score (0-10)
       - communicationClarity: score (0-10)
    3. A brief, 1-sentence supportive feedback or tip. 
       ${type === 'Technical' ? 'CRITICAL: If it is a technical question, provide a specific tip on how they could have demonstrated more technical depth (e.g. mentioning specific design patterns, time complexity, or edge cases).' : ''}
    4. Exactly ONE relevant follow-up question that builds on their last technical point OR the next logical interview question.

    Return as JSON: { 
      "score": number, 
      "metrics": { "relevance": number, "technicalDepth": number, "communicationClarity": number },
      "feedback": string, 
      "question": string 
    }`;

    const config = {
      systemInstruction: `You are an expert interviewer conducting a ${type} interview for a ${position} position. 
      ${resumeContext ? `The candidate's resume content is: "${resumeContext}". Use this to ask specific, grounded questions.` : 'No resume provided, use general but professional industry standards.'}
      Be professional, challenging but fair. If the candidate gives a shallow answer, ask a deep follow-up. If they give a great answer, move to a new topic.
      Always return your response in the requested JSON format. Do not include markdown code blocks in your response, just the raw JSON.`
    };

    const response = await callChat("gemini-3-flash-preview", history, prompt + "\n\nCandidate's response: " + message, config);
    
    try {
      const cleanJson = response.text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.error('Failed to parse AI response:', response.text);
      return { 
        score: 70, 
        metrics: { relevance: 7, technicalDepth: 7, communicationClarity: 7 },
        feedback: "Good response, keep it up!", 
        question: "Could you tell me more about your experience with complex problem solving?" 
      };
    }
  },

  async getCodingHint(problemTitle: string, topic: string, description: string, code: string, language: string) {
    const prompt = `Act as an expert technical mentor. Given the coding problem "${problemTitle}" in the topic "${topic}", provide a context-aware hint.
    
    Problem Description:
    ${description}
    
    Candidate's Current ${language} Code:
    ${code}
    
    Guidelines for the hint:
    1. Do NOT solve the problem.
    2. Analyze their specific code. Look for logical errors, missing edge cases, or inefficiencies.
    3. Provide ONE clear, conceptual nudge that helps them move forward based on their CURRENT state.
    4. Avoid generic advice like "think about time complexity".
    5. Keep it concise (2-3 sentences).`;

    const config = {
      systemInstruction: "You are an elite coding coach. You provide surgical, context-aware hints that guide students without giving away the answer."
    };

    const response = await callChat("gemini-3-flash-preview", [], prompt, config);
    return response.text;
  },

  async analyzeInterviewPerformance(history: { role: 'user' | 'model', text: string }[], position: string, stats?: { totalWords: number, totalFillers: number, totalTime: number }) {
    const prompt = `Analyze this interview transcript for a ${position} position. 
    Session Stats: ${stats ? `Total Words: ${stats.totalWords}, Total Fillers: ${stats.totalFillers}, Turns: ${stats.totalTime}` : 'Stats not available'}
    
    Provide a detailed evaluation in JSON format with the following fields:
    - communicationClarity: (score 1-10 and explanation, factoring in the fillers: ${stats?.totalFillers || 'unknown'})
    - fillerWordUsage: (frequency and types of fillers used based on stats)
    - averageResponseLength: (comparison to industry standard based on ${stats?.totalWords || '0'} total words over ${stats?.totalTime || '0'} turns)
    - technicalAccuracy: (score 1-10)
    - keyStrengths: (list of 3)
    - improvements: (list of 3 specific areas)
    - overallVerdict: (Hired/Follow-up/Not-Fit)

    Transcript:
    ${history.map(h => `${h.role.toUpperCase()}: ${h.text}`).join('\n')}
    `;

    const response = await callGenerate("gemini-3.1-pro-preview", prompt, {
      responseMimeType: "application/json"
    });

    return JSON.parse(response.text);
  },

  async careerMentorChat(history: { role: 'user' | 'model', text: string }[], message: string) {
    const config = {
      systemInstruction: "You are a world-class career mentor and coach. Provide strategic advice on career growth, interview preparation, and professional development."
    };

    const response = await callChat("gemini-3-flash-preview", history, message, config);
    return response.text;
  }
};

