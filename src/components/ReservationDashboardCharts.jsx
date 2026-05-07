import React, { useId, useMemo } from 'react';
import {
  ResponsiveContainer,
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const PRIMARY = '#F97316';
const SLATE = '#64748b';

function formatShortDate(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function buildBuckets(days, direction) {
  const out = [];
  const base = new Date();
  base.setHours(12, 0, 0, 0);
  for (let i = 0; i < days; i += 1) {
    const d = new Date(base);
    if (direction === 'past') {
      d.setDate(base.getDate() - (days - 1 - i));
    } else {
      d.setDate(base.getDate() + i);
    }
    const iso = d.toISOString().split('T')[0];
    out.push({ date: iso, label: formatShortDate(iso), count: 0 });
  }
  return out;
}

function ReservationDashboardCharts({
  reservations = [],
  loading,
  trendDirection = 'past',
  titleTrend,
  titleStatus,
}) {
  const fillGradientId = useId().replace(/:/g, '');

  const trendData = useMemo(() => {
    const days = 14;
    const buckets = buildBuckets(days, trendDirection);
    const byDate = new Map(buckets.map((b) => [b.date, b]));
    reservations.forEach((r) => {
      const key = r.checkInDate;
      if (!key || !byDate.has(key)) return;
      byDate.get(key).count += 1;
    });
    return buckets;
  }, [reservations, trendDirection]);

  const statusData = useMemo(() => {
    const order = ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'];
    const counts = Object.fromEntries(order.map((s) => [s, 0]));
    reservations.forEach((r) => {
      const s = r.status || 'pending';
      if (Object.prototype.hasOwnProperty.call(counts, s)) counts[s] += 1;
      else counts.pending += 1;
    });
    return order.map((name) => ({
      name: name.replace(/-/g, ' '),
      count: counts[name],
    }));
  }, [reservations]);

  const trendTitle =
    titleTrend ||
    (trendDirection === 'past'
      ? 'Check-ins (last 14 days)'
      : 'Scheduled check-ins (next 14 days)');
  const statusTitle = titleStatus || 'Reservations by status';

  if (loading) {
    return (
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {[1, 2].map((k) => (
          <div
            key={k}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
          >
            <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />
            <div className="mt-4 h-[240px] animate-pulse rounded-xl bg-slate-50" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <p className="text-sm font-semibold text-slate-900">{trendTitle}</p>
        <p className="mt-1 text-xs text-slate-500">
          Count of reservations by check-in date.
        </p>
        <div className="mt-4 h-[240px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: SLATE }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                interval="preserveStartEnd"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: SLATE }}
                tickLine={false}
                axisLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  fontSize: 12,
                }}
                formatter={(v) => [v, 'Bookings']}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.date ? String(payload[0].payload.date) : ''
                }
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={PRIMARY}
                strokeWidth={2}
                fill={`url(#${fillGradientId})`}
                name="Bookings"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <p className="text-sm font-semibold text-slate-900">{statusTitle}</p>
        <p className="mt-1 text-xs text-slate-500">
          Snapshot of reservation statuses in the system.
        </p>
        <div className="mt-4 h-[240px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={statusData}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 10, fill: SLATE }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={88}
                tick={{ fontSize: 10, fill: SLATE }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  fontSize: 12,
                }}
                formatter={(v) => [v, 'Count']}
              />
              <Bar dataKey="count" fill={PRIMARY} radius={[0, 6, 6, 0]} name="Reservations" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default ReservationDashboardCharts;
