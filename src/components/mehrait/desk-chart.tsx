import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function DeskChart({ items }: { items: { name: string; count: number }[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={items}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#5e584f" }} interval={0} height={48} />
          <YAxis allowDecimals={false} width={32} tick={{ fontSize: 11, fill: "#5e584f" }} />
          <Tooltip />
          <Bar dataKey="count" fill="var(--color-brand)" radius={6} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
