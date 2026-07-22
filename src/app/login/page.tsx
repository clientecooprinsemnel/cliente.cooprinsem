"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-brand-dark text-white flex items-center justify-center">
            <Wrench className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-xl font-bold text-foreground">Cooprinsem</h1>
          <p className="text-sm text-muted">Control de Mantención</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface rounded-xl border border-border shadow-sm p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Correo
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="tu@correo.cl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-dark text-white py-2.5 text-sm font-medium hover:bg-brand transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
