-- =====================================================================
-- Datos de DEMO — Cooprinsem (para presentación a Raúl)
-- Repuestos y clientes de ejemplo. Reemplazar por datos reales luego.
-- Idempotente en catálogos (on conflict). Ejecutar el bloque de OTs una sola vez.
-- =====================================================================

-- ---------- Clientes ----------
insert into clientes (nombre, rut, telefono, email, direccion, lat, lng) values
 ('Agrícola Los Alerces Ltda','76.123.456-7','+56 9 8123 4567','contacto@losalerces.cl','Ruta 5 Sur Km 920, Osorno',-40.5738,-73.1335),
 ('Lechería San Pedro','77.234.567-8','+56 9 8234 5678','admin@sanpedro.cl','Camino Purranque s/n, Purranque',-40.9130,-73.1600),
 ('Fundo El Roble','78.345.678-9','+56 9 8345 6789','elroble@fundo.cl','Río Negro, Osorno',-40.7900,-72.9200),
 ('Agrícola Vista Hermosa','79.456.789-0','+56 9 8456 7890','vistahermosa@agricola.cl','Frutillar Alto, Llanquihue',-41.1100,-73.0500),
 ('Ganadera Llanquihue SpA','80.567.890-1','+56 9 8567 8901','contacto@gllanquihue.cl','Llanquihue Centro',-41.2560,-73.0090)
on conflict (rut) do nothing;

-- ---------- Catálogo de equipos ----------
insert into equipos_catalogo (sku, nombre, descripcion, categoria, url, precio_venta) values
 ('EQ-MC53','Unidad de Ordeño MC-53','Unidad de ordeño automática','lecheria','https://cooprinsem.cl/lecheria/591-unidad-ordeno-mc-53.html',2500000),
 ('EQ-TANK1000','Estanque de Frío 1000L','Estanque de frío para leche','lecheria',null,4200000),
 ('EQ-BOMBAV','Bomba de Vacío DVP','Bomba de vacío para sistema de ordeño','lecheria',null,1800000)
on conflict (sku) do nothing;

-- ---------- Repuestos (DEMO) ----------
insert into repuestos (sku, nombre, descripcion, categoria, costo, precio_venta, arriendo_diario, stock_minimo) values
 ('RP-001','Pulsador Electrónico MC-53','Pulsador para unidad de ordeño MC-53','lecheria',45000,89000,3500,4),
 ('RP-002','Motor Bomba de Vacío 3HP','Motor de reemplazo para bomba de vacío','lecheria',320000,520000,15000,2),
 ('RP-003','Sensor de Flujo de Leche','Sensor electrónico de flujo','lecheria',78000,145000,6000,3),
 ('RP-004','Kit Pezoneras Silicona (x4)','Juego de 4 pezoneras de silicona','lecheria',22000,48000,2000,6),
 ('RP-005','Placa Controladora MC-53','Placa electrónica de control','lecheria',190000,340000,12000,2),
 ('RP-006','Compresor Estanque de Frío','Compresor para estanque de frío','lecheria',410000,690000,20000,1)
on conflict (sku) do nothing;

-- ---------- Técnicos ----------
insert into tecnicos (nombre, rut, telefono) values
 ('Juan Pérez','12.345.678-9','+56 9 9111 1111'),
 ('Carlos Muñoz','13.456.789-0','+56 9 9222 2222'),
 ('Andrés Soto','14.567.890-1','+56 9 9333 3333'),
 ('Rodrigo Díaz','15.678.901-2','+56 9 9444 4444')
on conflict (rut) do nothing;

-- ---------- Vehículos ----------
insert into vehiculos (patente, modelo, tecnico_id)
select v.patente, v.modelo, t.id
from (values
 ('KXTR45','Toyota Hilux 2022','12.345.678-9'),
 ('LMNP32','Nissan Navara 2021','13.456.789-0'),
 ('PQRS78','Ford Ranger 2023','14.567.890-1'),
 ('TUVW90','Mitsubishi L200 2020','15.678.901-2')
) as v(patente,modelo,rut)
join tecnicos t on t.rut = v.rut
on conflict (patente) do nothing;

-- ---------- Equipos del cliente (una MC-53 por cliente) ----------
insert into equipos_cliente (cliente_id, equipo_catalogo_id, numero_serie, fecha_compra)
select c.id, e.id, 'SN-MC53-'||right(c.rut,5), date '2024-03-15'
from clientes c
cross join equipos_catalogo e
where e.sku = 'EQ-MC53'
  and c.rut in ('76.123.456-7','77.234.567-8','78.345.678-9','79.456.789-0','80.567.890-1')
  and not exists (
    select 1 from equipos_cliente x where x.cliente_id = c.id and x.equipo_catalogo_id = e.id
  );

-- ---------- Unidades físicas de repuesto ----------
insert into unidades_repuesto (repuesto_id, codigo_unidad, estado, ubicacion)
select r.id, u.codigo, u.estado::estado_unidad, u.ubic
from (values
 ('RP-001','U-RP001-01','disponible','Bodega Osorno'),
 ('RP-001','U-RP001-02','prestado','Cliente'),
 ('RP-001','U-RP001-03','disponible','Bodega Osorno'),
 ('RP-002','U-RP002-01','prestado','Cliente'),
 ('RP-002','U-RP002-02','en_reparacion','Servicio Técnico'),
 ('RP-003','U-RP003-01','prestado','Cliente'),
 ('RP-003','U-RP003-02','disponible','Bodega Osorno'),
 ('RP-004','U-RP004-01','disponible','Bodega Osorno'),
 ('RP-005','U-RP005-01','prestado','Cliente'),
 ('RP-005','U-RP005-02','en_reparacion','Servicio Técnico'),
 ('RP-006','U-RP006-01','prestado','Cliente')
) as u(sku,codigo,estado,ubic)
join repuestos r on r.sku = u.sku
on conflict (codigo_unidad) do nothing;

-- ---------- Órdenes de Trabajo + Préstamos + Reparaciones + Ruta ----------
do $$
declare
  v_ot1 uuid; v_ot2 uuid; v_ot3 uuid; v_ot4 uuid; v_ot5 uuid;
  v_ruta uuid;
begin
  -- Salir si ya se sembraron OTs (evita duplicar en re-ejecución)
  if exists (select 1 from ordenes_trabajo) then
    return;
  end if;

  -- OT1: repuesto entregado, préstamo activo (5 días)
  insert into ordenes_trabajo (cliente_id, equipo_cliente_id, repuesto_requerido_id, tecnico_id, vehiculo_id, estado, prioridad, descripcion_falla, fecha_reporte, fecha_asignacion)
  values (
    (select id from clientes where rut='76.123.456-7'),
    (select ec.id from equipos_cliente ec join clientes c on c.id=ec.cliente_id where c.rut='76.123.456-7' limit 1),
    (select id from repuestos where sku='RP-001'),
    (select id from tecnicos where rut='12.345.678-9'),
    (select id from vehiculos where patente='KXTR45'),
    'repuesto_entregado', 2, 'Pulsador no responde, ordeño intermitente',
    now()-interval '6 days', now()-interval '5 days'
  ) returning id into v_ot1;
  insert into prestamos_arriendo (orden_trabajo_id, unidad_prestada_id, fecha_entrega, tarifa_diaria, estado)
  values (v_ot1, (select id from unidades_repuesto where codigo_unidad='U-RP001-02'), now()-interval '5 days', 3500, 'activo');

  -- OT2: en reparación, préstamo activo (12 días)
  insert into ordenes_trabajo (cliente_id, equipo_cliente_id, repuesto_requerido_id, tecnico_id, vehiculo_id, estado, prioridad, descripcion_falla, fecha_reporte, fecha_asignacion)
  values (
    (select id from clientes where rut='77.234.567-8'),
    (select ec.id from equipos_cliente ec join clientes c on c.id=ec.cliente_id where c.rut='77.234.567-8' limit 1),
    (select id from repuestos where sku='RP-002'),
    (select id from tecnicos where rut='13.456.789-0'),
    (select id from vehiculos where patente='LMNP32'),
    'en_reparacion', 1, 'Bomba de vacío quemada, sin vacío en la sala',
    now()-interval '13 days', now()-interval '12 days'
  ) returning id into v_ot2;
  insert into prestamos_arriendo (orden_trabajo_id, unidad_prestada_id, fecha_entrega, tarifa_diaria, estado)
  values (v_ot2, (select id from unidades_repuesto where codigo_unidad='U-RP002-01'), now()-interval '12 days', 15000, 'activo');
  insert into reparaciones (orden_trabajo_id, unidad_original_id, fecha_ingreso, notas)
  values (v_ot2, (select id from unidades_repuesto where codigo_unidad='U-RP002-02'), now()-interval '11 days', 'Rebobinado de motor en servicio técnico');

  -- OT3: repuesto entregado, préstamo activo (3 días)
  insert into ordenes_trabajo (cliente_id, equipo_cliente_id, repuesto_requerido_id, tecnico_id, vehiculo_id, estado, prioridad, descripcion_falla, fecha_reporte, fecha_asignacion)
  values (
    (select id from clientes where rut='78.345.678-9'),
    (select ec.id from equipos_cliente ec join clientes c on c.id=ec.cliente_id where c.rut='78.345.678-9' limit 1),
    (select id from repuestos where sku='RP-003'),
    (select id from tecnicos where rut='14.567.890-1'),
    (select id from vehiculos where patente='PQRS78'),
    'repuesto_entregado', 3, 'Lectura de flujo errática',
    now()-interval '4 days', now()-interval '3 days'
  ) returning id into v_ot3;
  insert into prestamos_arriendo (orden_trabajo_id, unidad_prestada_id, fecha_entrega, tarifa_diaria, estado)
  values (v_ot3, (select id from unidades_repuesto where codigo_unidad='U-RP003-01'), now()-interval '3 days', 6000, 'activo');

  -- OT4: en reparación, préstamo activo (8 días)
  insert into ordenes_trabajo (cliente_id, equipo_cliente_id, repuesto_requerido_id, tecnico_id, vehiculo_id, estado, prioridad, descripcion_falla, fecha_reporte, fecha_asignacion)
  values (
    (select id from clientes where rut='79.456.789-0'),
    (select ec.id from equipos_cliente ec join clientes c on c.id=ec.cliente_id where c.rut='79.456.789-0' limit 1),
    (select id from repuestos where sku='RP-005'),
    (select id from tecnicos where rut='12.345.678-9'),
    (select id from vehiculos where patente='KXTR45'),
    'en_reparacion', 1, 'Placa controladora con falla intermitente',
    now()-interval '9 days', now()-interval '8 days'
  ) returning id into v_ot4;
  insert into prestamos_arriendo (orden_trabajo_id, unidad_prestada_id, fecha_entrega, tarifa_diaria, estado)
  values (v_ot4, (select id from unidades_repuesto where codigo_unidad='U-RP005-01'), now()-interval '8 days', 12000, 'activo');
  insert into reparaciones (orden_trabajo_id, unidad_original_id, fecha_ingreso, notas)
  values (v_ot4, (select id from unidades_repuesto where codigo_unidad='U-RP005-02'), now()-interval '7 days', 'Diagnóstico de placa en laboratorio');

  -- OT5: repuesto entregado, préstamo activo (2 días)
  insert into ordenes_trabajo (cliente_id, equipo_cliente_id, repuesto_requerido_id, tecnico_id, vehiculo_id, estado, prioridad, descripcion_falla, fecha_reporte, fecha_asignacion)
  values (
    (select id from clientes where rut='80.567.890-1'),
    (select ec.id from equipos_cliente ec join clientes c on c.id=ec.cliente_id where c.rut='80.567.890-1' limit 1),
    (select id from repuestos where sku='RP-006'),
    (select id from tecnicos where rut='15.678.901-2'),
    (select id from vehiculos where patente='TUVW90'),
    'repuesto_entregado', 2, 'Estanque no enfría, leche en riesgo',
    now()-interval '3 days', now()-interval '2 days'
  ) returning id into v_ot5;
  insert into prestamos_arriendo (orden_trabajo_id, unidad_prestada_id, fecha_entrega, tarifa_diaria, estado)
  values (v_ot5, (select id from unidades_repuesto where codigo_unidad='U-RP006-01'), now()-interval '2 days', 20000, 'activo');

  -- OTs cerradas (para productividad de técnicos)
  insert into ordenes_trabajo (cliente_id, repuesto_requerido_id, tecnico_id, estado, prioridad, descripcion_falla, fecha_reporte, fecha_asignacion, fecha_cierre)
  values
   ((select id from clientes where rut='76.123.456-7'),(select id from repuestos where sku='RP-004'),(select id from tecnicos where rut='12.345.678-9'),'cerrada',3,'Cambio de pezoneras', now()-interval '20 days', now()-interval '19 days', now()-interval '15 days'),
   ((select id from clientes where rut='77.234.567-8'),(select id from repuestos where sku='RP-001'),(select id from tecnicos where rut='12.345.678-9'),'cerrada',3,'Reemplazo de pulsador', now()-interval '25 days', now()-interval '24 days', now()-interval '18 days'),
   ((select id from clientes where rut='78.345.678-9'),(select id from repuestos where sku='RP-003'),(select id from tecnicos where rut='13.456.789-0'),'cerrada',2,'Recalibración de sensor', now()-interval '22 days', now()-interval '21 days', now()-interval '16 days'),
   ((select id from clientes where rut='79.456.789-0'),(select id from repuestos where sku='RP-004'),(select id from tecnicos where rut='14.567.890-1'),'cerrada',3,'Mantención preventiva', now()-interval '30 days', now()-interval '29 days', now()-interval '24 days');

  -- OT recién asignada (aún sin entregar repuesto)
  insert into ordenes_trabajo (cliente_id, repuesto_requerido_id, tecnico_id, vehiculo_id, estado, prioridad, descripcion_falla, fecha_reporte, fecha_asignacion)
  values ((select id from clientes where rut='78.345.678-9'),(select id from repuestos where sku='RP-003'),(select id from tecnicos where rut='15.678.901-2'),(select id from vehiculos where patente='TUVW90'),'asignada',2,'Sensor con lecturas fuera de rango', now()-interval '1 days', now());

  -- OT recién reportada (sin asignar)
  insert into ordenes_trabajo (cliente_id, repuesto_requerido_id, estado, prioridad, descripcion_falla, fecha_reporte)
  values ((select id from clientes where rut='80.567.890-1'),(select id from repuestos where sku='RP-002'),'reportada',1,'Ruido anormal en bomba de vacío', now()-interval '4 hours');

  -- Ruta de hoy para Juan Pérez
  insert into rutas (tecnico_id, vehiculo_id, fecha, estado)
  values ((select id from tecnicos where rut='12.345.678-9'),(select id from vehiculos where patente='KXTR45'), current_date, 'en_curso')
  returning id into v_ruta;
  insert into ruta_paradas (ruta_id, orden_trabajo_id, secuencia, tipo, completada) values
   (v_ruta, v_ot1, 1, 'entrega', true),
   (v_ruta, v_ot4, 2, 'retiro', false);
end $$;
