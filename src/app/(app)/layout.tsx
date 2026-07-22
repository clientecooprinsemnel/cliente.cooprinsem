import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sesion = await requireUser();
  const rol = sesion.perfil?.rol ?? "tecnico";
  const nombre = sesion.perfil?.nombre ?? sesion.email;

  return (
    <>
      <Sidebar rol={rol} nombre={nombre} />
      <main className="md:pl-64 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">{children}</div>
      </main>
    </>
  );
}
