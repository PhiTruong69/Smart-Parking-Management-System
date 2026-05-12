import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Switch } from './components/ui/switch';
import { Separator } from './components/ui/separator';
import { Progress } from './components/ui/progress';
import { useWebSocket } from './hooks/useWebsocket';
import {
  Car,
  Users,
  CreditCard,
  Activity,
  Settings,
  BarChart3,
  MapPin,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  Clock,
  UserCheck,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import ParkingMap from './components/ParkingMap';
import UserManagement from './components/UserManagement';
import BillingPanel from './components/BillingPanel';
import ActivityLogs from './components/ActivityLogs';
import IoTMonitoring from './components/IoTMonitoring';
import Analytics from './components/Analytics';
import TrafficSimulation from './components/TrafficSimulation';
import { apiFetch } from './lib/apiFetch';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [auth, setAuth] = useState<any>(() => {
    const raw = localStorage.getItem('spms-auth');
    return raw ? JSON.parse(raw) : null;
  });
  const [authForm, setAuthForm] = useState({
    studentId: '',
    password: '',
    name: '',
    role: 'Student',
    program: 'N/A',
  });
  const [authError, setAuthError] = useState('');
  const [stats, setStats] = useState({
    totalSpaces: null,
    occupied: null,
    available: null,
    revenue: null,
    activeUsers: null,
    sensors: null,
    sensorsOnline: null
  });
  const [zones, setZones] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  const [zoneUpdateTick, setZoneUpdateTick] = useState(0);
  const { connected: wsConnected } = useWebSocket({
    enabled: !!auth,
    onZoneUpdate: (updatedZones) => {
      setZones(updatedZones);
      setZoneUpdateTick((t) => t + 1); // báo cho ParkingMap sync
      setStats((prev) => {
        const occupied = updatedZones.reduce((s, z) => s + z.occupied, 0);
        const totalSlots = updatedZones.reduce((s, z) => s + z.total, 0);
        return { ...prev, occupied, available: totalSlots - occupied, totalSpaces: totalSlots };
      });
    },
  });

  const isAdmin = auth?.user?.role === 'Admin';
  const actorRole = auth?.actorRole || 'END_USER';

  // Fetch dashboard — dùng apiFetch để tự gắn JWT
  useEffect(() => {
    if (!auth) return; // chưa login thì không fetch
    const fetchDashboard = async () => {
      try {
        const [summaryRes, zonesRes, iotRes, logsRes] = await Promise.all([
          apiFetch(`${API_BASE}/dashboard/summary`),
          apiFetch(`${API_BASE}/parking/zones`),
          apiFetch(`${API_BASE}/iot/status`),
          apiFetch(`${API_BASE}/activity-logs`),
        ]);

        // Nếu token hết hạn → logout tự động
        if (summaryRes.status === 401) {
          logout();
          return;
        }
        if (summaryRes.ok && zonesRes.ok && iotRes.ok && logsRes.ok) {
          const summary = await summaryRes.json();
          const zonesData = await zonesRes.json();
          const iot = await iotRes.json();
          const logs = await logsRes.json();

          setStats({
            totalSpaces: summary.totalSlots ?? null,
            occupied: summary.occupied ?? null,
            available: summary.available ?? null,
            revenue: summary.todayRevenue ?? null,
            activeUsers: summary.activeSessions ?? null,
            sensors: iot.totalSensors ?? null,
            sensorsOnline: iot.online ?? null,
          });
          setZones(zonesData || []);
          setRecentLogs((logs.items || []).slice(0, 5));
        } else {
          console.error('Dashboard fetch failed:', {
            summary: summaryRes.status,
            zones: zonesRes.status,
            iot: iotRes.status,
            logs: logsRes.status,
          });
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      }
    };

    fetchDashboard();
    const timer = setInterval(fetchDashboard, 10000);
    return () => clearInterval(timer);
  }, [auth]); // re-run khi auth thay đổi (login/logout)

  const occupancyRate =
    stats.totalSpaces && stats.occupied ? (stats.occupied / stats.totalSpaces) * 100 : 0;

  // Login / Register — public, không cần token
  const handleAuth = async () => {
    setAuthError('');
    const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
    const payload =
      authMode === 'login'
        ? { studentId: authForm.studentId, password: authForm.password }
        : authForm;

    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) return setAuthError(data.message || 'Authentication failed');
    if (authMode === 'register') {
      setAuthMode('login');
      setAuthError('Đăng ký thành công, vui lòng đăng nhập.');
      return;
    }

    // Lưu toàn bộ { token, user, actorRole } vào localStorage
    setAuth(data);
    localStorage.setItem('spms-auth', JSON.stringify(data));
  };

  const logout = async () => {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST' }).catch(() => { });
    setAuth(null);
    localStorage.removeItem('spms-auth');
  };

  // ── Login / Register Screen ─────────────────────────────────────────────────
  if (!auth) {
    return (
      <div className="min-h-screen bg-[linear-gradient(135deg,#e7f8f2_0%,#f8fafc_42%,#eaf1f7_100%)] px-4 py-8">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="overflow-hidden rounded-lg bg-slate-950 text-white shadow-2xl">
            <div className="bg-[linear-gradient(135deg,#0f172a_0%,#0f766e_55%,#14532d_100%)] p-8 md:p-10">
              <div className="mb-10 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
                  <Car className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold leading-tight">HCMUT Smart Parking</h1>
                  <p className="text-sm text-emerald-50/80">IoT-SPMS1 Operations Portal</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Zones', value: 'A-E', icon: <MapPin className="h-4 w-4" /> },
                  { label: 'Gateway', value: 'BKPay', icon: <CreditCard className="h-4 w-4" /> },
                  { label: 'Telemetry', value: 'Live', icon: <Wifi className="h-4 w-4" /> },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-white/15 bg-white/10 p-4">
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-md bg-white/15">
                      {item.icon}
                    </div>
                    <div className="text-xl font-semibold">{item.value}</div>
                    <div className="text-xs uppercase text-emerald-50/70">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 bg-slate-950 p-6 text-sm text-slate-300 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-2 flex items-center gap-2 text-white">
                  <UserCheck className="h-4 w-4 text-emerald-300" />
                  Demo Admin
                </div>
                <div className="font-mono text-xs text-slate-400">admin / admin123</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-2 flex items-center gap-2 text-white">
                  <Users className="h-4 w-4 text-sky-300" />
                  Demo User
                </div>
                <div className="font-mono text-xs text-slate-400">1952001 / 123456</div>
              </div>
            </div>
          </section>

          <Card className="w-full border-0 bg-white/95 shadow-2xl backdrop-blur">
            <CardHeader className="space-y-2">
              <Badge className="w-fit bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                {authMode === 'login' ? 'Secure access' : 'New account'}
              </Badge>
              <CardTitle className="text-2xl text-slate-950">
                {authMode === 'login' ? 'Đăng nhập hệ thống' : 'Đăng ký tài khoản'}
              </CardTitle>
              <CardDescription>
                Truy cập bảng điều khiển bãi xe thông minh HCMUT.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Mã số / Username</Label>
                <Input
                  id="studentId"
                  placeholder="admin hoặc 1952001"
                  value={authForm.studentId}
                  onChange={(e) => setAuthForm((p) => ({ ...p, studentId: e.target.value }))}
                  className="h-11 bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  placeholder="Nhập mật khẩu"
                  type="password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm((p) => ({ ...p, password: e.target.value }))}
                  className="h-11 bg-slate-50"
                />
              </div>
              {authMode === 'register' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Họ tên</Label>
                    <Input
                      id="name"
                      placeholder="Nguyễn Văn A"
                      value={authForm.name}
                      onChange={(e) => setAuthForm((p) => ({ ...p, name: e.target.value }))}
                      className="h-11 bg-slate-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="program">Chương trình / Đơn vị</Label>
                    <Input
                      id="program"
                      placeholder="Khoa / lớp / phòng ban"
                      value={authForm.program}
                      onChange={(e) => setAuthForm((p) => ({ ...p, program: e.target.value }))}
                      className="h-11 bg-slate-50"
                    />
                  </div>
                </>
              )}
              {authError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {authError}
                </div>
              )}
              <Button onClick={handleAuth} className="h-11 w-full">
                {authMode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-slate-600"
                onClick={() => setAuthMode((m) => (m === 'login' ? 'register' : 'login'))}
              >
                {authMode === 'login' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── Main App ────────────────────────────────────────────────────────────────
  const tabItems = [
    { value: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { value: 'parking', label: 'Parking Map', icon: MapPin },
    { value: 'simulation', label: 'Simulation', icon: Activity },
    { value: 'users', label: 'Users', icon: Users },
    { value: 'billing', label: 'Billing', icon: CreditCard },
    { value: 'iot', label: 'IoT', icon: Wifi },
    { value: 'activity', label: 'Activity', icon: Clock },
    { value: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#0f766e_58%,#155e75_100%)] text-white shadow-xl">
        <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-white">HCMUT Smart Parking System</h1>
                <p className="text-sm text-teal-50/80">IoT-SPMS1 Management Portal</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="gap-1 border-white/20 bg-white/10 text-white">
                <div className={`h-2 w-2 rounded-full animate-pulse ${wsConnected ? 'bg-emerald-300' : 'bg-amber-300'}`} />
                {wsConnected ? 'System Online' : 'Reconnecting...'}
              </Badge>
              <Badge variant="secondary" className="bg-white text-slate-800 hover:bg-white">
                {auth.user.role}
              </Badge>
              <Button variant="outline" onClick={logout} className="border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white">
                Đăng xuất
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/15 hover:text-white">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 md:grid-cols-4 xl:grid-cols-8">
            {tabItems.map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value} className="min-h-10">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <section className="overflow-hidden rounded-lg bg-[linear-gradient(135deg,#0f172a_0%,#0f766e_54%,#f59e0b_140%)] p-5 text-white shadow-xl">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <Badge className="mb-4 bg-white/15 text-white hover:bg-white/15">
                    Live operations
                  </Badge>
                  <h2 className="text-2xl font-semibold leading-tight md:text-3xl">
                    Parking command center
                  </h2>
                  <p className="mt-2 text-sm text-teal-50/80">
                    {stats.available ?? '-'} available spaces across {stats.totalSpaces ?? '-'} slots.
                  </p>
                </div>
                <div className="grid min-w-full gap-3 sm:grid-cols-3 lg:min-w-[520px]">
                  {[
                    { label: 'Occupancy', value: `${occupancyRate.toFixed(1)}%`, tone: 'bg-white/12' },
                    { label: 'Sensors', value: `${stats.sensorsOnline ?? '-'}/${stats.sensors ?? '-'}`, tone: 'bg-emerald-300/15' },
                    { label: 'Active users', value: stats.activeUsers ?? '-', tone: 'bg-amber-300/15' },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-lg border border-white/15 ${item.tone} p-4`}>
                      <div className="text-2xl font-semibold">{item.value}</div>
                      <div className="text-xs uppercase text-white/65">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="overflow-hidden border-0 bg-white/90 ring-1 ring-slate-200/70">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total Parking Spaces
                  </CardTitle>
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-50 text-teal-700">
                    <Car className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {stats.totalSpaces ?? '-'}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Across all zones</p>
                  <Progress value={occupancyRate} className="mt-3" />
                  <p className="text-xs text-slate-400 mt-1">
                    {occupancyRate.toFixed(1)}% occupied
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-0 bg-white/90 ring-1 ring-emerald-200/70">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Available Spaces
                  </CardTitle>
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                    <MapPin className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.available ?? '-'}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Ready for parking</p>
                </CardContent>
              </Card>

              {isAdmin && (
                <Card className="overflow-hidden border-0 bg-white/90 ring-1 ring-amber-200/70">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">
                      Today's Revenue
                    </CardTitle>
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-50 text-amber-700">
                      <DollarSign className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900">
                      ₫{stats.revenue?.toLocaleString() ?? '-'}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Parking fees collected</p>
                  </CardContent>
                </Card>
              )}

              <Card className="overflow-hidden border-0 bg-white/90 ring-1 ring-sky-200/70">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Active Users
                  </CardTitle>
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-50 text-sky-700">
                    <Users className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {stats.activeUsers ?? '-'}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Currently in parking areas</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Status Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Real-time Status */}
              <Card className="border-0 bg-white/95 ring-1 ring-slate-200/70 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Real-time Parking Status</CardTitle>
                  <CardDescription>Overview of parking zones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.isArray(zones) && zones.map((zone) => {
                    const zoneOccupancy = (zone.occupied / zone.total) * 100;
                    return (
                      <div key={zone.id} className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">{zone.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">
                              {zone.occupied}/{zone.total}
                            </span>
                            <Badge
                              variant={zone.state === 'full' ? 'destructive' : 'secondary'}
                              className={zone.state === 'full' ? '' : 'bg-green-100 text-green-700'}
                            >
                              {zone.state === 'full'
                                ? 'Full'
                                : zone.state === 'nearly_full'
                                  ? 'Nearly Full'
                                  : 'Available'}
                            </Badge>
                          </div>
                        </div>
                        <Progress value={zoneOccupancy} />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* System Health */}
              <Card className="border-0 bg-white/95 ring-1 ring-slate-200/70">
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>IoT infrastructure status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">IoT Sensors</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {stats.sensorsOnline ?? '-'} / {stats.sensors ?? '-'}
                      </Badge>
                    </div>
                    <Progress
                      value={
                        stats.sensors && stats.sensorsOnline
                          ? (stats.sensorsOnline / stats.sensors) * 100
                          : 0
                      }
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">HCMUT_SSO</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <Wifi className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">HCMUT_DATACORE</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <Wifi className="w-3 h-3 mr-1" />
                        Synced
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">BKPay Gateway</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <Wifi className="w-3 h-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Entry Gates</span>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        4/5 Active
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div className="text-xs text-slate-600">
                        <strong>Warning:</strong> Gate E3 sensor offline. Maintenance scheduled.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-0 bg-white/95 ring-1 ring-slate-200/70">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest parking transactions and events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentLogs.map((activity, idx) => (
                    <div
                      key={activity.id || idx}
                      className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-0"
                    >
                      <div className="flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.type === 'entry'
                            ? 'bg-green-100'
                            : activity.type === 'exit'
                              ? 'bg-blue-100'
                              : activity.type === 'ticket'
                                ? 'bg-purple-100'
                                : activity.type === 'payment'
                                  ? 'bg-yellow-100'
                                  : 'bg-slate-100'
                            }`}
                        >
                          {activity.type === 'entry' && (
                            <Car className="w-4 h-4 text-green-600" />
                          )}
                          {activity.type === 'exit' && (
                            <Car className="w-4 h-4 text-blue-600" />
                          )}
                          {activity.type === 'ticket' && (
                            <Clock className="w-4 h-4 text-purple-600" />
                          )}
                          {activity.type === 'payment' && (
                            <CreditCard className="w-4 h-4 text-yellow-600" />
                          )}
                          {activity.type === 'system' && (
                            <Activity className="w-4 h-4 text-slate-600" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{activity.user}</p>
                        <p className="text-xs text-slate-500">
                          {activity.action} • {activity.zone}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {activity.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other Tabs — truyền apiFetch xuống */}
          <TabsContent value="parking">
            <ParkingMap apiFetch={apiFetch} zoneUpdateTick={zoneUpdateTick} />
          </TabsContent>

          <TabsContent value="simulation">
            <TrafficSimulation actorRole={actorRole} apiFetch={apiFetch} />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement apiFetch={apiFetch} />
          </TabsContent>

          <TabsContent value="billing">
            <BillingPanel isAdmin={isAdmin} actorRole={actorRole} apiFetch={apiFetch} />
          </TabsContent>

          <TabsContent value="iot">
            <IoTMonitoring apiFetch={apiFetch} />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityLogs isAdmin={isAdmin} actorRole={actorRole} apiFetch={apiFetch} />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics isAdmin={isAdmin} apiFetch={apiFetch} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
