export type ProfileTheme = "claro" | "escuro" | "violeta";
export type StudyActivity = "slides" | "flashcards" | "quiz" | "chat";

export interface StudySession {
  id: string;
  title: string;
  activity: StudyActivity;
  duration: string;
  date: string;
}

export interface ProfileStats {
  lecturesCreated: number;
  flashcardsReviewed: number;
  quizzesCompleted: number;
  studyHours: number;
  favoriteMaterials: number;
  lastAccess?: string;
}

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  lastAccessAt?: string;
  stats?: ProfileStats;
  sessions?: StudySession[];
  avatar?: string;
  institution?: string;
  university?: string;
  course?: string;
  semester?: string;
  bio?: string;
  phone?: string;
  location?: string;
  theme?: ProfileTheme;
  joinDate?: string;
  studyHours?: number;
  completedQuizzes?: number;
  reviewedFlashcards?: number;
  createdLectures?: number;
}

export interface AccountPreferences {
  emailNotifications: boolean;
  autoSaveProgress: boolean;
  compactMode: boolean;
  privateAccount: boolean;
  weeklyDigest: boolean;
  }

export type ProfileTab = "perfil" | "conteudos" | "seguranca" | "historico" | "configuracoes";