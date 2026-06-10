import {
    User,
    BookOpen,
    Star,
    BarChart3,
    Settings,
    Moon,
    LogOut,
    ChevronDown,
  } from "lucide-react";
  import { useState } from "react";
  
  interface UserDropdownProps {
    userName: string;
    email: string;
    avatar?: string;
  
    onProfile: () => void;
    onMaterials: () => void;
    onFavorites: () => void;
    onStatistics: () => void;
    onSettings: () => void;
    onTheme: () => void;
    onLogout: () => void;
  }
  
  export default function UserDropdown({
    userName,
    email,
    avatar,
  
    onProfile,
    onMaterials,
    onFavorites,
    onStatistics,
    onSettings,
    onTheme,
    onLogout,
  }: UserDropdownProps) {
    const [open, setOpen] = useState(false);
  
    const initials = userName
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  
    return (
      <div className="relative">
        {/* BOTÃO */}
        <button
          onClick={() => setOpen(!open)}
          className="
            flex items-center gap-2
            rounded-full
            border border-zinc-200
            bg-white
            px-3 py-2
            shadow-sm
            transition-all
            hover:shadow-md
          "
        >
          <div className="h-8 w-8 overflow-hidden rounded-full bg-violet-100">
            {avatar ? (
              <img
                src={avatar}
                alt={userName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-violet-700">
                {initials}
              </div>
            )}
          </div>
  
          <ChevronDown
            size={16}
            className={`transition ${open ? "rotate-180" : ""}`}
          />
        </button>
  
        {/* DROPDOWN */}
        {open && (
          <div
            className="
              absolute right-0 top-14 z-50
              w-72
              overflow-hidden
              rounded-3xl
              border border-zinc-200
              bg-white
              shadow-2xl
            "
          >
            {/* HEADER */}
            <div className="border-b border-zinc-100 p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-full bg-violet-100">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={userName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-semibold text-violet-700">
                      {initials}
                    </div>
                  )}
                </div>
  
                <div>
                  <h3 className="font-medium text-zinc-900">
                    {userName}
                  </h3>
  
                  <p className="text-sm text-zinc-500">
                    {email}
                  </p>
                </div>
              </div>
            </div>
  
            {/* MENU */}
            <div className="p-2">
              <DropdownItem
                icon={<User size={18} />}
                label="Meu Perfil"
                onClick={onProfile}
              />
  
              <DropdownItem
                icon={<BookOpen size={18} />}
                label="Meus Materiais"
                onClick={onMaterials}
              />
  
              <DropdownItem
                icon={<Star size={18} />}
                label="Favoritos"
                onClick={onFavorites}
              />
  
              <DropdownItem
                icon={<BarChart3 size={18} />}
                label="Estatísticas"
                onClick={onStatistics}
              />
            </div>
  
            <div className="border-t border-zinc-100 p-2">
              <DropdownItem
                icon={<Settings size={18} />}
                label="Configurações"
                onClick={onSettings}
              />
  
              <DropdownItem
                icon={<Moon size={18} />}
                label="Alterar Tema"
                onClick={onTheme}
              />
            </div>
  
            <div className="border-t border-zinc-100 p-2">
              <DropdownItem
                danger
                icon={<LogOut size={18} />}
                label="Sair"
                onClick={onLogout}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
  
  interface ItemProps {
    icon: React.ReactNode;
    label: string;
    danger?: boolean;
    onClick: () => void;
  }
  
  function DropdownItem({
    icon,
    label,
    danger,
    onClick,
  }: ItemProps) {
    return (
      <button
        onClick={onClick}
        className={`
          flex w-full items-center gap-3
          rounded-xl
          px-3 py-3
          text-sm
          transition
          ${
            danger
              ? "text-red-600 hover:bg-red-50"
              : "text-zinc-700 hover:bg-zinc-100"
          }
        `}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  }