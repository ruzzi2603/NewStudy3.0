import { useEffect, useMemo, useState } from "react";
import type { Lecture } from "../../types";
import type {
  AccountPreferences,
  ProfileTab,
  UserProfileData,
} from "./profileTypes";
import ProfileHeader from "./ProfileHeader";
import ProfileStats from "./ProfileStats";
import ProfileTabs from "./ProfileTabs";
import AvatarUploader from "./AvatarUploader";
import ProfileForm from "./ProfileForm";
import SecuritySection from "./SecuritySection";
import StudyHistory from "./StudyHistorie";

interface UserProfileProps {
  user?: UserProfileData;
  lectures?: Lecture[];
  onBack?: () => void;
  onSave?: (user: UserProfileData) => void;
  onSelectLecture?: (id: string) => void;
  onChangePassword?: (currentPassword: string, newPassword: string) => Promise<void> | void;
  onLogoutAll?: () => Promise<void> | void;
}

const defaultUser: UserProfileData = {
  id: "1",
  name: "Seu nome",
  email: "seuemail@exemplo.com",
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
    lecturesCreated: 12,
    flashcardsReviewed: 84,
    quizzesCompleted: 19,
    studyHours: 37,
    favoriteMaterials: 6,
    lastAccess: "Hoje",
  },
  sessions: [
    {
      id: "1",
      title: "Introdução a Banco de Dados",
      activity: "slides",
      duration: "25 min",
      date: "Hoje",
    },
    {
      id: "2",
      title: "Revisão de Flashcards",
      activity: "flashcards",
      duration: "18 min",
      date: "Ontem",
    },
    {
      id: "3",
      title: "Quiz de Programação",
      activity: "quiz",
      duration: "12 min",
      date: "Ontem",
    },
  ],
};

const defaultPreferences: AccountPreferences = {
  emailNotifications: true,
  autoSaveProgress: true,
  compactMode: false,
  privateAccount: false,
  weeklyDigest: true,
};

function normalizeProfile(input?: UserProfileData): UserProfileData {
  return {
    ...defaultUser,
    ...input,
    stats: {
      ...defaultUser.stats,
      ...input?.stats,
    },
    sessions: input?.sessions?.length ? input.sessions : defaultUser.sessions,
    avatar: input?.avatar ?? "",
    institution: input?.institution ?? defaultUser.institution,
    university: input?.university ?? defaultUser.university,
    course: input?.course ?? defaultUser.course,
    semester: input?.semester ?? defaultUser.semester,
    bio: input?.bio ?? defaultUser.bio,
    phone: input?.phone ?? defaultUser.phone,
    location: input?.location ?? defaultUser.location,
    theme: input?.theme ?? defaultUser.theme,
  };
}

function normalizePreferences(value?: Partial<AccountPreferences> | null): AccountPreferences {
  return {
    ...defaultPreferences,
    ...value,
  };
}

function preferenceKey(profileId: string) {
  return `newstudy_profile_prefs_${profileId}`;
}

function profileKey(profileId: string) {
  return `newstudy_profile_${profileId}`;
}

export default function UserProfile({
  user,
  lectures,
  onBack,
  onSave,
  onSelectLecture,
  onChangePassword,
  onLogoutAll,
}: UserProfileProps) {
  const [profile, setProfile] = useState<UserProfileData>(normalizeProfile(user));
  const [activeTab, setActiveTab] = useState<ProfileTab>("perfil");
  const [preferences, setPreferences] = useState<AccountPreferences>(defaultPreferences);

  useEffect(() => {
    setProfile(normalizeProfile(user));
  }, [user]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(preferenceKey(profile.id));
      setPreferences(normalizePreferences(saved ? JSON.parse(saved) : null));
    } catch {
      setPreferences(defaultPreferences);
    }
  }, [profile.id]);

  const summary = useMemo(
    () => [
      { label: "Nome", value: profile.name },
      { label: "E-mail", value: profile.email },
      { label: "Instituição", value: profile.institution },
      { label: "Curso", value: profile.course },
      { label: "Semestre", value: profile.semester },
    ],
    [profile]
  );

  const handleAvatarChange = (_file: File, previewUrl: string) => {
    setProfile((prev) => {
      const next = { ...prev, avatar: previewUrl };
      onSave?.(next);

      try {
        localStorage.setItem(profileKey(next.id), JSON.stringify(next));
      } catch {
        // Ignore storage errors in the UI layer.
      }

      return next;
    });
  };

  const handleSaveProfile = (nextProfile: UserProfileData) => {
    const next = normalizeProfile(nextProfile);
    setProfile(next);
    onSave?.(next);

    try {
      localStorage.setItem(profileKey(next.id), JSON.stringify(next));
    } catch {
      // Ignore storage errors in the UI layer.
    }

    alert("Perfil salvo com sucesso.");
  };

  const handlePasswordRecovery = (email: string) => {
    const subject = encodeURIComponent("Recuperação de senha - NewStudy");
    const body = encodeURIComponent(
      `Olá, gostaria de recuperar o acesso da conta ${email} no NewStudy.`
    );

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleExportData = () => {
    const payload = {
      profile,
      preferences,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `newstudy-account-${profile.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSavePreferences = (nextPreferences: AccountPreferences) => {
    setPreferences(nextPreferences);

    try {
      localStorage.setItem(preferenceKey(profile.id), JSON.stringify(nextPreferences));
    } catch {
      // Ignore storage errors in the UI layer.
    }
  };

  const renderContentTab = () => {
    const lecturesData = lectures ?? [];

    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Seus conteúdos</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Atalhos para seus materiais, aulas recentes e progresso salvo.
            </p>
          </div>
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
            {lecturesData.length} itens
          </span>
        </div>

        {lecturesData.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Nenhum conteúdo disponível nesta conta.</p>
        ) : (
          <div className="grid gap-3">
            {lecturesData.map((lecture) => (
              <article
                key={lecture.id}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-4 md:flex-row md:items-center md:justify-between dark:border-white/10 dark:bg-neutral-950"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{lecture.title}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{lecture.moduleName}</p>
                </div>

                <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                  <span>{lecture.category}</span>
                  <span>{Math.round(lecture.progress)}%</span>
                  {onSelectLecture && (
                    <button
                      type="button"
                      onClick={() => onSelectLecture(lecture.id)}
                      className="rounded-xl bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-zinc-200"
                    >
                      Abrir
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  };

  const renderSettingsTab = () => {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Configurações extras</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Preferências da conta, privacidade e exportação de dados.
          </p>
        </div>

        <div className="space-y-3">
          <ToggleRow
            label="Receber notificações por e-mail"
            description="Avisos de conteúdo novo, lembretes e alterações importantes."
            checked={preferences.emailNotifications}
            onChange={(checked) => handleSavePreferences({ ...preferences, emailNotifications: checked })}
          />
          <ToggleRow
            label="Salvar progresso automaticamente"
            description="Guarda alterações de perfil e preferências sem intervenção manual."
            checked={preferences.autoSaveProgress}
            onChange={(checked) => handleSavePreferences({ ...preferences, autoSaveProgress: checked })}
          />
          <ToggleRow
            label="Modo compacto"
            description="Reduz espaçamento da interface para melhor densidade de informação."
            checked={preferences.compactMode}
            onChange={(checked) => handleSavePreferences({ ...preferences, compactMode: checked })}
          />
          <ToggleRow
            label="Conta privada"
            description="Oculta dados de perfil e limita exposição de informações pessoais."
            checked={preferences.privateAccount}
            onChange={(checked) => handleSavePreferences({ ...preferences, privateAccount: checked })}
          />
          <ToggleRow
            label="Resumo semanal"
            description="Receba um consolidado do que foi estudado na semana."
            checked={preferences.weeklyDigest}
            onChange={(checked) => handleSavePreferences({ ...preferences, weeklyDigest: checked })}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExportData}
            className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-zinc-200"
          >
            Exportar dados da conta
          </button>

          <button
            type="button"
            onClick={() => handleSavePreferences(defaultPreferences)}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-neutral-950 dark:text-zinc-200 dark:hover:bg-neutral-800"
          >
            Restaurar preferências
          </button>
        </div>
      </section>
    );
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6 lg:px-8 dark:bg-neutral-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <ProfileHeader
          name={profile.name}
          email={profile.email}
          avatarUrl={profile.avatar}
          institution={profile.institution}
          course={profile.course}
          onBack={onBack}
          onEdit={() => setActiveTab("perfil")}
        />

        <ProfileStats stats={profile.stats} />

        <ProfileTabs value={activeTab} onChange={setActiveTab} />

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
          <div className="space-y-6">
            {activeTab === "perfil" && (
              <ProfileForm value={profile} onChange={setProfile} onSave={handleSaveProfile} />
            )}

            {activeTab === "conteudos" && renderContentTab()}

            {activeTab === "seguranca" && (
              <SecuritySection
                email={profile.email}
                onChangePassword={onChangePassword}
                onRequestRecovery={handlePasswordRecovery}
                onLogoutAll={onLogoutAll}
              />
            )}

            {activeTab === "historico" && <StudyHistory sessions={profile.sessions ?? []} />}

            {activeTab === "configuracoes" && renderSettingsTab()}
          </div>

          <aside className="space-y-6">
            <AvatarUploader
              name={profile.name}
              currentAvatar={profile.avatar}
              onChange={handleAvatarChange}
            />

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Resumo rápido</h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Visão geral da sua conta no NewStudy.
              </p>

              <div className="mt-5 space-y-4">
                {summary.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-neutral-950"
                  >
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">{item.label}</span>
                    <span className="max-w-[55%] truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-200 px-4 py-4">
      <div className="max-w-[75%]">
        <span className="block text-sm font-medium text-zinc-900">{label}</span>
        <span className="mt-1 block text-sm text-zinc-500">{description}</span>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 rounded-full transition ${checked ? "bg-violet-600" : "bg-zinc-300"}`}
        aria-label={label}
        title={label}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${checked ? "left-5" : "left-0.5"}`}
        />
      </button>
    </label>
  );
}