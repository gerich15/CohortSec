import { useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
} from "@tanstack/react-table";
import { getAnomalies } from "../api/client";

interface Anomaly {
  id: number;
  user_id: number | null;
  user_email: string | null;
  action_type: string;
  description: string | null;
  threat_level: string;
  score: number | null;
  ip_address: string | null;
  geo_location: string | null;
  created_at: string;
  resolved: number;
}

const columnHelper = createColumnHelper<Anomaly>();

const threatLabel: Record<string, string> = {
  High: "Высокий",
  Medium: "Средний",
  Low: "Низкий",
};

const columns: ColumnDef<Anomaly, unknown>[] = [
  columnHelper.accessor("id", { header: "ID", cell: (c) => c.getValue() }),
  columnHelper.accessor("user_email", {
    header: "Пользователь",
    cell: (c) => c.getValue() ?? "-",
  }),
  columnHelper.accessor("action_type", { header: "Действие", cell: (c) => c.getValue() }),
  columnHelper.accessor("description", {
    header: "Что произошло",
    cell: (c) => c.getValue() ?? "-",
  }),
  columnHelper.accessor("threat_level", {
    header: "Угроза",
    cell: (c) => {
      const v = c.getValue() as string;
      const color =
        v === "High"
          ? "var(--danger)"
          : v === "Medium"
          ? "var(--warning)"
          : "var(--text-muted)";
      return <span style={{ color }}>{threatLabel[v] ?? v}</span>;
    },
  }),
  columnHelper.accessor("score", {
    header: "Оценка",
    cell: (c) => (c.getValue() != null ? (c.getValue() as number).toFixed(3) : "-"),
  }),
  columnHelper.accessor("ip_address", {
    header: "IP-адрес",
    cell: (c) => c.getValue() ?? "-",
  }),
  columnHelper.accessor("geo_location", {
    header: "Геолокация",
    cell: (c) => c.getValue() ?? "-",
  }),
  columnHelper.accessor("created_at", {
    header: "Время",
    cell: (c) => new Date(c.getValue() as string).toLocaleString(),
  }),
];

export default function AnomalyTable() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnomalies({ limit: 100 })
      .then((r) => setAnomalies(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const table = useReactTable({
    data: anomalies,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) return <p>Загрузка...</p>;

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>События</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
        Подозрительные входы и действия — проверь, всё ли это ты
      </p>
      <div
        style={{
          background: "var(--bg-card)",
          borderRadius: 8,
          border: "1px solid var(--border)",
          overflow: "auto",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} style={{ borderBottom: "1px solid var(--border)" }}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    style={{
                      textAlign: "left",
                      padding: "0.75rem 1rem",
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} style={{ borderBottom: "1px solid var(--border)" }}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      padding: "0.75rem 1rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {anomalies.length === 0 && (
          <p style={{ padding: "2rem", color: "var(--text-muted)", textAlign: "center" }}>
            Аномалии не обнаружены
          </p>
        )}
      </div>
    </div>
  );
}
