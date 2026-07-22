"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Truck,
  Wrench,
  LogOut,
} from "lucide-react";
import { cerrarSesion } from "@/lib/auth-actions";
import type { Enums } from "@/types/database";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };

const navAdmin: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ordenes", label: "Órdenes de Trabajo", icon: ClipboardList },
  { href: "/tecnico", label: "Ruta del Técnico", icon: Truck },
];

const navTecnico: NavItem[] = [
  { href: "/tecnico", label: "Mis Órdenes", icon: ClipboardList },
];

export function Sidebar({
  rol,
  nombre,
}: {
  rol: Enums<"rol_usuario">;
  nombre: string;
}) {
  const pathname = usePathname();
  const nav = rol === "tecnico" ? navTecnico : navAdmin;
  const rolLabel =
    rol === "admin" ? "Administrador" : rol === "coordinador" ? "Coordinador" : "Técnico";

  return (
    <>
      {/* Sidebar en escritorio */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-brand-dark text-white">
        <div className="flex items-center gap-2 px-6 h-16 border-b border-white/10">
          <Wrench className="h-6 w-6" />
          <div className="leading-tight">
            <p className="font-semibold">Cooprinsem</p>
            <p className="text-xs text-white/60">Control de Mantención</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-sm font-medium truncate">{nombre}</p>
          <p className="text-xs text-white/50 mb-3">{rolLabel}</p>
          <form action={cerrarSesion}>
            <button
              type="submit"
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Barra superior en móvil */}
      <header className="md:hidden sticky top-0 z-20 bg-brand-dark text-white flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          <span className="font-semibold text-sm">Cooprinsem</span>
        </div>
        <form action={cerrarSesion}>
          <button type="submit" className="text-white/70">
            <LogOut className="h-5 w-5" />
          </button>
        </form>
      </header>

      {/* Barra inferior en móvil */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-brand-dark text-white flex justify-around border-t border-white/10">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-2 px-3 text-[11px] ${
                active ? "text-white" : "text-white/60"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
