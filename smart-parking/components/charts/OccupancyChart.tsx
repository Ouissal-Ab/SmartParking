'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import type { Parking } from '@/types/parking';

interface Props {
  parkings: Parking[];
}

const COLORS = ['#1A3263', '#547792', '#FAB95B', '#B85450', '#8A92A0'];

export function OccupancyChart({ parkings }: Props) {
  const data = parkings.map((p) => ({
    name: p.name,
    occupancy: p.totalSpots - p.availableSpots,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="occupancy"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={95}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid #D4CCC2',
            borderRadius: '12px',
            fontSize: 12,
            backdropFilter: 'blur(8px)',
          }}
          formatter={(value: number, name: string) => [`${value} places`, name]}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          wrapperStyle={{ fontSize: 12, color: '#5C6577' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
