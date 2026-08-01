"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function RevenueChart({
  data,
}: {
  data: { day: string; total: number }[];
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">
        Todavía no hay ventas registradas para graficar.
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="mb-4 text-sm font-medium text-gray-600">Últimos 30 días</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <XAxis
            dataKey="day"
            tickFormatter={(value) => value.slice(5)}
            fontSize={12}
          />
          <YAxis fontSize={12} />
          <Tooltip
            formatter={(value) => `$${Number(value).toLocaleString("es-AR")}`}
          />
          <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
