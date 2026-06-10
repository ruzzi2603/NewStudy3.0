import { Save } from "lucide-react";
import type { UserProfileData } from "./profileTypes";

interface ProfileFormProps {
  value: UserProfileData;
  onChange: (next: UserProfileData) => void;
  onSave: () => void;
}

export default function ProfileForm({ value, onChange, onSave }: ProfileFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
      className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5"
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-zinc-900">Dados do perfil</h2>
        <p className="text-sm text-zinc-500">
          Atualize as informações visíveis da sua conta.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome">
          <input
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500"
          />
        </Field>

        <Field label="E-mail">
          <input
            value={value.email}
            readOnly
            className="w-full cursor-not-allowed rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm text-zinc-500 outline-none"
          />
        </Field>

        <Field label="Instituição">
          <input
            value={value.institution}
            onChange={(e) => onChange({ ...value, institution: e.target.value })}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500"
          />
        </Field>

        <Field label="Curso">
          <input
            value={value.course}
            onChange={(e) => onChange({ ...value, course: e.target.value })}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500"
          />
        </Field>

        <Field label="Semestre / período">
          <input
            value={value.semester}
            onChange={(e) => onChange({ ...value, semester: e.target.value })}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500"
          />
        </Field>

        <Field label="Tema da interface">
          <select
            value={value.theme}
            onChange={(e) =>
              onChange({
                ...value,
                theme: e.target.value as UserProfileData["theme"],
              })
            }
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500"
          >
            <option value="claro">Claro</option>
            <option value="escuro">Escuro</option>
            <option value="violeta">Violeta</option>
          </select>
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Biografia curta">
          <textarea
            rows={4}
            value={value.bio}
            onChange={(e) => onChange({ ...value, bio: e.target.value })}
            className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500"
          />
        </Field>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-700"
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
  children: React.ReactNode;
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