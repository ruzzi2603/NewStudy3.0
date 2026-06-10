import { LockKeyhole, LogOut } from "lucide-react";
import { useState } from "react";

interface SecuritySectionProps {
  onChangePassword?: (currentPassword: string, newPassword: string) => void;
  onLogoutAll?: () => void;
}

export default function SecuritySection({
  onChangePassword,
  onLogoutAll,
}: SecuritySectionProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      alert("A nova senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }

    onChangePassword?.(currentPassword, newPassword);
    alert("Senha atualizada com sucesso.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-zinc-900">Segurança da conta</h2>
        <p className="text-sm text-zinc-500">
          Troque sua senha e encerre sessões remotas.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <Field label="Senha atual">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500"
          />
        </Field>

        <Field label="Nova senha">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500"
          />
        </Field>

        <Field label="Confirmar nova senha">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500"
          />
        </Field>

        <div className="mt-2 flex flex-wrap gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            <LockKeyhole size={16} />
            Salvar nova senha
          </button>

          <button
            type="button"
            onClick={onLogoutAll}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            <LogOut size={16} />
            Sair de todos os dispositivos
          </button>
        </div>
      </form>
    </section>
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