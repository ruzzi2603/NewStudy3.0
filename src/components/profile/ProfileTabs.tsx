import { BookUser, ShieldCheck, History } from "lucide-react";
import type { ProfileTab } from "./profileTypes";

interface ProfileTabsProps {
  value: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}

export default function ProfileTabs({ value, onChange }: ProfileTabsProps) {
  const tabs: { key: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { key: "perfil", label: "Perfil", icon: <BookUser size={16} /> },
    { key: "seguranca", label: "Segurança", icon: <ShieldCheck size={16} /> },
    { key: "historico", label: "Histórico", icon: <History size={16} /> },
  ];

  return (
    <div className="flex flex-wrap gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-black/5">
      {tabs.map((tab) => {
        const active = value === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={[
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition",
              active
                ? "bg-violet-600 text-white shadow-sm"
                : "text-zinc-600 hover:bg-zinc-100",
            ].join(" ")}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}