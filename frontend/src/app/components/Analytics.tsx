import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Car, Clock } from 'lucide-react';

export default function Analytics() {
  const dailyOccupancy = [
    { time: '00:00', rate: 15 },
    { time: '02:00', rate: 8 },
    { time: '04:00', rate: 5 },
    { time: '06:00', rate: 25 },
    { time: '08:00', rate: 78 },
    { time: '10:00', rate: 85 },
    { time: '12:00', rate: 72 },
    { time: '14:00', rate: 88 },
    { time: '16:00', rate: 92 },
    { time: '18:00', rate: 65 },
    { time: '20:00', rate: 42 },
    { time: '22:00', rate: 28 }
  ];

  const weeklyRevenue = [
    { day: 'Mon', revenue: 850000 },
    { day: 'Tue', revenue: 920000 },
    { day: 'Wed', revenue: 880000 },
    { day: 'Thu', revenue: 950000 },
    { day: 'Fri', revenue: 1100000 },
    { day: 'Sat', revenue: 450000 },
    { day: 'Sun', revenue: 380000 }
  ];

  const zoneUsage = [
    { zone: 'Zone A', usage: 142, color: '#3b82f6' },
    { zone: 'Zone B', usage: 85, color: '#10b981' },
    { zone: 'Zone C', usage: 63, color: '#a855f7' },
    { zone: 'Zone D', usage: 35, color: '#f97316' },
    { zone: 'Zone E', usage: 17, color: '#ec4899' }
  ];

  const userTypeDistribution = [
    { type: 'Students', value: 945, color: '#3b82f6' },
    { type: 'Faculty', value: 156, color: '#10b981' },
    { type: 'Staff', value: 89, color: '#f97316' },
    { type: 'Visitors', value: 44, color: '#a855f7' }
  ];

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
            <div className="text-2xl font-bold text-slate-900">68.4%</div>
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
            <div className="text-2xl font-bold text-slate-900">₫557k</div>
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
            <div className="text-2xl font-bold text-slate-900">85.3%</div>
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
