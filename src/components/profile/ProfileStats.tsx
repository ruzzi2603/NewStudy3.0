import {
    BookOpen,
    StickyNote,
    CircleCheckBig,
    Clock3,
    Star,
    CalendarClock,
  } from "lucide-react";
  import type { ProfileStats as ProfileStatsType } from "./profileTypes";
  
  interface ProfileStatsProps {
    stats: ProfileStatsType;
  }
  
  export default function ProfileStats({ stats }: ProfileStatsProps) {
    const cards = [
      { label: "Módulos criados", value: stats.lecturesCreated, icon: BookOpen },
      { label: "Flashcards revisados", value: stats.flashcardsReviewed, icon: StickyNote },
      { label: "Quizzes concluídos", value: stats.quizzesCompleted, icon: CircleCheckBig },
      { label: "Horas estudadas", value: stats.studyHours, icon: Clock3 },
      { label: "Favoritos", value: stats.favoriteMaterials, icon: Star },
      {
        label: "Último acesso",
        value: stats.lastAccess ?? "—",
        icon: CalendarClock,
      },
    ];
  
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
  
          return (
            <div
              key={card.label}
              className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                <Icon size={18} />
              </div>
              <p className="text-sm text-zinc-500">{card.label}</p>
              <p className="mt-1 text-2xl font-semibold text-zinc-900">{card.value}</p>
            </div>
          );
        })}
      </div>
    );
  }