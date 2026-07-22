import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import {
  getClientes,
  getRepuestos,
  getTecnicos,
  getVehiculos,
} from "@/lib/queries";
import { crearOrden } from "./actions";

export const dynamic = "force-dynamic";

const labelCls = "block text-sm font-medium text-foreground mb-1";
const fieldCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export default async function NuevaOrdenPage() {
  await requireAdmin();
  const [clientes, repuestos, tecnicos, vehiculos] = await Promise.all([
    getClientes(),
    getRepuestos(),
    getTecnicos(),
    getVehiculos(),
  ]);

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <Link
          href="/ordenes"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Órdenes
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          Nueva Orden de Trabajo
        </h1>
        <p className="text-sm text-muted">
          Registra la falla y asigna el técnico. Si asignas técnico, le llega
          como <span className="font-medium">Asignada</span>.
        </p>
      </header>

      <form
        action={crearOrden}
        className="bg-surface rounded-xl border border-border shadow-sm p-6 space-y-5"
      >
        <div>
          <label className={labelCls}>Cliente *</label>
          <select name="cliente_id" required className={fieldCls} defaultValue="">
            <option value="" disabled>
              Selecciona un cliente
            </option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Descripción de la falla</label>
          <textarea
            name="descripcion"
            rows={3}
            className={fieldCls}
            placeholder="Ej: Pulsador no responde, ordeño intermitente"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Repuesto requerido</label>
            <select name="repuesto_id" className={fieldCls} defaultValue="">
              <option value="">— Sin definir —</option>
              {repuestos.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre} ({r.sku})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Prioridad</label>
            <select name="prioridad" className={fieldCls} defaultValue="3">
              <option value="1">Alta</option>
              <option value="2">Media</option>
              <option value="3">Baja</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Asignar técnico</label>
            <select name="tecnico_id" className={fieldCls} defaultValue="">
              <option value="">— Sin asignar —</option>
              {tecnicos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Vehículo</label>
            <select name="vehiculo_id" className={fieldCls} defaultValue="">
              <option value="">— Sin asignar —</option>
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.patente}
                  {v.modelo ? ` · ${v.modelo}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-brand-dark text-white px-5 py-2.5 text-sm font-medium hover:bg-brand transition-colors"
          >
            Crear orden
          </button>
          <Link
            href="/ordenes"
            className="text-sm text-muted hover:text-foreground"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
