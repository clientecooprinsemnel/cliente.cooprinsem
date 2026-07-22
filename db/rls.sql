-- ============================================================
-- RLS + políticas por rol (admin / coordinador / técnico)
-- Aplicado a la base del cliente (ylzvxtlllqdukcojgnpn).
-- ============================================================

-- ---------- Funciones auxiliares (SECURITY DEFINER) ----------
create or replace function public.es_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol in ('admin','coordinador')
  );
$$;

create or replace function public.mi_tecnico_id()
returns uuid language sql security definer set search_path = public stable as $$
  select id from public.tecnicos where perfil_id = auth.uid();
$$;

-- Solo el rol authenticated (vía políticas RLS) puede ejecutarlas.
revoke execute on function public.es_admin() from public, anon;
revoke execute on function public.mi_tecnico_id() from public, anon;
grant execute on function public.es_admin() to authenticated;
grant execute on function public.mi_tecnico_id() to authenticated;

-- ---------- Habilitar RLS ----------
alter table perfiles            enable row level security;
alter table clientes            enable row level security;
alter table equipos_catalogo    enable row level security;
alter table equipos_cliente     enable row level security;
alter table repuestos           enable row level security;
alter table unidades_repuesto   enable row level security;
alter table tecnicos            enable row level security;
alter table vehiculos           enable row level security;
alter table ordenes_trabajo     enable row level security;
alter table prestamos_arriendo  enable row level security;
alter table reparaciones        enable row level security;
alter table rutas               enable row level security;
alter table ruta_paradas        enable row level security;

-- ---------- Perfiles ----------
create policy perfiles_select on perfiles for select to authenticated
  using (id = auth.uid() or public.es_admin());
create policy perfiles_admin_write on perfiles for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- ---------- Catálogos: lectura autenticada, escritura admin ----------
-- (clientes, equipos_catalogo, equipos_cliente, repuestos, unidades_repuesto, tecnicos, vehiculos)
create policy clientes_select on clientes for select to authenticated using (true);
create policy clientes_admin_write on clientes for all to authenticated
  using (public.es_admin()) with check (public.es_admin());
create policy eqcat_select on equipos_catalogo for select to authenticated using (true);
create policy eqcat_admin_write on equipos_catalogo for all to authenticated
  using (public.es_admin()) with check (public.es_admin());
create policy eqcli_select on equipos_cliente for select to authenticated using (true);
create policy eqcli_admin_write on equipos_cliente for all to authenticated
  using (public.es_admin()) with check (public.es_admin());
create policy rep_select on repuestos for select to authenticated using (true);
create policy rep_admin_write on repuestos for all to authenticated
  using (public.es_admin()) with check (public.es_admin());
create policy uni_select on unidades_repuesto for select to authenticated using (true);
create policy uni_admin_write on unidades_repuesto for all to authenticated
  using (public.es_admin()) with check (public.es_admin());
create policy tec_select on tecnicos for select to authenticated using (true);
create policy tec_admin_write on tecnicos for all to authenticated
  using (public.es_admin()) with check (public.es_admin());
create policy veh_select on vehiculos for select to authenticated using (true);
create policy veh_admin_write on vehiculos for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- ---------- Órdenes de trabajo: admin todo; técnico solo las suyas ----------
create policy ot_select on ordenes_trabajo for select to authenticated
  using (public.es_admin() or tecnico_id = public.mi_tecnico_id());
create policy ot_admin_write on ordenes_trabajo for all to authenticated
  using (public.es_admin()) with check (public.es_admin());
-- El técnico puede avanzar el estado de sus propias órdenes.
create policy ot_tecnico_update on ordenes_trabajo for update to authenticated
  using (tecnico_id = public.mi_tecnico_id())
  with check (tecnico_id = public.mi_tecnico_id());

-- ---------- Rutas: admin todo; técnico solo las suyas ----------
create policy rutas_select on rutas for select to authenticated
  using (public.es_admin() or tecnico_id = public.mi_tecnico_id());
create policy rutas_admin_write on rutas for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- ---------- Paradas de ruta: según la ruta del técnico ----------
create policy rp_select on ruta_paradas for select to authenticated
  using (
    public.es_admin()
    or exists (select 1 from rutas r where r.id = ruta_id and r.tecnico_id = public.mi_tecnico_id())
  );
create policy rp_admin_write on ruta_paradas for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- ---------- Préstamos y reparaciones: solo admin ----------
create policy pa_admin on prestamos_arriendo for all to authenticated
  using (public.es_admin()) with check (public.es_admin());
create policy repa_admin on reparaciones for all to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- ---------- Vistas del dashboard: respetar RLS del usuario que consulta ----------
alter view v_repuestos_en_arriendo  set (security_invoker = on);
alter view v_margen_repuestos       set (security_invoker = on);
alter view v_productividad_tecnicos set (security_invoker = on);
