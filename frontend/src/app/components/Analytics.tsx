import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Users, Car, Clock } from 'lucide-react';

type ApiFetch = (url: string, options?: RequestInit) => Promise<Response>;

export default function Analytics({ apiFetch }: { apiFetch: ApiFetch }) {
  const [dailyOccupancy, setDailyOccupancy] = useState<any[]>([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState<any[]>([]);
  const [zoneUsage, setZoneUsage] = useState<any[]>([]);
  const [usersData, setUsersData] = useState<any[]>([]);
  const [summary, setSummary] = useState({ occupied: 0, totalSlots: 0, todayRevenue: 0, activeSessions: 0 });
  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchData = async () => {
      const [analyticsRes, zonesRes, usersRes, summaryRes] = await Promise.all([
        apiFetch(`${API_BASE}/analytics`),
        apiFetch(`${API_BASE}/parking/zones`),
        apiFetch(`${API_BASE}/users`),
        apiFetch(`${API_BASE}/dashboard/summary`),
      ]);
      const analytics = await analyticsRes.json();
      const zones = await zonesRes.json();
      const users = await usersRes.json();
      const dashboard = await summaryRes.json();
      setDailyOccupancy(analytics.dailyOccupancy || []);
      setWeeklyRevenue(analytics.weeklyRevenue || []);
      setZoneUsage((zones || []).map((z: any, idx: number) => ({ zone: `Zone ${z.id}`, usage: z.occupied, color: ['#3b82f6', '#10b981', '#a855f7', '#f97316', '#ec4899'][idx % 5] })));
      setUsersData(users.items || []);
      setSummary(dashboard);
    };
    fetchData();
  }, []);

  const userTypeDistribution = useMemo(() => {
    const dist = { Students: 0, Faculty: 0, Staff: 0, Visitors: 0 };
    usersData.forEach((u) => {
      if (['Student', 'Graduate', 'Doctoral'].includes(u.role)) dist.Students += 1;
      else if (u.role === 'Faculty') dist.Faculty += 1;
      else if (u.role === 'Staff') dist.Staff += 1;
      else dist.Visitors += 1;
    });
    return [
      { type: 'Students', value: dist.Students, color: '#3b82f6' },
      { type: 'Faculty', value: dist.Faculty, color: '#10b981' },
      { type: 'Staff', value: dist.Staff, color: '#f97316' },
      { type: 'Visitors', value: dist.Visitors, color: '#a855f7' },
    ];
  }, [usersData]);

  const peakHours = [
    { hour: '8 AM', entries: 145, exits: 23 }, { hour: '9 AM', entries: 98, exits: 34 },
    { hour: '12 PM', entries: 67, exits: 89 }, { hour: '1 PM', entries: 78, exits: 56 },
    { hour: '5 PM', entries: 34, exits: 156 }, { hour: '6 PM', entries: 23, exits: 132 },
  ];
  const monthlyComparison = [
    { month: 'Oct', revenue: 3200000, users: 1150 }, { month: 'Nov', revenue: 3450000, users: 1180 },
    { month: 'Dec', revenue: 2900000, users: 980 }, { month: 'Jan', revenue: 3800000, users: 1220 },
    { month: 'Feb', revenue: 3650000, users: 1195 }, { month: 'Mar', revenue: 3900000, users: 1245 },
    { month: 'Apr', revenue: 1250000, users: 1234 },
  ];

  const tooltipStyle = { contentStyle: { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' } };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg. Occupancy Rate', value: `${summary.totalSlots ? ((summary.occupied / summary.totalSlots) * 100).toFixed(1) : 0}%`, sub: '+5.2% vs last month', icon: <TrendingUp className="w-3 h-3" />, color: 'text-green-600' },
          { label: 'Avg. Session Duration', value: '4.2h', sub: 'Consistent with last month', icon: <Clock className="w-3 h-3" />, color: 'text-slate-500' },
          { label: "Daily Avg. Revenue", value: `₫${Number(summary.todayRevenue || 0).toLocaleString()}`, sub: '+18% vs last month', icon: <TrendingUp className="w-3 h-3" />, color: 'text-green-600' },
          { label: 'Space Utilization', value: `${summary.totalSlots ? ((summary.occupied / summary.totalSlots) * 100).toFixed(1) : 0}%`, sub: '+3.1% efficiency gain', icon: <TrendingUp className="w-3 h-3" />, color: 'text-green-600' },
        ].map(({ label, value, sub, icon, color }) => (
          <Card key={label}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">{label}</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{value}</div>
              <p className={`text-xs ${color} flex items-center gap-1 mt-1`}>{icon}{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Daily Occupancy Pattern</CardTitle><CardDescription>Average occupancy rate throughout the day</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyOccupancy}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="time" stroke="#64748b" fontSize={12} /><YAxis stroke="#64748b" fontSize={12} /><Tooltip {...tooltipStyle} /><Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} name="Occupancy Rate (%)" /></LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Weekly Revenue</CardTitle><CardDescription>Revenue breakdown by day of week</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyRevenue}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="day" stroke="#64748b" fontSize={12} /><YAxis stroke="#64748b" fontSize={12} /><Tooltip {...tooltipStyle} formatter={(v) => `₫${Number(v).toLocaleString()}`} /><Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} name="Revenue (₫)" /></BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Zone Usage Distribution</CardTitle><CardDescription>Current occupancy by parking zone</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart><Pie data={zoneUsage} cx="50%" cy="50%" labelLine={false} label={({ zone, percent }) => `${zone}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="usage">{zoneUsage.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>User Type Distribution</CardTitle><CardDescription>Active users by category</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart><Pie data={userTypeDistribution} cx="50%" cy="50%" labelLine={false} label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="value">{userTypeDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Peak Hours Analysis</CardTitle><CardDescription>Entry and exit patterns during peak times</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={peakHours}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="hour" stroke="#64748b" fontSize={12} /><YAxis stroke="#64748b" fontSize={12} /><Tooltip {...tooltipStyle} /><Legend /><Bar dataKey="entries" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Entries" /><Bar dataKey="exits" fill="#f97316" radius={[8, 8, 0, 0]} name="Exits" /></BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Monthly Trends</CardTitle><CardDescription>Revenue and user activity over time</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyComparison}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="month" stroke="#64748b" fontSize={12} /><YAxis yAxisId="left" stroke="#64748b" fontSize={12} /><YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} /><Tooltip {...tooltipStyle} /><Legend /><Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue (₫)" /><Line yAxisId="right" type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Active Users" /></LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Key Insights &amp; Recommendations</CardTitle><CardDescription>Data-driven suggestions for optimization</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { bg: 'bg-blue-50', icon: <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />, title: 'Peak Hour Congestion', titleColor: 'text-blue-900', body: 'Zone A reaches 95%+ capacity between 2-4 PM daily. Consider implementing dynamic pricing or guidance to alternative zones during these hours.', bodyColor: 'text-blue-700' },
              { bg: 'bg-green-50', icon: <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />, title: 'Revenue Optimization', titleColor: 'text-green-900', body: 'Visitor parking revenue increased 24% after implementing hourly rates. Consider similar pricing adjustments for weekend student parking.', bodyColor: 'text-green-700' },
              { bg: 'bg-purple-50', icon: <Users className="w-5 h-5 text-purple-600 mt-0.5" />, title: 'User Behavior Pattern', titleColor: 'text-purple-900', body: 'Average session duration for students is 4.8 hours. Monthly passes show strong ROI for this segment.', bodyColor: 'text-purple-700' },
              { bg: 'bg-orange-50', icon: <Car className="w-5 h-5 text-orange-600 mt-0.5" />, title: 'Underutilized Capacity', titleColor: 'text-orange-900', body: 'Zone D operates at only 43% capacity on average. Marketing this zone to staff could improve utilization.', bodyColor: 'text-orange-700' },
            ].map(({ bg, icon, title, titleColor, body, bodyColor }) => (
              <div key={title} className={`flex items-start gap-3 p-4 ${bg} rounded-lg`}>
                {icon}
                <div><div className={`text-sm font-semibold ${titleColor} mb-1`}>{title}</div><div className={`text-xs ${bodyColor}`}>{body}</div></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
