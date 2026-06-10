import { useMemo, useState } from "react";
import type {
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
  onBack?: () => void;
  onSave?: (user: UserProfileData) => void;
}

const defaultUser: UserProfileData = {
  id: "1",
  name: "Seu nome",
  email: "seuemail@exemplo.com",
  avatar: "",
  bio: "Estudante focado em criar materiais inteligentes com o NewStudy.",
  institution: "Instituição não informada",
  course: "Curso não informado",
  semester: "—",
  theme: "light",
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

export default function UserProfile({ user, onBack, onSave }: UserProfileProps) {
  const [profile, setProfile] = useState<UserProfileData>(user ?? defaultUser);
  const [activeTab, setActiveTab] = useState<ProfileTab>("perfil");

  const summary = useMemo(
    () => [
      { label: "Nome", value: profile.name },
      { label: "E-mail", value: profile.email },
      { label: "Instituição", value: profile.institution },
      { label: "Curso", value: profile.course },
      { label: "Semestre", value: profile.semester },
      { label: "Tema", value: profile.theme },
    ],
    [profile]
  );

  const handleAvatarChange = (_file: File, previewUrl: string) => {
    setProfile((prev) => ({ ...prev, avatarUrl: previewUrl }));
  };

  const handleSaveProfile = () => {
    onSave?.(profile);
    alert("Perfil salvo com sucesso.");
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6 lg:px-8">
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

            {activeTab === "seguranca" && (
              <SecuritySection
                onChangePassword={(currentPassword, newPassword) => {
                  console.log("trocar senha", { currentPassword, newPassword });
                }}
                onLogoutAll={() => {
                  console.log("sair de todos os dispositivos");
                }}
              />
            )}

            {activeTab === "historico" && <StudyHistory sessions={profile.sessions} />}
          </div>

          <aside className="space-y-6">
            <AvatarUploader
              name={profile.name}
              currentAvatar={profile.avatar}
              onChange={handleAvatarChange}
            />

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h2 className="text-lg font-semibold text-zinc-900">Resumo rápido</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Visão geral da sua conta no NewStudy.
              </p>

              <div className="mt-5 space-y-4">
                {summary.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-zinc-50 px-4 py-3"
                  >
                    <span className="text-sm text-zinc-500">{item.label}</span>
                    <span className="max-w-[55%] truncate text-sm font-medium text-zinc-900">
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