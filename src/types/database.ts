export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          created_at: string
          direccion: string | null
          email: string | null
          id: string
          lat: number | null
          lng: number | null
          nombre: string
          rut: string | null
          telefono: string | null
        }
        Insert: {
          created_at?: string
          direccion?: string | null
          email?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          nombre: string
          rut?: string | null
          telefono?: string | null
        }
        Update: {
          created_at?: string
          direccion?: string | null
          email?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          nombre?: string
          rut?: string | null
          telefono?: string | null
        }
        Relationships: []
      }
      equipos_catalogo: {
        Row: {
          categoria: string | null
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
          precio_venta: number | null
          sku: string
          url: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
          precio_venta?: number | null
          sku: string
          url?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          precio_venta?: number | null
          sku?: string
          url?: string | null
        }
        Relationships: []
      }
      equipos_cliente: {
        Row: {
          cliente_id: string
          created_at: string
          equipo_catalogo_id: string
          fecha_compra: string | null
          id: string
          numero_serie: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string
          equipo_catalogo_id: string
          fecha_compra?: string | null
          id?: string
          numero_serie?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string
          equipo_catalogo_id?: string
          fecha_compra?: string | null
          id?: string
          numero_serie?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipos_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipos_cliente_equipo_catalogo_id_fkey"
            columns: ["equipo_catalogo_id"]
            isOneToOne: false
            referencedRelation: "equipos_catalogo"
            referencedColumns: ["id"]
          },
        ]
      }
      ordenes_trabajo: {
        Row: {
          cliente_id: string
          created_at: string
          descripcion_falla: string | null
          equipo_cliente_id: string | null
          estado: Database["public"]["Enums"]["estado_ot"]
          fecha_asignacion: string | null
          fecha_cierre: string | null
          fecha_reporte: string
          folio: number
          id: string
          prioridad: number
          repuesto_requerido_id: string | null
          tecnico_id: string | null
          vehiculo_id: string | null
        }
        Insert: {
          cliente_id: string
          created_at?: string
          descripcion_falla?: string | null
          equipo_cliente_id?: string | null
          estado?: Database["public"]["Enums"]["estado_ot"]
          fecha_asignacion?: string | null
          fecha_cierre?: string | null
          fecha_reporte?: string
          folio?: number
          id?: string
          prioridad?: number
          repuesto_requerido_id?: string | null
          tecnico_id?: string | null
          vehiculo_id?: string | null
        }
        Update: {
          cliente_id?: string
          created_at?: string
          descripcion_falla?: string | null
          equipo_cliente_id?: string | null
          estado?: Database["public"]["Enums"]["estado_ot"]
          fecha_asignacion?: string | null
          fecha_cierre?: string | null
          fecha_reporte?: string
          folio?: number
          id?: string
          prioridad?: number
          repuesto_requerido_id?: string | null
          tecnico_id?: string | null
          vehiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordenes_trabajo_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordenes_trabajo_equipo_cliente_id_fkey"
            columns: ["equipo_cliente_id"]
            isOneToOne: false
            referencedRelation: "equipos_cliente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordenes_trabajo_repuesto_requerido_id_fkey"
            columns: ["repuesto_requerido_id"]
            isOneToOne: false
            referencedRelation: "repuestos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordenes_trabajo_repuesto_requerido_id_fkey"
            columns: ["repuesto_requerido_id"]
            isOneToOne: false
            referencedRelation: "v_margen_repuestos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordenes_trabajo_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "tecnicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordenes_trabajo_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "v_productividad_tecnicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordenes_trabajo_vehiculo_id_fkey"
            columns: ["vehiculo_id"]
            isOneToOne: false
            referencedRelation: "vehiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      perfiles: {
        Row: {
          activo: boolean
          created_at: string
          email: string
          id: string
          nombre: string
          rol: Database["public"]["Enums"]["rol_usuario"]
        }
        Insert: {
          activo?: boolean
          created_at?: string
          email: string
          id: string
          nombre: string
          rol?: Database["public"]["Enums"]["rol_usuario"]
        }
        Update: {
          activo?: boolean
          created_at?: string
          email?: string
          id?: string
          nombre?: string
          rol?: Database["public"]["Enums"]["rol_usuario"]
        }
        Relationships: []
      }
      prestamos_arriendo: {
        Row: {
          estado: Database["public"]["Enums"]["estado_prestamo"]
          fecha_devolucion: string | null
          fecha_entrega: string
          id: string
          orden_trabajo_id: string
          tarifa_diaria: number
          unidad_prestada_id: string
        }
        Insert: {
          estado?: Database["public"]["Enums"]["estado_prestamo"]
          fecha_devolucion?: string | null
          fecha_entrega?: string
          id?: string
          orden_trabajo_id: string
          tarifa_diaria?: number
          unidad_prestada_id: string
        }
        Update: {
          estado?: Database["public"]["Enums"]["estado_prestamo"]
          fecha_devolucion?: string | null
          fecha_entrega?: string
          id?: string
          orden_trabajo_id?: string
          tarifa_diaria?: number
          unidad_prestada_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prestamos_arriendo_orden_trabajo_id_fkey"
            columns: ["orden_trabajo_id"]
            isOneToOne: false
            referencedRelation: "ordenes_trabajo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prestamos_arriendo_unidad_prestada_id_fkey"
            columns: ["unidad_prestada_id"]
            isOneToOne: false
            referencedRelation: "unidades_repuesto"
            referencedColumns: ["id"]
          },
        ]
      }
      reparaciones: {
        Row: {
          costo_reparacion: number
          fecha_ingreso: string
          fecha_salida: string | null
          id: string
          notas: string | null
          orden_trabajo_id: string
          unidad_original_id: string | null
        }
        Insert: {
          costo_reparacion?: number
          fecha_ingreso?: string
          fecha_salida?: string | null
          id?: string
          notas?: string | null
          orden_trabajo_id: string
          unidad_original_id?: string | null
        }
        Update: {
          costo_reparacion?: number
          fecha_ingreso?: string
          fecha_salida?: string | null
          id?: string
          notas?: string | null
          orden_trabajo_id?: string
          unidad_original_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reparaciones_orden_trabajo_id_fkey"
            columns: ["orden_trabajo_id"]
            isOneToOne: false
            referencedRelation: "ordenes_trabajo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reparaciones_unidad_original_id_fkey"
            columns: ["unidad_original_id"]
            isOneToOne: false
            referencedRelation: "unidades_repuesto"
            referencedColumns: ["id"]
          },
        ]
      }
      repuestos: {
        Row: {
          arriendo_diario: number
          categoria: string | null
          costo: number
          created_at: string
          descripcion: string | null
          id: string
          margen: number | null
          nombre: string
          precio_venta: number
          sku: string
          stock_minimo: number
        }
        Insert: {
          arriendo_diario?: number
          categoria?: string | null
          costo?: number
          created_at?: string
          descripcion?: string | null
          id?: string
          margen?: number | null
          nombre: string
          precio_venta?: number
          sku: string
          stock_minimo?: number
        }
        Update: {
          arriendo_diario?: number
          categoria?: string | null
          costo?: number
          created_at?: string
          descripcion?: string | null
          id?: string
          margen?: number | null
          nombre?: string
          precio_venta?: number
          sku?: string
          stock_minimo?: number
        }
        Relationships: []
      }
      ruta_paradas: {
        Row: {
          completada: boolean
          hora_estimada: string | null
          id: string
          orden_trabajo_id: string
          ruta_id: string
          secuencia: number
          tipo: Database["public"]["Enums"]["tipo_parada"]
        }
        Insert: {
          completada?: boolean
          hora_estimada?: string | null
          id?: string
          orden_trabajo_id: string
          ruta_id: string
          secuencia?: number
          tipo: Database["public"]["Enums"]["tipo_parada"]
        }
        Update: {
          completada?: boolean
          hora_estimada?: string | null
          id?: string
          orden_trabajo_id?: string
          ruta_id?: string
          secuencia?: number
          tipo?: Database["public"]["Enums"]["tipo_parada"]
        }
        Relationships: [
          {
            foreignKeyName: "ruta_paradas_orden_trabajo_id_fkey"
            columns: ["orden_trabajo_id"]
            isOneToOne: false
            referencedRelation: "ordenes_trabajo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ruta_paradas_ruta_id_fkey"
            columns: ["ruta_id"]
            isOneToOne: false
            referencedRelation: "rutas"
            referencedColumns: ["id"]
          },
        ]
      }
      rutas: {
        Row: {
          created_at: string
          estado: string
          fecha: string
          id: string
          tecnico_id: string
          vehiculo_id: string | null
        }
        Insert: {
          created_at?: string
          estado?: string
          fecha?: string
          id?: string
          tecnico_id: string
          vehiculo_id?: string | null
        }
        Update: {
          created_at?: string
          estado?: string
          fecha?: string
          id?: string
          tecnico_id?: string
          vehiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rutas_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "tecnicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rutas_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "v_productividad_tecnicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rutas_vehiculo_id_fkey"
            columns: ["vehiculo_id"]
            isOneToOne: false
            referencedRelation: "vehiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      tecnicos: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          nombre: string
          perfil_id: string | null
          rut: string | null
          telefono: string | null
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre: string
          perfil_id?: string | null
          rut?: string | null
          telefono?: string | null
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre?: string
          perfil_id?: string | null
          rut?: string | null
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tecnicos_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      unidades_repuesto: {
        Row: {
          codigo_unidad: string
          created_at: string
          estado: Database["public"]["Enums"]["estado_unidad"]
          id: string
          repuesto_id: string
          ubicacion: string | null
        }
        Insert: {
          codigo_unidad: string
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_unidad"]
          id?: string
          repuesto_id: string
          ubicacion?: string | null
        }
        Update: {
          codigo_unidad?: string
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_unidad"]
          id?: string
          repuesto_id?: string
          ubicacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unidades_repuesto_repuesto_id_fkey"
            columns: ["repuesto_id"]
            isOneToOne: false
            referencedRelation: "repuestos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unidades_repuesto_repuesto_id_fkey"
            columns: ["repuesto_id"]
            isOneToOne: false
            referencedRelation: "v_margen_repuestos"
            referencedColumns: ["id"]
          },
        ]
      }
      vehiculos: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          modelo: string | null
          patente: string
          tecnico_id: string | null
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          modelo?: string | null
          patente: string
          tecnico_id?: string | null
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          modelo?: string | null
          patente?: string
          tecnico_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehiculos_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "tecnicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehiculos_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "v_productividad_tecnicos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_margen_repuestos: {
        Row: {
          costo: number | null
          id: string | null
          margen: number | null
          margen_pct: number | null
          nombre: string | null
          precio_venta: number | null
          sku: string | null
        }
        Insert: {
          costo?: number | null
          id?: string | null
          margen?: number | null
          margen_pct?: never
          nombre?: string | null
          precio_venta?: number | null
          sku?: string | null
        }
        Update: {
          costo?: number | null
          id?: string | null
          margen?: number | null
          margen_pct?: never
          nombre?: string | null
          precio_venta?: number | null
          sku?: string | null
        }
        Relationships: []
      }
      v_productividad_tecnicos: {
        Row: {
          en_curso: number | null
          id: string | null
          nombre: string | null
          total_asignadas: number | null
          total_cerradas: number | null
        }
        Relationships: []
      }
      v_repuestos_en_arriendo: {
        Row: {
          cliente: string | null
          codigo_unidad: string | null
          dias: number | null
          fecha_entrega: string | null
          folio: number | null
          monto_acumulado: number | null
          prestamo_id: string | null
          repuesto: string | null
          sku: string | null
          tarifa_diaria: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      estado_ot:
        | "reportada"
        | "asignada"
        | "en_ruta"
        | "repuesto_entregado"
        | "en_reparacion"
        | "reparado"
        | "devuelto"
        | "cerrada"
        | "cancelada"
      estado_prestamo: "activo" | "cerrado"
      estado_unidad:
        | "disponible"
        | "prestado"
        | "en_reparacion"
        | "dado_de_baja"
      rol_usuario: "admin" | "coordinador" | "tecnico"
      tipo_parada: "entrega" | "retiro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      estado_ot: [
        "reportada",
        "asignada",
        "en_ruta",
        "repuesto_entregado",
        "en_reparacion",
        "reparado",
        "devuelto",
        "cerrada",
        "cancelada",
      ],
      estado_prestamo: ["activo", "cerrado"],
      estado_unidad: [
        "disponible",
        "prestado",
        "en_reparacion",
        "dado_de_baja",
      ],
      rol_usuario: ["admin", "coordinador", "tecnico"],
      tipo_parada: ["entrega", "retiro"],
    },
  },
} as const
