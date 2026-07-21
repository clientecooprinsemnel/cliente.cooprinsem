import { estadoColor, estadoLabel } from "@/lib/format";
import type { Enums } from "@/types/database";

export function EstadoBadge({ estado }: { estado: Enums<"estado_ot"> }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoColor[estado]}`}
    >
      {estadoLabel[estado]}
    </span>
  );
}
