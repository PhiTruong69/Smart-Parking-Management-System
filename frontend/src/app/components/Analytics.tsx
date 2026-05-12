import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, DollarSign, Users, Car, Clock } from 'lucide-react';

type ApiFetch = (url: string, options?: RequestInit) => Promise<Response>;

export default function Analytics({ isAdmin, apiFetch }: { isAdmin?: boolean; apiFetch: ApiFetch }) {
  const API_BASE = 'http://localhost:5000/api';

  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`${API_BASE}/analytics`);
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const timer = setInterval(fetchData, 30000); // refresh mỗi 30s
    return () => clearInterval(timer);
  }, []);

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Loading analytics...
      </div>
    );
  }

  const { summary, dailyOccupancy, weeklyRevenue, zoneDistribution, userTypeDistribution, rushHours } = analytics;

  // Map userTypeDistribution từ BE → màu cho PieChart
  const USER_TYPE_COLORS: Record<string, string> = {
    Student: '#3b82f6', Graduate: '#8b5cf6', Doctoral: '#6366f1',
    Faculty: '#10b981', Staff: '#f97316', Visitor: '#a855f7', Unknown: '#94a3b8',
  };
  const userTypePie = (userTypeDistribution || []).map((d: any) => ({
    type: d.type,
    value: d.count,
    color: USER_TYPE_COLORS[d.type] || '#94a3b8',
  }));

  // Zone distribution colors
  const ZONE_COLORS = ['#3b82f6', '#10b981', '#a855f7', '#f97316', '#ec4899'];
  const zonePie = (zoneDistribution || []).map((z: any, i: number) => ({
    zone: `Zone ${z.id || z.zone}`,
    usage: z.occupied,
    color: ZONE_COLORS[i % 5],
  }));

  const tooltipStyle = {
    contentStyle: { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' },
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Space Utilization',
            value: `${summary.spaceUtilization ?? 0}%`,
            sub: `${summary.activeSessions} active sessions`,
            icon: <TrendingUp className="w-3 h-3" />,
            color: 'text-green-600',
          },
          {
            label: 'Avg. Session Duration',
            value: `${summary.avgDurationHours ?? 0}h`,
            sub: `${summary.totalSessions} total sessions`,
            icon: <Clock className="w-3 h-3" />,
            color: 'text-slate-500',
          },
          ...(isAdmin ? [{
            label: 'Total Revenue',
            value: `₫${(summary.totalRevenue ?? 0).toLocaleString()}`,
            sub: `Avg ₫${(summary.avgRevenuePerSession ?? 0).toLocaleString()}/session`,
            icon: <DollarSign className="w-3 h-3" />,
            color: 'text-green-600',
          }] : []),
          {
            label: 'Active Sessions',
            value: summary.activeSessions ?? 0,
            sub: `${summary.totalSessions} total recorded`,
            icon: <Car className="w-3 h-3" />,
            color: 'text-blue-600',
          },
        ].map(({ label, value, sub, icon, color }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{value}</div>
              <p className={`text-xs ${color} flex items-center gap-1 mt-1`}>{icon}{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Daily Occupancy + Weekly Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Occupancy Pattern</CardTitle>
            <CardDescription>Số lượt xe theo giờ trong ngày hôm nay</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyOccupancy.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
                Chưa có dữ liệu hôm nay
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyOccupancy}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                  <Tooltip {...tooltipStyle} />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Số xe" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Weekly Revenue</CardTitle>
              <CardDescription>Doanh thu 7 ngày gần nhất</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip {...tooltipStyle} formatter={(v) => `₫${Number(v).toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} name="Doanh thu (₫)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Zone Distribution + User Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Zone Usage Distribution</CardTitle>
            <CardDescription>Tỉ lệ xe đang đỗ theo khu vực</CardDescription>
          </CardHeader>
          <CardContent>
            {zonePie.every((z: any) => z.usage === 0) ? (
              <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
                Tất cả khu vực đang trống
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={zonePie} cx="50%" cy="50%" outerRadius={100} dataKey="usage"
                    label={({ zone, percent }) => percent > 0 ? `${zone}: ${(percent * 100).toFixed(0)}%` : ''}
                    labelLine={false}
                  >
                    {zonePie.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v} xe`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Type Distribution</CardTitle>
            <CardDescription>Phân bổ loại người dùng đang trong bãi</CardDescription>
          </CardHeader>
          <CardContent>
            {userTypePie.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
                Không có session nào đang active
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userTypePie} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                    label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {userTypePie.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v} xe`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rush Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Peak Hours Analysis</CardTitle>
          <CardDescription>Các giờ cao điểm dựa trên lịch sử sessions thực tế</CardDescription>
        </CardHeader>
        <CardContent>
          {rushHours.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
              Chưa đủ dữ liệu
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rushHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="entries" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Lượt vào" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Insights — giữ static vì đây là nhận xét mang tính tư vấn */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights &amp; Recommendations</CardTitle>
          <CardDescription>Gợi ý tối ưu hoá dựa trên dữ liệu hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { bg: 'bg-blue-50', icon: <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />, title: 'Peak Hour Congestion', titleColor: 'text-blue-900', body: 'Zone A thường đạt 95%+ vào 14:00–16:00. Cân nhắc dynamic pricing hoặc hướng dẫn sang zone khác.', bodyColor: 'text-blue-700' },
              { bg: 'bg-green-50', icon: <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />, title: 'Revenue Optimization', titleColor: 'text-green-900', body: 'Visitor parking chiếm tỉ lệ nhỏ nhưng hourly rate cao. Tăng capacity Zone E có thể cải thiện doanh thu.', bodyColor: 'text-green-700' },
              { bg: 'bg-purple-50', icon: <Users className="w-5 h-5 text-purple-600 mt-0.5" />, title: 'User Behavior Pattern', titleColor: 'text-purple-900', body: 'Students chiếm phần lớn sessions. Monthly pass mang lại doanh thu ổn định hơn hourly.', bodyColor: 'text-purple-700' },
              { bg: 'bg-orange-50', icon: <Car className="w-5 h-5 text-orange-600 mt-0.5" />, title: 'Underutilized Capacity', titleColor: 'text-orange-900', body: 'Zone D thường dưới 50% công suất. Có thể marketing thêm hoặc mở cho khách vãng lai.', bodyColor: 'text-orange-700' },
            ].map(({ bg, icon, title, titleColor, body, bodyColor }) => (
              <div key={title} className={`flex items-start gap-3 p-4 ${bg} rounded-lg`}>
                {icon}
                <div>
                  <div className={`text-sm font-semibold ${titleColor} mb-1`}>{title}</div>
                  <div className={`text-xs ${bodyColor}`}>{body}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}