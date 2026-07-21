"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Item = {
  nombre: string | null;
  total_cerradas: number | null;
  en_curso: number | null;
};

export function ProductividadChart({ data }: { data: Item[] }) {
  const chartData = data.map((d) => ({
    name: (d.nombre ?? "—").split(" ")[0],
    Cerradas: d.total_cerradas ?? 0,
    "En curso": d.en_curso ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Cerradas" stackId="a" fill="#047857" radius={[0, 0, 0, 0]} />
        <Bar dataKey="En curso" stackId="a" fill="#6ee7b7" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
