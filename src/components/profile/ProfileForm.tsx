import { Save } from "lucide-react";
import type { ReactNode } from "react";
import type { UserProfileData } from "./profileTypes";

interface ProfileFormProps {
  value: UserProfileData;
  onChange: (next: UserProfileData) => void;
  onSave: (next: UserProfileData) => void;
}

export default function ProfileForm({ value, onChange, onSave }: ProfileFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(value);
      }}
      className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Dados do perfil</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Atualize as informações visíveis da sua conta.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome">
          <input
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            title="Nome"
            placeholder="Seu nome"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-neutral-950 dark:text-zinc-100"
          />
        </Field>

        <Field label="E-mail">
          <input
            value={value.email}
            readOnly
            title="E-mail"
            className="w-full cursor-not-allowed rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm text-zinc-500 outline-none dark:border-white/10 dark:bg-neutral-950 dark:text-zinc-400"
          />
        </Field>

        <Field label="Instituição">
          <input
            value={value.institution}
            onChange={(e) => onChange({ ...value, institution: e.target.value })}
            title="Instituição"
            placeholder="Sua instituição"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-neutral-950 dark:text-zinc-100"
          />
        </Field>

        <Field label="Universidade">
          <input
            value={value.university}
            onChange={(e) => onChange({ ...value, university: e.target.value })}
            title="Universidade"
            placeholder="Sua universidade"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-neutral-950 dark:text-zinc-100"
          />
        </Field>

        <Field label="Curso">
          <input
            value={value.course}
            onChange={(e) => onChange({ ...value, course: e.target.value })}
            title="Curso"
            placeholder="Seu curso"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-neutral-950 dark:text-zinc-100"
          />
        </Field>

        <Field label="Semestre / período">
          <input
            value={value.semester}
            onChange={(e) => onChange({ ...value, semester: e.target.value })}
            title="Semestre ou período"
            placeholder="Ex.: 4º semestre"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-neutral-950 dark:text-zinc-100"
          />
        </Field>

        <Field label="Telefone">
          <input
            value={value.phone}
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
            title="Telefone"
            placeholder="(00) 00000-0000"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-neutral-950 dark:text-zinc-100"
          />
        </Field>

        <Field label="Localização">
          <input
            value={value.location}
            onChange={(e) => onChange({ ...value, location: e.target.value })}
            title="Localização"
            placeholder="Cidade e estado"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-neutral-950 dark:text-zinc-100"
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Biografia curta">
          <textarea
            rows={4}
            value={value.bio}
            onChange={(e) => onChange({ ...value, bio: e.target.value })}
            title="Biografia curta"
            placeholder="Conte um pouco sobre sua rotina de estudos"
            className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-neutral-950 dark:text-zinc-100"
          />
        </Field>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-zinc-200"
        >
          <Save size={16} />
          Salvar alterações
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}