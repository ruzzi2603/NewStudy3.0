/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Lecture } from "./types";
import Dashboard from "./components/Dashboard";
import LectureView from "./components/LectureView";
import UserProfile from "./components/profile/UserProfile";
import type { UserProfileData } from "./components/profile/profileTypes";
import Sidebar from "./components/sidebar";
import RecallStage from "./components/RecallStage";
import {
  BookOpen,
  Sparkles,
  User,
  UserCircle2,
  Star,
  Settings,
  LogOut,
  Search,
  Check,
  AlertCircle,
  X,
  LogIn,
  Lock,
  Play,
  RotateCw,
  Trash2,
  Clock,
  Mail,
  ChevronDown,
  Sun,
  Moon,
  Cookie,
  Database,
  FileText,
  ShieldCheck,
  Scale,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Camera,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { div } from "motion/react-client";

type LegalSectionKey = "terms" | "privacy" | "cookies";

type LegalBlock = {
  title: string;
  body?: string;
  bullets?: string[];
};

type LegalDocument = {
  badge: string;
  title: string;
  subtitle: string;
  updatedAt: string;
  blocks: LegalBlock[];
};

const LEGAL_DOCUMENTS: Record<LegalSectionKey, LegalDocument> = {
  terms: {
    badge: "Contrato de uso",
    title: "Termos de Uso",
    subtitle: "Regras de acesso, limites da plataforma e responsabilidades do usuário.",
    updatedAt: "1 de junho de 2026",
    blocks: [
      {
        title: "1. Natureza do serviço",
        body:
          "O NewStudy é uma plataforma de apoio educacional que transforma links e materiais enviados pelo usuário em resumos, transcrições temáticas, fórmulas, flashcards, quizzes e atendimento por IA. O serviço é fornecido como ferramenta de estudo e organização, e não como certificação acadêmica, consultoria profissional, aconselhamento jurídico, médico, financeiro ou psicológico.",
      },
      {
        title: "2. Aceitação dos termos",
        body:
          "Ao criar uma conta, acessar, navegar ou utilizar qualquer funcionalidade, o usuário confirma que leu, entendeu e concorda com estes Termos, com a Política de Privacidade e com a Política de Cookies. Caso não concorde, não deve usar a plataforma.",
      },
      {
        title: "3. Cadastro e segurança da conta",
        bullets: [
          "O usuário deve fornecer dados verdadeiros, completos e atualizados.",
          "A senha é de uso pessoal e intransferível, e o usuário responde por qualquer atividade realizada com sua conta.",
          "O usuário deve informar imediatamente qualquer uso não autorizado da conta ou suspeita de comprometimento de credenciais.",
          "Quando a lei aplicável exigir, menores de idade devem utilizar o serviço somente com a autorização de um responsável legal.",
        ],
      },
      {
        title: "4. Uso permitido",
        bullets: [
          "Usar o serviço apenas para fins lícitos e educacionais.",
          "Não tentar burlar limites de uso, autenticação, rate limits, controles de segurança ou mecanismos de proteção.",
          "Não enviar malware, scripts maliciosos, conteúdo difamatório, discriminatório, sexualmente explícito, abusivo ou ilegal.",
          "Não subir ou processar material de terceiros sem autorização adequada, especialmente conteúdo confidencial, sigiloso ou protegido por contrato.",
        ],
      },
      {
        title: "5. Conteúdo enviado pelo usuário",
        body:
          "Ao inserir URLs, tópicos, textos, perguntas, anotações, feedbacks, respostas de quiz, flashcards e demais informações, o usuário declara possuir direito de uso sobre o material enviado ou, ao menos, permissão para processá-lo na plataforma. O usuário permanece responsável pela legalidade do conteúdo original e pelo uso posterior dos materiais gerados.",
      },
      {
        title: "6. Inteligência artificial e limitações",
        body:
          "As respostas e materiais gerados por IA podem conter imprecisões, omissões ou interpretações incompletas. O usuário deve revisar o conteúdo antes de utilizá-lo academicamente, profissionalmente ou publicamente. O NewStudy não garante que os resultados estejam livres de erro, viés ou desatualização.",
      },
      {
        title: "7. Propriedade intelectual",
        body:
          "O usuário mantém os direitos sobre os dados que envia, observadas as restrições do conteúdo original de terceiros. A plataforma e seus componentes visuais, fluxos, código, prompts internos e identidade visual continuam pertencendo ao titular do projeto ou a seus licenciantes. A geração automática de materiais não transfere direitos sobre obras de terceiros incorporadas ao conteúdo original.",
      },
      {
        title: "8. Suspensão e encerramento",
        body:
          "A plataforma pode limitar, suspender ou encerrar acesso de contas que violem estes termos, abusem do sistema, comprometam a segurança ou exponham o serviço a risco jurídico, técnico ou reputacional.",
      },
      {
        title: "9. Garantias e responsabilidade",
        body:
          "A plataforma é fornecida na forma em que se encontra, na extensão máxima permitida pela lei aplicável. Na medida permitida por lei, o serviço não responde por prejuízos indiretos, perda de dados, interrupção de uso, decisões tomadas com base em material gerado por IA ou danos decorrentes do uso indevido da conta.",
      },
      {
        title: "10. Alterações",
        body:
          "Estes Termos podem ser atualizados periodicamente. A versão vigente será a exibida no aplicativo, com data de atualização visível. O uso contínuo após a mudança representa concordância com a nova versão.",
      },
      {
        title: "11. Contato jurídico e suporte",
        body:
          "Para questões sobre termos, privacidade, remoção de dados ou dúvidas legais, o canal recomendado é legal@newstudy.app. Antes da publicação comercial, substitua esse endereço por um canal realmente monitorado pela operação do projeto.",
      },
    ],
  },
  privacy: {
    badge: "Dados e privacidade",
    title: "Privacidade e Dados",
    subtitle: "O que a plataforma coleta, por que coleta e como usa essas informações.",
    updatedAt: "1 de junho de 2026",
    blocks: [
      {
        title: "1. Categorias de dados coletados",
        bullets: [
          "Dados de cadastro: nome, e-mail, senha com hash e identificadores internos da conta.",
          "Dados de autenticação e segurança: cookies de sessão, cookies de visitante, endereços IP, cabeçalhos do navegador e eventos de acesso.",
          "Dados de estudo: links de aulas, tópicos sugeridos, resumos, transcrições, fórmulas, flashcards, quizzes, chat com IA, progresso e histórico de revisão.",
          "Dados de uso e suporte: feedbacks, avaliações, mensagens enviadas ao suporte, registros de falha e métricas de cota/limite.",
          "Preferências locais no navegador: tema visual e alguns estados de interface salvos pelo próprio navegador.",
        ],
      },
      {
        title: "2. Finalidades do tratamento",
        bullets: [
          "Criar e manter contas de usuário.",
          "Autenticar sessões e prevenir abuso, fraude e uso indevido.",
          "Processar conteúdos enviados para gerar materiais de estudo e respostas contextuais.",
          "Aplicar limites de uso, registrar progresso e melhorar a experiência educacional.",
          "Cumprir obrigações legais, auditoria, segurança e suporte técnico.",
        ],
      },
      {
        title: "3. Compartilhamento e terceiros",
        body:
          "A plataforma pode compartilhar dados estritamente necessários com provedores de infraestrutura, banco de dados, hospedagem e processamento de IA, somente para operar o serviço. No fluxo atual, conteúdos enviados para geração e perguntas ao tutor podem ser tratados por provedores de IA para produzir as respostas. Não vendemos dados pessoais como prática de negócio.",
      },
      {
        title: "4. Retenção",
        body:
          "Os dados são mantidos enquanto forem necessários para a prestação do serviço, cumprimento de obrigação legal, resolução de disputas, segurança da plataforma ou manutenção do histórico educacional do usuário. Quando aplicável, o usuário pode solicitar correção ou exclusão, sujeito às limitações técnicas e legais do sistema.",
      },
      {
        title: "5. Direitos do titular",
        bullets: [
          "Solicitar acesso aos dados pessoais tratados pela plataforma.",
          "Solicitar correção de informações incompletas ou desatualizadas.",
          "Solicitar eliminação ou anonimização quando aplicável.",
          "Revogar consentimento para usos opcionais, quando existentes.",
          "Solicitar esclarecimentos sobre processamento e compartilhamentos.",
        ],
      },
      {
        title: "6. Segurança",
        body:
          "Usamos senha com hash, cookies de sessão, controles de limite e mecanismos básicos de proteção. Isso reduz riscos, mas não elimina totalmente a possibilidade de incidente. Nenhuma plataforma conectada à internet consegue prometer segurança absoluta.",
      },
      {
        title: "7. Base jurídica e aviso prudencial",
        body:
          "As bases legais variam conforme a jurisdição e a finalidade. Este texto é uma minuta operacional para o produto e deve ser revisado por advogado local antes da publicação pública, especialmente se o serviço atender usuários no Brasil, na União Europeia, no Reino Unido ou em estados norte-americanos com regras próprias.",
      },
    ],
  },
  cookies: {
    badge: "Sessão e navegador",
    title: "Cookies e Tecnologias Semelhantes",
    subtitle: "Como a sessão funciona e quais dados ficam no navegador.",
    updatedAt: "1 de junho de 2026",
    blocks: [
      {
        title: "1. O que são cookies",
        body:
          "Cookies são pequenos arquivos de dados gravados pelo navegador. Em termos simples, eles ajudam o site a lembrar de uma sessão, de preferências ou de configurações básicas. A regra geral é informar o usuário de forma clara e pedir consentimento quando o cookie não for estritamente necessário.",
      },
      {
        title: "2. Cookies essenciais usados hoje",
        bullets: [
          "`newstudy_session`: mantém a sessão autenticada do usuário logado.",
          "`newstudy_guest`: mantém uma identidade de visitante para cotas e controle de abuso quando o usuário não está autenticado.",
          "Se cookies estritamente necessários forem removidos, partes do login e da navegação podem parar de funcionar corretamente.",
        ],
      },
      {
        title: "3. Tecnologias semelhantes no navegador",
        bullets: [
          "`newstudy_theme`: lembra o tema visual escolhido.",
          "`newstudy_user`: salva o perfil básico do usuário logado para facilitar o carregamento inicial.",
          "Esses itens são armazenados no navegador por meio de tecnologias semelhantes, como localStorage, e não são cookies tradicionais.",
        ],
      },
      {
        title: "4. O que não usamos agora",
        bullets: [
          "Não usamos cookies de publicidade comportamental no fluxo atual.",
          "Não usamos rastreamento de marketing por terceiros no navegador como padrão.",
          "Se isso mudar no futuro, o banner e esta política devem ser atualizados antes de publicar a nova versão.",
        ],
      },
      {
        title: "5. Controle do usuário",
        body:
          "O usuário pode bloquear ou apagar cookies nas configurações do navegador. Se fizer isso, a sessão pode expirar e preferências locais podem ser perdidas. Em jurisdições que exigem consentimento para cookies não essenciais, o ideal é exibir um banner de aceite separado com opção de recusar com a mesma facilidade.",
      },
      {
        title: "6. Serviços de terceiros",
        body:
          "Se o produto passar a incorporar vídeos, widgets, analytics ou anúncios de terceiros, esses serviços podem definir seus próprios cookies e políticas. A presença desses recursos deve ser informada antes do uso.",
      },
    ],
  },
};

const LEGAL_SECTION_ORDER: LegalSectionKey[] = ["terms", "privacy", "cookies"];

type AppUser = {
  id: string;
  name: string;
  email: string;
};

function createProfileFromUser(user: AppUser): UserProfileData {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: "",
    bio: "Estudante focado em criar materiais inteligentes com o NewStudy.",
    institution: "Instituição não informada",
    university: "Universidade não informada",
    course: "Curso não informado",
    semester: "—",
    phone: "Não informado",
    location: "Não informado",
    theme: "violeta",
    createdAt: new Date().toISOString(),
    lastAccessAt: new Date().toISOString(),
    stats: {
      lecturesCreated: 0,
      flashcardsReviewed: 0,
      quizzesCompleted: 0,
      studyHours: 0,
      favoriteMaterials: 0,
      lastAccess: "Hoje",
    },
    sessions: [],
  };
}

function profileStorageKey(userId: string) {
  return `newstudy_profile_${userId}`;
}

function readStoredProfile(user: AppUser): UserProfileData {
  const fallback = createProfileFromUser(user);

  try {
    const savedProfile = localStorage.getItem(profileStorageKey(user.id));
    if (!savedProfile) {
      return fallback;
    }

    const parsed = JSON.parse(savedProfile) as Partial<UserProfileData>;
    return {
      ...fallback,
      ...parsed,
      stats: {
        ...fallback.stats,
        ...parsed.stats,
      },
      sessions: parsed.sessions?.length ? parsed.sessions : fallback.sessions,
    };
  } catch {
    return fallback;
  }
}
interface DashboardPropse {
  lectures: Lecture[];
  onSelectLecture: (id: string) => void;
  onAddLecture: (url: string, topicHint: string) => Promise<void>;
  onDeleteLecture: (id: string) => void;
  isAdding: boolean;
}

export default function App({

  onSelectLecture,
  onAddLecture,
  onDeleteLecture,

}: DashboardPropse) {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  const [currentView, setCurrentView] =
  useState<
    "dashboard" |
    "lecture" |
    "recall" |
    "profile"
  >("dashboard");
  const [recallMode, setRecallMode] = useState<"flashcards" | "quiz">("flashcards");
const [url, setUrl] = useState("");

  const [topicHint, setTopicHint] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  // Theme state synchronized with Tailwind class lists (Claro e Escuro)
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("newstudy_theme");
      return (saved === "light" || saved === "dark") ? saved : "dark"; // Default to dark theme
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("newstudy_theme", theme);
    } catch (err) {
      console.warn("Storage saving failed:", err);
    }
  }, [theme]);

  // Load state helpers
  const [isAdding, setIsAdding] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isResponding, setIsResponding] = useState(false);

  // Authentication states
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem("newstudy_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Verify and recover active cookie sessions on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            localStorage.setItem("newstudy_user", JSON.stringify(data.user));
          } else {
            setUser(null);
            localStorage.removeItem("newstudy_user");
          }
        } else {
          setUser(null);
          localStorage.removeItem("newstudy_user");
        }
      } catch (err) {
        console.warn("Nenhum cookie de sessão ativo encontrado no carregamento.", err);
      }
    };
    restoreSession();
  }, []);

  const [profile, setProfile] = useState<UserProfileData | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    setProfile(readStoredProfile(user));
  }, [user]);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authAvatar, setAuthAvatar] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [hasAcceptedLegal, setHasAcceptedLegal] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalSection, setLegalSection] = useState<LegalSectionKey>("terms");

  const openLegalSection = (section: LegalSectionKey) => {
    setLegalSection(section);
    setIsLegalOpen(true);
  };

  useEffect(() => {
    const shouldLockScroll = isAuthOpen || isLegalOpen;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = shouldLockScroll ? "hidden" : "";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isAuthOpen, isLegalOpen]);
const filteredLectures = lectures.filter((l) =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.summaryShort.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const ownedLectures = user ? lectures.filter((lecture) => lecture.userId === user.id) : [];

  useEffect(() => {
    if (!profile) return;

    const lecturesCreated = ownedLectures.length;
    if ((profile.stats?.lecturesCreated ?? 0) === lecturesCreated) return;

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            stats: {
              ...(prev.stats ?? {
                lecturesCreated: 0,
                flashcardsReviewed: 0,
                quizzesCompleted: 0,
                studyHours: 0,
                favoriteMaterials: 0,
                lastAccess: "Hoje",
              }),
              lecturesCreated,
            },
          }
        : prev
    );
  }, [ownedLectures.length, profile]);

  const handleAuthAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAuthError("Selecione uma imagem válida para a foto de perfil.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAuthError("A foto precisa ter no máximo 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAuthAvatar(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  };

  // Fetch all monographs (optionally scoped by current logged in user)
  const fetchLectures = async () => {
    try {
      const res = await fetch("/api/lectures");
      if (res.ok) {
        const data = await res.json();
        setLectures(data);
      }
    } catch (err) {
      console.error("Ops! Erro ao carregar a lista de materiais de estudos:", err);
    }
  };

  useEffect(() => {
    fetchLectures();
  }, [user]);

  // Polling helper: if there are lectures with "ANALYZING" status, poll every 2 seconds to check progress
  useEffect(() => {
    const hasAnalyzing = lectures.some((l) => l.status === "ANALYZING");
    if (!hasAnalyzing) return;

    const interval = setInterval(() => {
      fetchLectures();
    }, 2000);

    return () => clearInterval(interval);
  }, [lectures]);

  // Actions routing
  const handleSelectLecture = (id: string) => {
    setSelectedLectureId(id);
    setCurrentView("lecture");
  };

  const handleAddLecture = async (lectureUrl: string, topicHint: string) => {
    setIsAdding(true);
    try {
      const res = await fetch("/api/lectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: lectureUrl,
          topicHint
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erro ao adicionar material.");
      }

      await fetchLectures();
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteLecture = async (id: string) => {
    try {
      const res = await fetch(`/api/lectures/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLectures((prev) => prev.filter((l) => l.id !== id));
        if (selectedLectureId === id) {
          setSelectedLectureId(null);
          setCurrentView("dashboard");
        }
      }
    } catch (err) {
      console.error("Erro ao remover o módulo de estudo:", err);
    }
  };

  const handleUpdateFlashcard = async (
    flashcardId: string,
    difficulty?: "easy" | "good" | "hard",
    reviewState?: boolean
  ) => {
    if (!selectedLectureId) return;
    try {
      const res = await fetch(`/api/lectures/${selectedLectureId}/flashcards/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flashcardId, difficulty, reviewState }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update local state directly
        setLectures((prev) => prev.map((l) => (l.id === selectedLectureId ? data.lecture : l)));
      }
    } catch (err) {
      console.error("Não foi possível persistir as alterações da revisão:", err);
    }
  };

  const handleAskQuestion = async (question: string) => {
    if (!selectedLectureId) return;
    setIsResponding(true);
    try {
      const res = await fetch(`/api/lectures/${selectedLectureId}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (res.ok) {
        const data = await res.json();
        setLectures((prev) =>
          prev.map((l) =>
            l.id === selectedLectureId ? { ...l, chatHistory: data.chatHistory } : l
          )
        );
      }
    } catch (err) {
      console.error("Incapaz de acessar a inteligência artificial:", err);
    } finally {
      setIsResponding(false);
    }
  };

  // Auth Operations
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authTab === "register" && !hasAcceptedLegal) {
        throw new Error("Para criar a conta, aceite os Termos de Uso, a Política de Privacidade e a Política de Cookies.");
      }

      const endpoint = authTab === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = authTab === "login"
        ? { email: authEmail, password: authPassword }
        : {
            name: authName,
            email: authEmail,
            password: authPassword,
            acceptedTerms: true,
            acceptedLegalVersion: "2026-06-01",
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Operação falhou. Verifique as credenciais.");
      }

      if (data.user) {
        const storedProfile = readStoredProfile(data.user);
        setUser(data.user);
        localStorage.setItem("newstudy_user", JSON.stringify(data.user));

        const nextProfile = {
          ...storedProfile,
          avatar: authTab === "register" ? (authAvatar || storedProfile.avatar || "") : (storedProfile.avatar || ""),
          name: authName || data.user.name,
          email: authEmail.toLowerCase().trim(),
        };

        setProfile(nextProfile);
        localStorage.setItem(profileStorageKey(data.user.id), JSON.stringify(nextProfile));

        if (authTab === "register") {
          localStorage.setItem(
            "newstudy_legal_acceptance",
            JSON.stringify({
              acceptedAt: new Date().toISOString(),
              version: "2026-06-01",
              userEmail: authEmail.toLowerCase().trim(),
            })
          );
        }
        setIsAuthOpen(false);
        // Clean inputs
        setAuthEmail("");
        setAuthPassword("");
        setAuthName("");
        setAuthAvatar("");
        setHasAcceptedLegal(false);
      }
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("Falha ao invalidar cookies no logout:", err);
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem("newstudy_user");
    setSelectedLectureId(null);
    setCurrentView("dashboard");
  };

  const handleProfileSave = async (nextProfile: UserProfileData) => {
    setProfile(nextProfile);

    if (!user) return;

    try {
      const res = await fetch("/api/users/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nextProfile.name,
          email: nextProfile.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Não foi possível salvar os dados da conta.");
      }

      if (data.user) {
        const updatedUser = data.user;
        setUser(updatedUser);
        localStorage.setItem("newstudy_user", JSON.stringify(updatedUser));
      }

      localStorage.setItem(profileStorageKey(user.id), JSON.stringify(nextProfile));
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      alert("Não foi possível salvar o perfil agora.");
    }
  };

  const handleChangePassword = async (_currentPassword: string, newPassword: string) => {
    try {
      const res = await fetch("/api/users/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Não foi possível alterar a senha.");
      }

      if (data.user) {
        const updatedUser = data.user;
        setUser(updatedUser);
        localStorage.setItem("newstudy_user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Erro ao alterar a senha:", err);
      throw err;
    }
  };

  const activeLecture = lectures.find((l) => l.id === selectedLectureId);
  const activeProfile = profile ?? (user ? readStoredProfile(user) : null);
  const activeLegalDocument = LEGAL_DOCUMENTS[legalSection];
  

  return (
    
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 transition-colors duration-200 flex flex-col justify-between font-sans">
      
      {/* Redesenhado: Header de Alto Padrão em Violeta Sólido com Elementos de Vidro */}
      <header className="bg-brand-mint sticky  top-0 z-30 transition-all shadow-md select-none  dark:bg-neutral-900 border border-dashed border-neutral-200/80 dark:border-neutral-800">
          <Sidebar
  user={user}
  lectures={filteredLectures}
  selectedLectureId={selectedLectureId}
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  onSelectLecture={handleSelectLecture}

  onLogout={handleLogout}
/>
           
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          
          <div
            onClick={() => setCurrentView("dashboard")}
            className="flex items-center gap-3 cursor-pointer group select-none" 
          >
            <div className="h-9 w-9 bg-neutral-950 text-white rounded-xl flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-brand-black dark:text-mint-400  font-sans leading-none">
                NewStudy
              </span>
              <span className="text-[10px] tracking-tight text-brand-black dark:text-mint-400  font-medium font-sans mt-0.5">
                Material Inteligente
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3" id="bnt">
            
            {/* Toggler de Tema Translúcido (Claro / Escuro) */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 bg-white/5 border border-black/15 transition-all cursor-pointer shadow-xs shrink-0"
              title={theme === "dark" ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ rotate: -30, opacity: 0, scale: 0.8 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 30, opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4.5 w-4.5 text-brand-black dark:text-mint-400 " />
                  ) : (
                    <Moon className="h-4.5 w-4.5 text-black" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* Widget de Informações / Sessão do Estudante */}
            {user ? (
  <div className="relative">
    <div className="flex items-center gap-3 rounded-full border border-black/15 bg-white/10 px-4 py-1 transition-all hover:bg-white/15 dark:border-white/10 dark:bg-neutral-800/80 dark:hover:bg-neutral-700/80">
      
      <button
        onClick={() => setCurrentView("profile")}
        className="flex items-center gap-3 cursor-pointer"
      >
        <div className="h-7 w-7 overflow-hidden rounded-full bg-[#3B82F6] text-gray text-xs font-bold flex items-center justify-center uppercase shadow-inner select-none ring-1 ring-black/10">
          {activeProfile?.avatar ? (
            <img src={activeProfile.avatar} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            user.name.charAt(0)
          )}
        </div>

        <div className="flex flex-col items-start leading-none gap-0.5">
          <span className="text-xs font-bold text-gray text-left">
            {user.name}
          </span>
          <span className="text-[9px] text-[#A78BFA] font-mono font-medium">
            estudante
          </span>
        </div>
      </button>

      <button
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        className="p-1 hover:bg-white/10 rounded-lg transition-all cursor-pointer"
        aria-label="Abrir menu do usuário"
        title="Abrir menu do usuário"
      >
        <ChevronDown
          className={`h-4 w-4 text-brand-black dark:text-mint-400 transition-transform ${
            isUserMenuOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isUserMenuOpen && (
        <div className="absolute top-12 right-0 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden z-50">
          
          <button
            onClick={() => {
              setCurrentView("profile");
              setIsUserMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <User className="h-4 w-4" />
            Meu Perfil
          </button>

          <button
            onClick={() => {
              setCurrentView("dashboard");
              setIsUserMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Meus Materiais
          </button>

          <div className="border-t border-neutral-200 dark:border-neutral-800" />

          <button
            onClick={() => {
              setIsUserMenuOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair da Conta
          </button>
        </div>
      )}
    </div>
  </div>
) : (
  <button
    onClick={() => {
      setAuthTab("login");
      setAuthError(null);
      setIsAuthOpen(true);
    }}
    className="inline-flex items-center gap-1.5 text-xs font-bold tracking-tight text-brand-black dark:text-mint-400 hover:bg-black/15 bg-black/5 border border-black/20 px-4 py-2 rounded-full transition-colors cursor-pointer"
  >
    <User className="h-3.5 w-3.5 tracking-tight text-brand-black dark:text-mint-400" />
    <span>Entrar / Cadastrar</span>
  </button>
)}
          </div>
        </div>
      </header>

      {/* Roteador da Área de Trabalho Principal */}
      <main className="flex-1 pb-16">
        {currentView === "dashboard" && (
          <Dashboard
            lectures={lectures}
            onSelectLecture={handleSelectLecture}
            onAddLecture={handleAddLecture}
            onDeleteLecture={handleDeleteLecture}
            isAdding={isAdding}
          />
        )}

        {currentView === "lecture" && activeLecture && (
          <LectureView
            lecture={activeLecture}
            onBack={() => setCurrentView("dashboard")}
            onLaunchRecall={(mode) => {
              setRecallMode(mode);
              setCurrentView("recall");
            }}
            onAskQuestion={handleAskQuestion}
            isResponding={isResponding}
          />
        )}
        {currentView === "profile" && activeProfile && (
          <UserProfile
            user={activeProfile}
            lectures={ownedLectures}
            onBack={() => setCurrentView("dashboard")}
            onSave={handleProfileSave}
            onSelectLecture={handleSelectLecture}
            onChangePassword={handleChangePassword}
            onLogoutAll={handleLogout}
          />
        )}

        {currentView === "recall" && activeLecture && (
          <RecallStage
            lecture={activeLecture}
            mode={recallMode}
            onBack={() => setCurrentView("lecture")}
            onUpdateFlashcard={handleUpdateFlashcard}
          />
        )}
      </main>

      {/* Footer minimalista em Português */}
      <footer className="border-t border-neutral-200/60 dark:border-neutral-900 py-6 text-center text-xs text-neutral-450 dark:text-neutral-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>&copy; 2026 Plataforma NewStudy. Todos os direitos reservados.</span>
          <button
                    type="button"
                    onClick={() => openLegalSection("terms")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl  py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 transition-colors">
                    <FileText className="h-4 w-4" />
                    <span>Termos</span>
                  </button>
          <span className="flex items-center gap-1 opacity-80">
            <Sparkles className="h-3 w-3 text-brand-mint" /> Desenvolvido por RuzziDev
          </span>
        </div>
      </footer>

      {/* Sleek, Center-Popup Modal de Autenticação Dual-Tab */}
      <AnimatePresence>
        {isAuthOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
            {/* Backdrop com blur sofisticado */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthOpen(false)}
              className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm"
            />
            
           <motion.div
  initial={{ scale: 0.95, opacity: 0, y: 15 }}
  animate={{ scale: 1, opacity: 1, y: 0 }}
  exit={{ scale: 0.95, opacity: 0, y: 15 }}
  className="bg-white text-neutral-300 dark:text-neutral-800 dark:bg-neutral-900 
             border border-neutral-200 dark:border-neutral-800 
             rounded-3xl p-4 sm:p-6 lg:p-8 
             w-full max-w-sm sm:max-w-md 
             mx-4 sm:mx-auto 
             shadow-2xl relative z-10 flex max-h-[calc(100dvh-2rem)] flex-col gap-6 overflow-y-auto overscroll-contain"
  id="form-all"
>
              <button
                type="button"
                onClick={() => setIsAuthOpen(false)}
                className="absolute right-4 top-4 p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Fechar janela de autenticação"
                title="Fechar janela de autenticação"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 rounded-2xl mb-3 shadow-md">
                  <User className="h-6 w-6" />
                </div>
                <h3 className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 ">
                  {authTab === "login" ? "Acesse sua conta estagiada" : "Crie seu deck acadêmico"}
                </h3>
                <p className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 ">
                  {authTab === "login"
                    ? "Conecte-se para puxar seus resumos de aulas salvos."
                    : "Guarde seus materiais individuais de forma privada."}
                </p>
              </div>

              {/* Seletor de Abas */}
              <div className="grid grid-cols-2 bg-neutral-100 dark:bg-neutral-805/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setAuthTab("login"); setAuthError(null); setAuthAvatar(""); }}
                  className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    authTab === "login"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm"
                      : "text-neutral-450 dark:text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthTab("register"); setAuthError(null); }}
                  className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    authTab === "register"
                      ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-sm"
                      : "text-neutral-450 dark:text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  Criar Conta
                </button>
              </div>

             

              <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4" id="auth-form">
                {authTab === "register" && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 font-mono tracking-wider uppercase">
                      Foto de Perfil
                    </label>
                    <div className="flex items-center gap-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-805 px-3 py-3">
                      <div className="h-12 w-12 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800 ring-1 ring-black/5 flex items-center justify-center">
                        {authAvatar ? (
                          <img src={authAvatar} alt="Prévia da foto" className="h-full w-full object-cover" />
                        ) : (
                          <UserCircle2 className="h-6 w-6 text-neutral-500" />
                        )}
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl bg-neutral-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100">
                          <Camera className="h-3.5 w-3.5" />
                          Adicionar foto
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAuthAvatarChange}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          PNG, JPG ou WEBP até 5 MB.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {authTab === "register" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 font-mono tracking-wider uppercase">
                      Nome de Estudante
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="Ex: Matheus Vasconcelos"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full text-xs py-3 pl-9 pr-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-805 text-neutral-900 dark:text-neutral-150 focus:outline-none focus:border-neutral-900 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 font-mono tracking-wider uppercase">
                    E-mail Institucional ou Pessoal
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="Ex: estudante@newstudy.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full text-xs py-3 pl-9 pr-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-805 text-neutral-900 dark:text-neutral-150 focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-neutral-450 dark:text-neutral-500 font-mono tracking-wider uppercase">
                    Senha de Segurança
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400 pointer-events-none" />
                    <input
                      type="password"
                      required
                      placeholder="No mínimo 6 caracteres"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full text-xs py-3 pl-9 pr-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-805 text-neutral-900 dark:text-neutral-150 focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                  </div>
                </div>

                {authTab === "register" && (
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/50 p-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasAcceptedLegal}
                        onChange={(e) => setHasAcceptedLegal(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                      />
                      <span className="text-xs leading-5 text-neutral-600 dark:text-neutral-300">
                        Confirmo que li e concordo com os Termos de Uso, a Política de Privacidade e a Política de Cookies.
                      </span>
                      <button
                    type="button"
                    onClick={() => openLegalSection("terms")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-850 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Termos</span>
                  </button>
                    </label>
                  
                  </div>
                )}

                {authError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs bg-red-500/5 border border-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-xl flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                    <span>{authError}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={authLoading || (authTab === "register" && !hasAcceptedLegal)}
                  className="w-full py-3 mt-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {authLoading ? (
                    <div className="h-4 w-4 border-2 border-neutral-300 dark:border-neutral-600 border-t-white dark:border-t-black rounded-full animate-spin" />
                  ) : authTab === "login" ? (
                    <>
                      <LogIn className="h-3.5 w-3.5" />
                      <span>Conectar ao Sistema</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Criar Cadastro Acadêmico</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLegalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm px-4 py-6 flex items-center justify-center"
            onClick={() => setIsLegalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-2xl flex flex-col"
            >
              <div className="border-b border-neutral-200 dark:border-neutral-800 px-6 py-5 flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 dark:bg-neutral-900 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                    <Scale className="h-3.5 w-3.5" />
                    <span>{activeLegalDocument.badge}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
                      {activeLegalDocument.title}
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 max-w-3xl">
                      {activeLegalDocument.subtitle}
                    </p>
                  </div>
                  <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
                    Atualizado em {activeLegalDocument.updatedAt}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLegalOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  aria-label="Fechar janela de documentos legais"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 flex flex-wrap gap-2">
                {LEGAL_SECTION_ORDER.map((section) => {
                  const legalDoc = LEGAL_DOCUMENTS[section];
                  const active = legalSection === section;
                  return (
                    <button
                      key={section}
                      type="button"
                      onClick={() => setLegalSection(section)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                        active
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      }`}
                    >
                      {section === "terms" ? (
                        <Scale className="h-3.5 w-3.5" />
                      ) : section === "privacy" ? (
                        <Database className="h-3.5 w-3.5" />
                      ) : (
                        <Cookie className="h-3.5 w-3.5" />
                      )}
                      <span>{legalDoc.title}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="max-w-4xl space-y-6">
                  {activeLegalDocument.blocks.map((block) => (
                    <section
                      key={block.title}
                      className="border-b border-neutral-200/70 dark:border-neutral-800/70 pb-5 last:border-b-0 last:pb-0"
                    >
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                        {block.title}
                      </h3>
                      {block.body && (
                        <p className="mt-2 text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                          {block.body}
                        </p>
                      )}
                      {block.bullets && (
                        <ul className="mt-3 space-y-2">
                          {block.bullets.map((item) => (
                            <li
                              key={item}
                              className="flex items-start gap-2 text-sm leading-7 text-neutral-600 dark:text-neutral-300"
                            >
                              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  ))}

                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-4 text-sm text-amber-900 dark:text-amber-100 flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="leading-7">
                     Ler com cuidado e atenção. Esses documentos são a base do nosso compromisso mútuo para uma experiência de estudo segura, transparente e eficaz. Se tiver dúvidas, entre em contato conosco antes de aceitar.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
