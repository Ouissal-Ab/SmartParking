'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

interface Props {
  data: { day: string; count: number }[];
}

export function ReservationTrend({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1A3263" />
            <stop offset="50%" stopColor="#547792" />
            <stop offset="100%" stopColor="#FAB95B" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#D4CCC2" />
        <XAxis dataKey="day" stroke="#5C6577" fontSize={12} />
        <YAxis stroke="#5C6577" fontSize={12} />
        <Tooltip
          contentStyle={{
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid #D4CCC2',
            borderRadius: '12px',
            fontSize: 12,
            backdropFilter: 'blur(8px)',
          }}
          formatter={(value: number) => [`${value} réservations`, '']}
          labelFormatter={(label) => `Jour : ${label}`}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="url(#trendGradient)"
          strokeWidth={3}
          dot={{ r: 5, fill: '#1A3263' }}
          activeDot={{ r: 7, fill: '#FAB95B' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
