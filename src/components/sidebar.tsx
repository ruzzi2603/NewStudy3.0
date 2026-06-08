/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Menu,
  X,
  Search,
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
  const [collapsed, setCollapsed] = useState(true); // desktop FECHADO por padrão

  const closeAll = () => {
    setOpen(false);
  };

  return (
    <>
      {/* BOTÃO MOBILE (abrir) */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-[60] lg:hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-2 shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* BOTÃO DESKTOP (reabrir) */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="hidden lg:flex fixed top-4 left-4 z-[60] h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg"
        >
          <Menu size={18} />
        </button>
      )}

      {/* OVERLAY MOBILE */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR MOBILE */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-80
          bg-white dark:bg-neutral-950
          border-r border-neutral-200 dark:border-neutral-800
          flex flex-col
          transition-transform duration-300
          lg:hidden
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* HEADER MOBILE */}
        <div className="h-16 border-b border-neutral-200 dark:border-neutral-800 px-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">NewStudy</h2>
            <p className="text-xs text-neutral-500">
              Plataforma Inteligente
            </p>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="h-9 w-9 flex items-center justify-center rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTEÚDO */}
        <SidebarContent
        
          user={user}
          lectures={lectures}
          selectedLectureId={selectedLectureId}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSelectLecture={(id) => {
            onSelectLecture(id);
            setOpen(false);
          }}
          onLogout={onLogout}
        />
      </aside>

      {/* SIDEBAR DESKTOP */}
      <aside
        className={`
          hidden lg:flex
          fixed top-0 left-0 z-50
          h-screen w-80
          bg-white dark:bg-neutral-950
          border-r border-neutral-200 dark:border-neutral-800
          flex flex-col
          transition-transform duration-300
          ${collapsed ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        {/* HEADER DESKTOP */}
        <div className="h-16 border-b border-neutral-200 dark:border-neutral-800 px-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">NewStudy</h2>
            <p className="text-xs text-neutral-500">
              Plataforma Inteligente
            </p>
          </div>

          <button
            onClick={() => setCollapsed(true)}
            className="h-9 w-9 flex items-center justify-center rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTEÚDO */}
        <SidebarContent
          user={user}
          lectures={lectures}
          selectedLectureId={selectedLectureId}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSelectLecture={onSelectLecture}
          onLogout={onLogout}
        />
      </aside>
    </>
  );
}

/* ========================= */
/* COMPONENTE INTERNO LIMPO  */
/* ========================= */

function SidebarContent({
  user,
  lectures,
  selectedLectureId,
  searchQuery,
  onSearchChange,
  onSelectLecture,
  onLogout,
}: any) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  return (
    <>
      {/* USER */}
      {user && (
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
              {user.name.charAt(0)}
            </div>

            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-xs text-neutral-500">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-neutral-400" size={16} />

          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar materiais..."
            className="w-full pl-9 pr-3 py-3 rounded-xl border bg-neutral-50 dark:bg-neutral-900 text-gray"
          />
        </div>
      </div>

      {/* LISTA */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {lectures.map((lecture: any) => {
          const active = lecture.id === selectedLectureId;

          return (
            <button
              key={lecture.id}
              onClick={() => onSelectLecture(lecture.id)}
              className={`w-full text-left p-3 rounded-xl border transition ${
                active
                  ? "bg-blue-50 border-blue-200 dark:bg-blue-950/40"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-900 border-transparent"
              }`}
            >
              <div className="flex gap-3">
                <BookOpen size={18} />

                <div>
                  <p className="font-medium">{lecture.title}</p>
                  <p className="text-xs text-neutral-500">
                    {lecture.category}
                  </p>

                  <p className="text-[11px] text-neutral-400 flex items-center gap-1 mt-1">
                    <Clock size={10} />
                    {lecture.status}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 p-4">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 text-white"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
      {showLogoutModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-[90%] max-w-sm border border-neutral-200 dark:border-neutral-800 shadow-xl">
      
      <h2 className="text-lg font-bold mb-2">
        Confirmar saída
      </h2>

      <p className="text-sm text-neutral-500 mb-6">
        Tem certeza que deseja sair da sua conta?
      </p>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowLogoutModal(false)}
          className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800"
        >
          Cancelar
        </button>

        <button
          onClick={() => {
            setShowLogoutModal(false);
            onLogout();
          }}
          className="px-4 py-2 rounded-xl bg-red-500 text-white"
        >
          Sair
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
}