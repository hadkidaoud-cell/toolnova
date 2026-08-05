"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = [
  "#0c87f0",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

const TOOLTIP_STYLE = {
  borderRadius: "0.5rem",
  border: "1px solid #e5e7eb",
  fontSize: "0.75rem",
  background: "#fff",
};

export function TopToolsBar({ data }: { data: { name: string; views: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-neutral-400">
        No tools yet. Sync the catalog from the Tools page.
      </div>
    );
  }
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} contentStyle={TOOLTIP_STYLE} />
          <Bar dataKey="views" fill="#0c87f0" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrafficArea({ data }: { data: { day: string; count: number }[] }) {
  if (data.length === 0 || data.every((d) => d.count === 0)) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-neutral-400">
        No usage data yet. Usages appear as visitors use your tools.
      </div>
    );
  }
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0c87f0" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#0c87f0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#9ca3af" interval="preserveStartEnd" minTickGap={24} />
          <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Area type="monotone" dataKey="count" stroke="#0c87f0" strokeWidth={2} fill="url(#trafficFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryPie({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-neutral-400">
        No categories yet.
      </div>
    );
  }
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={50}
            outerRadius={85}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {data.map((entry, index) => (
          <span key={entry.name} className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
            {entry.name} ({entry.value})
          </span>
        ))}
      </div>
    </div>
  );
}
