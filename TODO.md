# TODO — Plan de trabajo por rol (Cooprinsem · Control de Equipos en Mantención)

> Generado por el rol **architect**. Cada tarea indica el rol responsable.
> Meta inmediata: **demo funcional en producción (Vercel) para presentar a Raúl.**
> Orden sugerido: Fase 0 → 1 → 2 → 3 → 4. Fases 2 (developer) y 3 (ui_ux) pueden ir en paralelo.

---

## Fase 0 — Cimientos (architect) ✅ COMPLETADA
- [x] Definir stack tecnológico → `ARCHITECTURE.md`
- [x] Diseñar esquema de base de datos → `db/schema.sql`
- [x] Definir estructura de carpetas y contratos → `ARCHITECTURE.md`
- [x] Definir variables de entorno → `.env.example`
- [x] Scaffolding real del proyecto Next.js 16 + TypeScript + Tailwind 4 (App Router, src/)

## Fase 1 — Infraestructura y datos (devops + developer)
- [ ] **devops**: Crear repo en GitHub y conectarlo a Vercel (previews por rama). ⬅️ Vercel ya conectado por MCP.
- [x] **devops**: Proyecto Supabase del cliente (`ylzvxtlllqdukcojgnpn`); esquema cargado (13 tablas + 3 vistas).
- [x] **devops**: Variables de entorno locales (`.env.local` con URL + clave publicable del cliente).
- [x] **developer**: Cliente Supabase tipado (`src/lib/supabase.ts`).
- [x] **developer**: Tipos generados desde la BD (`src/types/database.ts`).
- [ ] **developer**: Auth (Supabase Auth) con roles admin/coordinador/tecnico.
- [ ] **developer**: Cargar datos semilla (seed): técnicos, vehículos y catálogo de equipos.
      ⚠️ Pendiente del cliente: **lista exacta de repuestos con SKU, costo, precio y arriendo diario**.

> 🔴 **SEGURIDAD (bloqueante antes de datos reales):** las 13 tablas tienen **RLS desactivado**
> → cualquiera con la clave publicable puede leer/escribir todo. Hay que habilitar RLS + políticas
> por rol al implementar Auth. Para el demo interno con Raúl se puede dejar temporalmente desactivado.

## Fase 2 — Lógica de negocio / Backend (developer)
- [x] Datos de demostración (seed) → `db/seed.sql` (5 clientes, 6 repuestos, 4 técnicos, 11 OTs, 5 arriendos activos).
- [x] Queries del **dashboard** sobre las vistas → `src/lib/queries.ts`.
- [ ] Endpoint/servicio de **Órdenes de Trabajo**: crear, asignar (técnico+vehículo+repuesto), avanzar estado.
- [ ] Implementar la **máquina de estados** de la OT (validar transiciones).
- [ ] Lógica de **préstamo/arriendo**: al entregar repuesto se abre `prestamos_arriendo`; al devolver se cierra y se calcula el monto.
- [ ] Lógica de **reparación** del repuesto original (ingreso/salida de servicio técnico).
- [ ] Actualización de estado de `unidades_repuesto` (disponible → prestado → en_reparacion → disponible).
- [ ] Servicio de **rutas**: armar ruta del técnico con paradas de entrega/retiro.

## Fase 3 — Interfaz / UX (ui_ux)  — puede ir en paralelo a Fase 2
- [x] Layout base + navegación, mobile-first (sidebar + barra inferior móvil).
- [x] **Dashboard** (admin): KPIs + gráficos (margen, productividad) + tablas (arriendos, OTs recientes).
- [x] **Gestión de OTs**: lista completa con estado, prioridad, técnico.
- [x] **Vista del Técnico**: ruta del día con entregas/retiros.
- [ ] Pantalla **Login** (Supabase Auth) — pendiente (ver Fase 1 Auth).
- [ ] Formularios de creación/edición de OT (solo lectura por ahora).
- [ ] Micro-animaciones y estados de carga/vacío.

## Fase 4 — Calidad (qa)
- [ ] Pruebas unitarias de la máquina de estados de la OT (transiciones válidas/ inválidas).
- [ ] Pruebas del cálculo de **días y monto de arriendo** (casos límite: mismo día, devolución nula).
- [ ] Pruebas de validación de formularios (asignación de OT, alta de cliente/repuesto).
- [ ] Pruebas de integración de los queries del dashboard.
- [ ] Revisar cuellos de botella y accesibilidad junto a `ui_ux`.

## Fase 5 — Despliegue del demo (devops)
- [ ] Build de producción y verificación.
- [ ] Deploy a Vercel (producción) y verificación con datos semilla.
- [ ] Preparar recorrido de demo para **Raúl** (flujo completo de una OT de ejemplo).

---

## Decisiones abiertas (requieren input)
1. **Acceso a datos**: `supabase-js` directo (más rápido para el demo) vs. **Drizzle ORM** (más robusto a futuro). → *Recomendación para el demo: `supabase-js`.*
2. **Mapas/rutas**: ¿ruta visual en mapa (Google Maps/Mapbox) o lista ordenada de paradas para el demo? → *Recomendación: lista ordenada primero.*
3. **Lista de repuestos con SKU** (la entrega el cliente): bloquea el seed realista, no el desarrollo.
