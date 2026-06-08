/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Menu,
  X,
  Search,
  Home,
  BookOpen,
  LogOut,
  User,
  Clock,
} from "lucide-react";

interface SidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;

  lectures: any[];

  selectedLectureId: string | null;

  searchQuery: string;

  onSearchChange: (value: string) => void;

  onSelectLecture: (id: string) => void;



  onLogout: () => void;
}

export default function Sidebar({
  user,
  lectures,
  selectedLectureId,
  searchQuery,
  onSearchChange,
  onSelectLecture,
  onLogout,
}: SidebarProps) {
 const [open, setOpen] = useState(false); // mobile
const [collapsed, setCollapsed] = useState(true);// desktop

  return (
     <>
    {/* Botão Mobile */}
    <button
      onClick={() => setOpen(true)}
      className="fixed top-4 left-4 z-50 lg:hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-2 shadow-lg"
    >
      <Menu size={20} />
    </button>

    {/* Botão para reabrir no Desktop */}
    {collapsed && (
      <button
        onClick={() => setCollapsed(false)}
        className="
        position: fixed
          hidden lg:flex
           left-4 top-3 z-[60]
          h-10 w-10
          items-center justify-center
          rounded-xl
          bg-white dark:bg-neutral-900
          border border-neutral-200 dark:border-neutral-800
          shadow-lg
          hover:bg-neutral-100
          dark:hover:bg-neutral-800
          transition
        "
     >
        <Menu size={18} />
      </button>
    )}

    {/* Overlay */}
    {open && (
      <div
        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        onClick={() => setOpen(false)}
      />
    )}

    {/* Sidebar */}
     <aside
  className={`
    fixed top-0 left-0 z-50
    h-screen
  w- 200
    bg-white dark:bg-neutral-950
    border-r border-neutral-200 dark:border-neutral-800
    transition-all duration-300
    flex flex-col

    lg:${collapsed ? "-translate-x-full" : "translate-x-0"}

    ${open ? "translate-x-0" : "-translate-x-full"}
  `}
>
  
       {/* Header */}
<div className="h-16 border-b border-neutral-200 dark:border-neutral-800 px-5 flex items-center justify-between">
  {!collapsed && (
    <div>
      <h2 className="font-bold text-lg">NewStudy</h2>
      <p className="text-xs text-neutral-500">
        Plataforma Inteligente
      </p>
    </div>
  )}

  <div className="flex items-center gap-2">
    {/* Recolher Sidebar (Desktop) */}
    <button
      onClick={() => setCollapsed(!collapsed)}
      className="
        hidden lg:flex
        h-9 w-9
        items-center justify-center
        rounded-lg
        hover:bg-neutral-100
        dark:hover:bg-neutral-900
        transition
      "
    >
      {collapsed ? <Menu size={18} /> : <X size={18} />}
    </button>

    {/* Fechar Mobile */}
    <button
      onClick={() => setOpen(false)}
      className="
        lg:hidden
        h-9 w-9
        flex items-center justify-center
        rounded-lg
        hover:bg-neutral-100
        dark:hover:bg-neutral-900
        transition
      "
    >
      <X size={18} />
    </button>
  </div>
</div>

        {/* Usuário */}
        {user && (
          <div className="p-5 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                {user.name.charAt(0)}
              </div>

              <div>
                <h3 className="font-semibold">
                  {user.name}
                </h3>

                <p className="text-xs text-neutral-500">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navegação */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          
        </div>

        {/* Busca */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-3 text-neutral-400"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) =>
                onSearchChange(e.target.value)
              }
              placeholder="Buscar materiais..."
              className="
                w-full
                pl-9
                pr-3
                py-3
                rounded-xl
                border
                border-neutral-200
                dark:border-neutral-700
                bg-neutral-50
                dark:bg-neutral-900
                text-sm
              "
            />
          </div>
        </div>

        {/* Lista de aulas */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-4 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Materiais ({lectures.length})
            </h4>
          </div>

          <div className="px-3 space-y-2">
            {lectures.map((lecture) => {
              const active =
                lecture.id === selectedLectureId;

              return (
                <button
                  key={lecture.id}
                  onClick={() => {
                    onSelectLecture(lecture.id);
                    setOpen(false);
                  }}
                  className={`
                    w-full
                    text-left
                    p-3
                    rounded-xl
                    transition
                    border
                    ${
                      active
                        ? "bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800"
                        : "bg-transparent border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    }
                  `}
                >
                  <div className="flex gap-3">
                    <BookOpen
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <div className="min-w-0">
                      <h3 className="font-medium truncate">
                        {lecture.title}
                      </h3>

                      <p className="text-xs text-neutral-500 truncate">
                        {lecture.category}
                      </p>

                      <div className="flex items-center gap-1 mt-2 text-[11px] text-neutral-400">
                        <Clock size={11} />
                        {lecture.status}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 p-4">
          {user ? (
            <button
              onClick={onLogout}
              className="
                w-full
                flex
                items-center
                justify-center
                gap-2
                py-3
                rounded-xl
                bg-red-500
                hover:bg-red-600
                text-white
                font-medium
                transition
              "
            >
              <LogOut size={16} />
              Sair
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
              <User size={16} />
              Não autenticado
            </div>
          )}
        </div>
      </aside>
    </>
  );
}