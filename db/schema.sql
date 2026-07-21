-- =====================================================================
-- Esquema: Control de Flujo de Equipos en Mantención — Cooprinsem
-- Motor: PostgreSQL (compatible Supabase)
-- Autor: rol architect
-- Nota: la lista exacta de repuestos (SKUs) se carga después como datos;
--       el esquema ya la soporta vía la tabla `repuestos`.
-- =====================================================================

-- ---------- Tipos (máquinas de estado) ----------
create type estado_ot as enum (
  'reportada', 'asignada', 'en_ruta', 'repuesto_entregado',
  'en_reparacion', 'reparado', 'devuelto', 'cerrada', 'cancelada'
);

create type estado_unidad as enum (
  'disponible', 'prestado', 'en_reparacion', 'dado_de_baja'
);

create type estado_prestamo as enum ('activo', 'cerrado');
create type tipo_parada as enum ('entrega', 'retiro');
create type rol_usuario as enum ('admin', 'coordinador', 'tecnico');

-- ---------- Usuarios / perfiles ----------
-- En Supabase se vincula con auth.users; aquí se modela el perfil de dominio.
create table perfiles (
  id            uuid primary key,             -- = auth.users.id en Supabase
  nombre        text not null,
  email         text unique not null,
  rol           rol_usuario not null default 'tecnico',
  activo        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ---------- Clientes ----------
create table clientes (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  rut           text unique,
  telefono      text,
  email         text,
  direccion     text,
  lat           numeric(9,6),                 -- geolocalización para rutas
  lng           numeric(9,6),
  created_at    timestamptz not null default now()
);

-- ---------- Catálogo de equipos (lo que se vende) ----------
create table equipos_catalogo (
  id            uuid primary key default gen_random_uuid(),
  sku           text unique not null,
  nombre        text not null,                -- ej: "Unidad de Ordeño MC-53"
  descripcion   text,
  categoria     text,                         -- ej: "lecheria"
  url           text,                         -- ficha en cooprinsem.cl
  precio_venta  numeric(12,2),
  created_at    timestamptz not null default now()
);

-- ---------- Equipo físico que posee un cliente ----------
create table equipos_cliente (
  id                 uuid primary key default gen_random_uuid(),
  cliente_id         uuid not null references clientes(id) on delete cascade,
  equipo_catalogo_id uuid not null references equipos_catalogo(id),
  numero_serie       text,
  fecha_compra       date,
  created_at         timestamptz not null default now()
);

-- ---------- Repuestos (por SKU) ----------
create table repuestos (
  id               uuid primary key default gen_random_uuid(),
  sku              text unique not null,
  nombre           text not null,
  descripcion      text,
  categoria        text,
  costo            numeric(12,2) not null default 0,   -- costo empresa
  precio_venta     numeric(12,2) not null default 0,   -- precio a cliente
  arriendo_diario  numeric(12,2) not null default 0,   -- tarifa préstamo/día
  -- margen calculado automáticamente:
  margen           numeric(12,2) generated always as (precio_venta - costo) stored,
  stock_minimo     int not null default 0,
  created_at       timestamptz not null default now()
);

-- ---------- Unidades físicas rastreables de cada repuesto ----------
-- Permite saber QUÉ unidad se prestó y CUÁL está en reparación.
create table unidades_repuesto (
  id            uuid primary key default gen_random_uuid(),
  repuesto_id   uuid not null references repuestos(id) on delete cascade,
  codigo_unidad text unique not null,         -- código interno/serie
  estado        estado_unidad not null default 'disponible',
  ubicacion     text,                         -- bodega, vehículo, cliente...
  created_at    timestamptz not null default now()
);

-- ---------- Técnicos y vehículos ----------
create table tecnicos (
  id            uuid primary key default gen_random_uuid(),
  perfil_id     uuid references perfiles(id),
  nombre        text not null,
  rut           text unique,
  telefono      text,
  activo        boolean not null default true,
  created_at    timestamptz not null default now()
);

create table vehiculos (
  id            uuid primary key default gen_random_uuid(),
  patente       text unique not null,
  modelo        text,
  tecnico_id    uuid references tecnicos(id),  -- asignación habitual (opcional)
  activo        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ---------- Orden de Trabajo (OT) — núcleo del flujo ----------
create table ordenes_trabajo (
  id                   uuid primary key default gen_random_uuid(),
  folio                serial unique,                 -- número visible
  cliente_id           uuid not null references clientes(id),
  equipo_cliente_id    uuid references equipos_cliente(id),
  repuesto_requerido_id uuid references repuestos(id),
  tecnico_id           uuid references tecnicos(id),
  vehiculo_id          uuid references vehiculos(id),
  estado               estado_ot not null default 'reportada',
  prioridad            int not null default 3,        -- 1=alta ... 5=baja
  descripcion_falla    text,
  fecha_reporte        timestamptz not null default now(),
  fecha_asignacion     timestamptz,
  fecha_cierre         timestamptz,
  created_at           timestamptz not null default now()
);

-- ---------- Préstamo / arriendo del repuesto ----------
-- Nota: los días de arriendo NO se guardan como columna generada porque
-- dependen de now() (no inmutable). Se calculan en la vista v_repuestos_en_arriendo.
create table prestamos_arriendo (
  id                       uuid primary key default gen_random_uuid(),
  orden_trabajo_id         uuid not null references ordenes_trabajo(id) on delete cascade,
  unidad_prestada_id       uuid not null references unidades_repuesto(id),
  fecha_entrega            timestamptz not null default now(),
  fecha_devolucion         timestamptz,
  tarifa_diaria            numeric(12,2) not null default 0,
  estado                   estado_prestamo not null default 'activo'
);

-- ---------- Reparación del repuesto original ----------
create table reparaciones (
  id                    uuid primary key default gen_random_uuid(),
  orden_trabajo_id      uuid not null references ordenes_trabajo(id) on delete cascade,
  unidad_original_id    uuid references unidades_repuesto(id),
  fecha_ingreso         timestamptz not null default now(),
  fecha_salida          timestamptz,
  costo_reparacion      numeric(12,2) not null default 0,
  notas                 text
);

-- ---------- Rutas del técnico ----------
create table rutas (
  id            uuid primary key default gen_random_uuid(),
  tecnico_id    uuid not null references tecnicos(id),
  vehiculo_id   uuid references vehiculos(id),
  fecha         date not null default current_date,
  estado        text not null default 'planificada',  -- planificada|en_curso|completada
  created_at    timestamptz not null default now()
);

create table ruta_paradas (
  id                uuid primary key default gen_random_uuid(),
  ruta_id           uuid not null references rutas(id) on delete cascade,
  orden_trabajo_id  uuid not null references ordenes_trabajo(id),
  secuencia         int not null default 1,
  tipo              tipo_parada not null,          -- entrega | retiro
  completada        boolean not null default false,
  hora_estimada     timestamptz
);

-- ---------- Índices útiles ----------
create index idx_ot_estado       on ordenes_trabajo(estado);
create index idx_ot_tecnico      on ordenes_trabajo(tecnico_id);
create index idx_prestamos_estado on prestamos_arriendo(estado);
create index idx_unidades_estado  on unidades_repuesto(estado);

-- =====================================================================
-- Vistas para el DASHBOARD
-- =====================================================================

-- Repuestos actualmente en arriendo y lo que se está facturando.
-- dias = días transcurridos desde la entrega (mínimo 1), hasta devolución o ahora.
create view v_repuestos_en_arriendo as
select
  p.id            as prestamo_id,
  ot.folio,
  c.nombre        as cliente,
  r.sku,
  r.nombre        as repuesto,
  u.codigo_unidad,
  p.fecha_entrega,
  greatest(1, ceil(extract(epoch from
    (coalesce(p.fecha_devolucion, now()) - p.fecha_entrega)) / 86400.0))::int as dias,
  p.tarifa_diaria,
  greatest(1, ceil(extract(epoch from
    (coalesce(p.fecha_devolucion, now()) - p.fecha_entrega)) / 86400.0))::int
    * p.tarifa_diaria as monto_acumulado
from prestamos_arriendo p
join unidades_repuesto u on u.id = p.unidad_prestada_id
join repuestos r         on r.id = u.repuesto_id
join ordenes_trabajo ot  on ot.id = p.orden_trabajo_id
join clientes c          on c.id = ot.cliente_id
where p.estado = 'activo';

-- Ranking de repuestos por margen
create view v_margen_repuestos as
select
  r.id, r.sku, r.nombre, r.costo, r.precio_venta, r.margen,
  case when r.precio_venta > 0
       then round((r.margen / r.precio_venta) * 100, 1)
       else 0 end as margen_pct
from repuestos r
order by r.margen desc;

-- Productividad por técnico
create view v_productividad_tecnicos as
select
  t.id, t.nombre,
  count(ot.id)                                             as total_asignadas,
  count(ot.id) filter (where ot.estado = 'cerrada')        as total_cerradas,
  count(ot.id) filter (where ot.estado not in ('cerrada','cancelada')) as en_curso
from tecnicos t
left join ordenes_trabajo ot on ot.tecnico_id = t.id
group by t.id, t.nombre
order by total_cerradas desc;
