# Arquitectura — Sistema de Control de Flujo de Equipos en Mantención (Cooprinsem)

> Documento del rol **architect**. Define el problema, el stack, el modelo de datos y los cimientos.
> Los demás roles (`developer`, `ui_ux`, `qa`, `devops`) trabajan a partir de aquí y del `TODO.md`.

---

## 1. Análisis de requerimientos

### Problema
Hoy el proceso es 100% manual. Cuando un equipo comprado por un cliente (ej. *Unidad de Ordeño MC-53*) falla:

1. Se asigna un técnico.
2. El técnico toma un **repuesto de préstamo** y se lo lleva al cliente para que no pare su operación.
3. El repuesto original **dañado** se envía a servicio técnico y se repara.
4. El repuesto reparado vuelve al cliente y se **recupera el repuesto prestado**.

No hay trazabilidad, ni control de rutas, ni datos de negocio (márgenes, productividad, arriendos).

### Objetivo
Automatizar y dar trazabilidad al ciclo completo, con:
- **Orden de Trabajo (OT)** como unidad central del flujo.
- Asignación de **técnico + vehículo + ruta + repuesto** correspondiente.
- Identificación de repuestos por **SKU** (la lista exacta la entrega el cliente después).
- **Cobro de arriendo diario** por el repuesto prestado mientras se repara el original.
- **Dashboard** de negocio: equipos/repuestos en arriendo, repuestos de mayor margen, productividad por técnico (asignaciones y OTs terminadas).

### Actores
- **Administrador / Coordinador**: crea OTs, asigna técnicos y rutas, ve el dashboard.
- **Técnico**: ve su ruta y OTs asignadas, marca entregas/retiros/reparaciones.
- **(Futuro) Cliente**: consulta el estado de su OT.

### Ciclo de vida de una OT (máquina de estados)
```
reportada → asignada → en_ruta → repuesto_entregado
   → en_reparacion → reparado → devuelto → cerrada
```
El **arriendo** se activa en `repuesto_entregado` (empieza a contar días) y se cierra en `devuelto`.

---

## 2. Stack tecnológico

| Capa | Tecnología | Por qué |
|---|---|---|
| Framework | **Next.js 16 (App Router) + TypeScript** | Full-stack en un repo (UI + API), Server Components, ideal para dashboard. |
| UI | **Tailwind CSS + shadcn/ui** | Componentes accesibles, rápido de construir, mobile-first para el técnico en terreno. |
| Base de datos | **PostgreSQL (Supabase)** | Relacional (el dominio lo es), ya hay conector Supabase disponible; Auth y RLS incluidos. |
| Auth | **Supabase Auth** | Roles (admin/técnico) con Row Level Security. |
| ORM / acceso | **Drizzle ORM** (o supabase-js) | Tipado fuerte end-to-end. Ver decisión en TODO. |
| Datos/Estado UI | **TanStack Query** | Cache y sincronización de datos para el dashboard. |
| Gráficos | **Recharts** | KPIs y series del dashboard. |
| Hosting | **Vercel** | Despliegue nativo Next.js, previews por rama. |

> Mobile-first es clave: el técnico usará la app desde el celular en terreno.

---

## 3. Modelo de datos (resumen)

Detalle completo y ejecutable en [`db/schema.sql`](./db/schema.sql).

**Entidades núcleo**
- `clientes` — quién compró el equipo (incluye geolocalización para rutas).
- `equipos_catalogo` — modelos vendidos (ej. MC-53, con SKU y URL).
- `equipos_cliente` — la unidad física que el cliente posee (nº de serie).
- `repuestos` — catálogo de repuestos por **SKU**, con costo, precio, **margen** y **tarifa de arriendo diaria**.
- `unidades_repuesto` — cada unidad física rastreable de un repuesto (para saber cuál se prestó / cuál está en reparación).
- `tecnicos` y `vehiculos`.
- `ordenes_trabajo` — la OT, con su estado y relaciones.
- `prestamos_arriendo` — el préstamo del repuesto y el cobro diario.
- `reparaciones` — el paso por servicio técnico del repuesto original.
- `rutas` y `ruta_paradas` — la ruta del técnico con entregas y retiros.

**Vistas para el dashboard**
- `v_repuestos_en_arriendo` — qué está prestado hoy y cuánto se está facturando.
- `v_margen_repuestos` — ranking de repuestos por margen.
- `v_productividad_tecnicos` — asignaciones y OTs cerradas por técnico.

---

## 4. Estructura de carpetas (blueprint)

```
Cooprinsem/
├── ARCHITECTURE.md          ← este documento
├── TODO.md                  ← plan de trabajo por rol
├── .env.example             ← variables de entorno (sin secretos)
├── db/
│   └── schema.sql           ← esquema PostgreSQL + vistas
├── src/
│   ├── app/                 ← rutas Next.js (App Router)
│   │   ├── (auth)/          ← login
│   │   ├── dashboard/       ← panel de negocio (admin)
│   │   ├── ordenes/         ← gestión de OTs
│   │   ├── rutas/           ← vista del técnico (mobile-first)
│   │   └── api/             ← endpoints
│   ├── components/          ← UI (shadcn/ui) → dominio de ui_ux
│   ├── lib/                 ← db, auth, helpers → dominio de developer
│   ├── server/              ← lógica de negocio y servicios
│   └── types/               ← tipos compartidos (contratos)
├── tests/                   ← Vitest → dominio de qa
└── .github/workflows/       ← CI/CD → dominio de devops
```

Los archivos de `src/`, `tests/` y `.github/` los generan `developer`, `ui_ux`, `qa` y `devops`
siguiendo el `TODO.md`. El architect deja definidos los cimientos y los contratos.
