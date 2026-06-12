import { ArrowLeft, PencilLine, ShieldCheck } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  email: string;
  avatarUrl?: string;
  institution?: string;
  course?: string;
  onBack?: () => void;
  onEdit?: () => void;
}

export default function ProfileHeader({
  name,
  email,
  avatarUrl,
  institution,
  course,
  onBack,
  onEdit,
}: ProfileHeaderProps) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-black/5 dark:bg-neutral-800 dark:ring-white/10">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-zinc-500 dark:text-zinc-300">
                {initials || "U"}
              </div>
            )}
          </div>

          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
              <ShieldCheck size={14} />
              Conta acadêmica
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{name}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{email}</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {institution ? `${institution}` : "Instituição não informada"}
              {course ? ` • ${course}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-neutral-950 dark:text-zinc-200 dark:hover:bg-neutral-800"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-zinc-200"
            >
              <PencilLine size={16} />
              Editar perfil
            </button>
          )}
        </div>
      </div>
    </section>
  );
}