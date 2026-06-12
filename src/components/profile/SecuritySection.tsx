import { LockKeyhole, LogOut } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";

interface SecuritySectionProps {
  email?: string;
  onChangePassword?: (currentPassword: string, newPassword: string) => void;
  onRequestRecovery?: (email: string) => void;
  onLogoutAll?: () => void;
}

export default function SecuritySection({
  email,
  onChangePassword,
  onRequestRecovery,
  onLogoutAll,
}: SecuritySectionProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      alert("A nova senha precisa ter pelo menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }

    try {
      await onChangePassword?.(currentPassword, newPassword);
      alert("Senha atualizada com sucesso.");
    } catch {
      alert("Não foi possível atualizar a senha agora.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleRecovery = () => {
    if (!email) {
      alert("Nenhum e-mail de recuperação foi informado.");
      return;
    }

    onRequestRecovery?.(email);
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Segurança da conta</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Troque sua senha, recupere o acesso e encerre sessões remotas.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <Field label="Senha atual">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            title="Senha atual"
            placeholder="Digite sua senha atual"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-neutral-950 dark:text-zinc-100"
          />
        </Field>

        <Field label="Nova senha">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            title="Nova senha"
            placeholder="Crie uma nova senha"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-neutral-950 dark:text-zinc-100"
          />
        </Field>

        <Field label="Confirmar nova senha">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            title="Confirmar nova senha"
            placeholder="Repita a nova senha"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-neutral-950 dark:text-zinc-100"
          />
        </Field>

        <div className="mt-2 flex flex-wrap gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-zinc-200"
          >
            <LockKeyhole size={16} />
            Salvar nova senha
          </button>

          <button
            type="button"
            onClick={handleRecovery}
            className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-5 py-3 text-sm font-medium text-violet-700 transition hover:bg-violet-100 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
          >
            Recuperar senha
          </button>

          <button
            type="button"
            onClick={onLogoutAll}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-neutral-950 dark:text-zinc-200 dark:hover:bg-neutral-800"
          >
            <LogOut size={16} />
            Sair de todos os dispositivos
          </button>
        </div>
      </form>

      <div className="mt-6 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600 dark:bg-neutral-950 dark:text-zinc-300">
        <p className="font-medium text-zinc-900 dark:text-zinc-50">Recuperação de acesso</p>
        <p className="mt-1">
          No estado atual do projeto, o botão de recuperação dispara o fluxo configurado na interface. Quando o backend de reset estiver disponível, este ponto já estará pronto para integração.
        </p>
      </div>
    </section>
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