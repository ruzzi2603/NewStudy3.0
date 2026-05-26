/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface TranscriptSegment {
  time: string; // e.g. "00:12"
  text: string;
}

export interface Formula {
  title: string;
  latex: string;
  description: string;
  variables?: { name: string; explanation: string }[];
  application?: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty?: "easy" | "good" | "hard";
  reviewState?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface Lecture {
  id: string;
  userId?: string; // Vincula a aula ao usuário correspondente
  title: string;
  sourceUrl: string;
  category: string;
  moduleName: string;
  duration: string;
  status: "READY" | "ANALYZING" | "FAILED";
  progress: number;
  summaryShort: string;
  summaryFull: string;
  learningObjectives: string[];
  keyConcept: {
    title: string;
    body: string;
  };
  transcriptionSegments: TranscriptSegment[];
  formulas: Formula[];
  flashcards: Flashcard[];
  quizzes: QuizQuestion[];
  chatHistory: ChatMessage[];
  createdAt: string;
}

export interface AppState {
  lectures: Lecture[];
  selectedLectureId: string | null;
  currentView: "landing" | "dashboard" | "lecture" | "recall";
  recallMode: "flashcards" | "quiz";
}
