import { BookOpen, Brain, MessageCircleQuestion, FileText, Clock3 } from "lucide-react";
import type { StudySession } from "./profileTypes";

interface StudyHistoryProps {
  sessions: StudySession[];
}

const iconMap = {
  slides: BookOpen,
  flashcards: Brain,
  quiz: FileText,
  chat: MessageCircleQuestion,
};

export default function StudyHistory({ sessions }: StudyHistoryProps) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-zinc-900">Histórico recente</h2>
        <p className="text-sm text-zinc-500">
          Últimas sessões registradas na plataforma.
        </p>
      </div>

      <div className="space-y-3">
        {sessions.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhuma sessão encontrada.</p>
        ) : (
          sessions.map((session) => {
            const Icon = iconMap[session.activity];

            return (
              <article
                key={session.id}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                    <Icon size={18} />
                  </div>

                  <div>
                    <h3 className="font-medium text-zinc-900">{session.title}</h3>
                    <p className="text-sm text-zinc-500 capitalize">
                      Atividade: {session.activity}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-zinc-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 size={14} />
                    {session.duration}
                  </span>
                  <span>{session.date}</span>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}