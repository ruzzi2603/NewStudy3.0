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
              className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                <Icon size={18} />
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{card.label}</p>
              <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{card.value}</p>
            </div>
          );
        })}
      </div>
    );
  }