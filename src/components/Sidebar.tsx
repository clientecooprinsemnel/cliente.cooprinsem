"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Truck, Wrench } from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ordenes", label: "Órdenes de Trabajo", icon: ClipboardList },
  { href: "/tecnico", label: "Ruta del Técnico", icon: Truck },
];

export function Sidebar() {
  const pathname = usePathname();

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
        <div className="px-6 py-4 text-xs text-white/40 border-t border-white/10">
          Demo · datos de ejemplo
        </div>
      </aside>

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
