import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const aiService = {
  async generateInterviewQuestions(type: string, position: string, count: number = 10) {
    const prompt = `Generate ${count} high-quality, professional interview questions for a ${position} ${type} interview. 
    The questions should range from basic to advanced.
    Return as a JSON array of strings.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text);
  },

  async evaluateAnswer(question: string, answer: string) {
    const prompt = `Evaluate this interview answer:
    Question: ${question}
    Answer: ${answer}
    
    Provide a score (0-10), brief feedback, and a model answer.
    Return as JSON: { "score": number, "feedback": string, "modelAnswer": string }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
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

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text);
  },

  async interviewChat(history: { role: 'user' | 'model', text: string }[], message: string, position: string, type: string, resumeContext?: string) {
    const prompt = `Analyze the candidate's last answer and then provide:
    1. A score (0-100) for the last answer.
    2. A brief, 1-sentence supportive feedback or tip.
    3. Exactly ONE relevant follow-up question or the next question in the series.

    Return as JSON: { "score": number, "feedback": string, "question": string }`;

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are an expert interviewer conducting a ${type} interview for a ${position} position. 
        ${resumeContext ? `The candidate's resume content is: "${resumeContext}". Use this to ask specific, grounded questions.` : ''}
        Be professional, challenging but fair. Keep your responses concise. Always return your response in the requested JSON format.`
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const response = await chat.sendMessage({ message: prompt + "\n\nCandidate's response: " + message });
    try {
      return JSON.parse(response.text.replace(/```json|```/g, ''));
    } catch (e) {
      // Fallback for non-JSON responses
      return { 
        score: 70, 
        feedback: "Good response, keep it up!", 
        question: response.text 
      };
    }
  },

  async analyzeInterviewPerformance(history: { role: 'user' | 'model', text: string }[], position: string) {
    const prompt = `Analyze this interview transcript for a ${position} position. 
    Provide a detailed evaluation in JSON format with the following fields:
    - communicationClarity: (score 1-10 and explanation)
    - fillerWordUsage: (frequency and types of fillers used)
    - averageResponseLength: (comparison to industry standard)
    - technicalAccuracy: (score 1-10)
    - keyStrengths: (list of 3)
    - improvements: (list of 3 specific areas)
    - overallVerdict: (Hired/Follow-up/Not-Fit)

    Transcript:
    ${history.map(h => `${h.role.toUpperCase()}: ${h.text}`).join('\n')}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text);
  },

  async careerMentorChat(history: { role: 'user' | 'model', text: string }[], message: string) {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are a world-class career mentor and coach. Provide strategic advice on career growth, interview preparation, and professional development."
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const response = await chat.sendMessage({ message });
    return response.text;
  }
};
