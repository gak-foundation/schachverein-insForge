"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface HistoryEntry {
  recordedAt: string;
  dwz: number | null;
  elo: number | null;
}

interface RatingHistoryChartProps {
  data: HistoryEntry[];
}

export function RatingHistoryChart({ data }: RatingHistoryChartProps) {
  const chartData = [...data]
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .map((entry) => ({
      date: new Date(entry.recordedAt).toLocaleDateString("de-DE", {
        month: "short",
        year: "2-digit",
      }),
      DWZ: entry.dwz,
      ELO: entry.elo,
    }));

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rating Verlauf</CardTitle>
          <CardDescription>Keine historischen Daten verfügbar.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Rating Verlauf</CardTitle>
        <CardDescription>Entwicklung von DWZ und ELO über die Zeit.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                domain={["dataMin - 50", "dataMax + 50"]} 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Line
                type="monotone"
                dataKey="DWZ"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="ELO"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
