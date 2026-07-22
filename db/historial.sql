-- ============================================================
-- Historial / auditoría de cambios de estado de las OT
-- ============================================================
create table ot_historial (
  id                uuid primary key default gen_random_uuid(),
  orden_trabajo_id  uuid not null references ordenes_trabajo(id) on delete cascade,
  estado_anterior   estado_ot,
  estado_nuevo      estado_ot not null,
  cambiado_por      uuid,
  created_at        timestamptz not null default now()
);
create index idx_hist_ot on ot_historial(orden_trabajo_id);

-- Trigger: registra el estado inicial (INSERT) y cada cambio de estado (UPDATE).
create or replace function public.registrar_cambio_estado()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (TG_OP = 'INSERT') then
    insert into ot_historial(orden_trabajo_id, estado_anterior, estado_nuevo, cambiado_por)
    values (NEW.id, null, NEW.estado, auth.uid());
  elsif (NEW.estado is distinct from OLD.estado) then
    insert into ot_historial(orden_trabajo_id, estado_anterior, estado_nuevo, cambiado_por)
    values (NEW.id, OLD.estado, NEW.estado, auth.uid());
  end if;
  return NEW;
end $$;

drop trigger if exists trg_ot_historial on ordenes_trabajo;
create trigger trg_ot_historial
  after insert or update on ordenes_trabajo
  for each row execute function public.registrar_cambio_estado();

-- Backfill del estado actual de las OT existentes.
insert into ot_historial (orden_trabajo_id, estado_anterior, estado_nuevo, cambiado_por, created_at)
select id, null, estado, null, fecha_reporte
from ordenes_trabajo
where not exists (select 1 from ot_historial h where h.orden_trabajo_id = ordenes_trabajo.id);

-- RLS: admin ve todo; técnico ve el historial de sus OTs. Escritura solo vía trigger.
alter table ot_historial enable row level security;
create policy hist_select on ot_historial for select to authenticated
  using (
    public.es_admin()
    or exists (
      select 1 from ordenes_trabajo o
      where o.id = orden_trabajo_id and o.tecnico_id = public.mi_tecnico_id()
    )
  );
