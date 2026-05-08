export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: number;
}

export interface Interview {
  id: string;
  userId: string;
  type: 'HR' | 'Technical' | 'Behavioral';
  position: string;
  status: 'ongoing' | 'completed';
  score?: number;
  feedback?: string;
  questions: InterviewQuestion[];
  createdAt: number;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  userAnswer?: string;
  evaluation?: string;
  score?: number;
}

export interface ResumeAnalysis {
  id: string;
  userId: string;
  fileName: string;
  atsScore: number;
  feedback: string;
  improvements: string[];
  missingKeywords: string[];
  skillGaps: string[];
  createdAt: number;
}

export interface CareerTip {
  id: string;
  title: string;
  content: string;
  category: 'Interview' | 'Career' | 'Resume' | 'Salary';
}
