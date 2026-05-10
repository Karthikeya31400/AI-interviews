# AI Interview Proxy - Premium Prep Platform

AI Interview Proxy is a next-generation, AI-powered interview preparation platform designed to help you land your dream job. It provides a realistic, professional environment to practice your interview skills with advanced AI feedback and voice interaction.

## 🚀 Key Features

- **Interactive AI Interviews**: Engage in contextual conversations powered by Gemini AI that adapts to your responses with challenging but fair follow-up questions.
- **Voice-First Experience**: 
  - **Speech-to-Text**: Answer questions naturally using your voice with real-time clarity feedback.
  - **Text-to-Speech**: Listen to the AI interviewer's questions for a truly immersive experience.
- **Instant Evaluation**: Receive a 0-100 score and supportive feedback after every single answer you provide.
- **Resume-Grounded Practice**: Upload your PDF resume to have the AI generate personalized questions based on your actual experience and skills.
- **Shareable Certificates**: Earn a professional PDF certificate upon successful completion of an interview session.
- **Deep Analytics**: Real-time performance tracking saved to a persistent database to visualize growth.
- **Privacy Focused**: Gemini API keys are handled server-side to prevent exposure in the browser bundle.

## 🛠️ Technology Stack

- **Frontend**: React 18+ with TypeScript and Vite
- **Backend**: Node.js & Express
- **Database**: SQLite (via `better-sqlite3`) for local, persistent storage
- **AI Engine**: Google Gemini (via `@google/genai` server-side SDK)
- **Styling**: Tailwind CSS for a premium, dark-themed interface
- **Animations**: Motion for smooth, high-end transitions
- **Voice APIs**: Web Speech API (Recognition & Synthesis)
- **Testing**: Vitest for service and logic verification
- **PDF Generation**: jsPDF

## 🎯 Getting Started

1. **Authentication**: Sign in using the local auth system (simulated Google Login).
2. **Setup**: Choose your target position and interview type (Behavioral, Technical, or Mixed).
3. **Customize**: Optionally upload your resume for a more personalized experience.
4. **Interview**: Face 10 challenging questions, answer using your voice or keyboard, and receive instant feedback.
5. **Analyze**: Review your overall performance in the Analytics dashboard and download your certificate.

## 🧪 Running Tests

To run the integration and unit tests:
```bash
npm test
```

---

Built with ❤️ using Google AI Studio.
