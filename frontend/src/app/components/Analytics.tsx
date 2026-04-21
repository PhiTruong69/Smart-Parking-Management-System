import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Users, Car, Clock } from 'lucide-react';

export default function Analytics() {
  const [dailyOccupancy, setDailyOccupancy] = useState<any[]>([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState<any[]>([]);
  const [zoneUsage, setZoneUsage] = useState<any[]>([]);
  const [usersData, setUsersData] = useState<any[]>([]);
  const [summary, setSummary] = useState({ occupied: 0, totalSlots: 0, todayRevenue: 0, activeSessions: 0 });
  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchData = async () => {
      const [analyticsRes, zonesRes, usersRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE}/analytics`),
        fetch(`${API_BASE}/parking/zones`),
        fetch(`${API_BASE}/users`),
        fetch(`${API_BASE}/dashboard/summary`)
      ]);
      const analytics = await analyticsRes.json();
      const zones = await zonesRes.json();
      const users = await usersRes.json();
      const dashboard = await summaryRes.json();

      setDailyOccupancy(analytics.dailyOccupancy || []);
      setWeeklyRevenue(analytics.weeklyRevenue || []);
      setZoneUsage((zones || []).map((z: any, idx: number) => ({
        zone: `Zone ${z.id}`,
        usage: z.occupied,
        color: ['#3b82f6', '#10b981', '#a855f7', '#f97316', '#ec4899'][idx % 5]
      })));
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
      { type: 'Visitors', value: dist.Visitors, color: '#a855f7' }
    ];
  }, [usersData]);

  const peakHours = [
    { hour: '8 AM', entries: 145, exits: 23 },
    { hour: '9 AM', entries: 98, exits: 34 },
    { hour: '12 PM', entries: 67, exits: 89 },
    { hour: '1 PM', entries: 78, exits: 56 },
    { hour: '5 PM', entries: 34, exits: 156 },
    { hour: '6 PM', entries: 23, exits: 132 }
  ];

  const monthlyComparison = [
    { month: 'Oct', revenue: 3200000, users: 1150 },
    { month: 'Nov', revenue: 3450000, users: 1180 },
    { month: 'Dec', revenue: 2900000, users: 980 },
    { month: 'Jan', revenue: 3800000, users: 1220 },
    { month: 'Feb', revenue: 3650000, users: 1195 },
    { month: 'Mar', revenue: 3900000, users: 1245 },
    { month: 'Apr', revenue: 1250000, users: 1234 }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Avg. Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {summary.totalSlots ? ((summary.occupied / summary.totalSlots) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +5.2% vs last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Avg. Session Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">4.2h</div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              Consistent with last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Daily Avg. Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">₫{Number(summary.todayRevenue || 0).toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +18% vs last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Space Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {summary.totalSlots ? ((summary.occupied / summary.totalSlots) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +3.1% efficiency gain
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Occupancy Pattern */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Occupancy Pattern</CardTitle>
            <CardDescription>Average occupancy rate throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyOccupancy}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Occupancy Rate (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Revenue</CardTitle>
            <CardDescription>Revenue breakdown by day of week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => `₫${Number(value).toLocaleString()}`}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} name="Revenue (₫)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zone Usage Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Zone Usage Distribution</CardTitle>
            <CardDescription>Current occupancy by parking zone</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={zoneUsage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ zone, percent }) => `${zone}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="usage"
                  >
                    {zoneUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Type Distribution</CardTitle>
            <CardDescription>Active users by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userTypeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Hours Analysis</CardTitle>
            <CardDescription>Entry and exit patterns during peak times</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="entries" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Entries" />
                <Bar dataKey="exits" fill="#f97316" radius={[8, 8, 0, 0]} name="Exits" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Revenue and user activity over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Revenue (₫)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Active Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights & Recommendations</CardTitle>
          <CardDescription>Data-driven suggestions for optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-blue-900 mb-1">Peak Hour Congestion</div>
                <div className="text-xs text-blue-700">
                  Zone A reaches 95%+ capacity between 2-4 PM daily. Consider implementing dynamic pricing or guidance to alternative zones during these hours.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-green-900 mb-1">Revenue Optimization</div>
                <div className="text-xs text-green-700">
                  Visitor parking revenue increased 24% after implementing hourly rates. Consider similar pricing adjustments for weekend student parking.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
              <Users className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-purple-900 mb-1">User Behavior Pattern</div>
                <div className="text-xs text-purple-700">
                  Average session duration for students is 4.8 hours, suggesting most stay for multiple classes. Monthly passes show strong ROI for this segment.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
              <Car className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-orange-900 mb-1">Underutilized Capacity</div>
                <div className="text-xs text-orange-700">
                  Zone D operates at only 43% capacity on average. Marketing this zone to staff and promoting its proximity to facilities could improve utilization.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
