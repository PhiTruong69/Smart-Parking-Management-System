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
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>
              {authMode === 'login' ? 'Đăng nhập hệ thống' : 'Đăng ký tài khoản'}
            </CardTitle>
            <CardDescription>
              Admin demo: `admin` / `admin123`; User demo: `1952001` / `123456`
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Mã số / Username"
              value={authForm.studentId}
              onChange={(e) => setAuthForm((p) => ({ ...p, studentId: e.target.value }))}
            />
            <Input
              placeholder="Mật khẩu"
              type="password"
              value={authForm.password}
              onChange={(e) => setAuthForm((p) => ({ ...p, password: e.target.value }))}
            />
            {authMode === 'register' && (
              <>
                <Input
                  placeholder="Họ tên"
                  value={authForm.name}
                  onChange={(e) => setAuthForm((p) => ({ ...p, name: e.target.value }))}
                />
                <Input
                  placeholder="Chương trình / Đơn vị"
                  value={authForm.program}
                  onChange={(e) => setAuthForm((p) => ({ ...p, program: e.target.value }))}
                />
              </>
            )}
            {authError && <div className="text-sm text-red-600">{authError}</div>}
            <Button onClick={handleAuth} className="w-full">
              {authMode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setAuthMode((m) => (m === 'login' ? 'register' : 'login'))}
            >
              {authMode === 'login' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Main App ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900">HCMUT Smart Parking System</h1>
                <p className="text-sm text-slate-500">IoT-SPMS1 Management Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-1">
                <div className={`w-2 h-2 rounded-full animate-pulse ${wsConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                {wsConnected ? 'System Online' : 'Reconnecting...'}
              </Badge>
              <Badge variant="secondary">{auth.user.role}</Badge>
              <Button variant="outline" onClick={logout}>
                Đăng xuất
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="parking">Parking Map</TabsTrigger>
            <TabsTrigger value="simulation">Simulation</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="iot">IoT</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total Parking Spaces
                  </CardTitle>
                  <Car className="w-4 h-4 text-slate-400" />
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

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Available Spaces
                  </CardTitle>
                  <MapPin className="w-4 h-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.available ?? '-'}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Ready for parking</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Today's Revenue
                  </CardTitle>
                  <DollarSign className="w-4 h-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    ₫{stats.revenue?.toLocaleString() ?? '-'}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Parking fees collected</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Active Users
                  </CardTitle>
                  <Users className="w-4 h-4 text-slate-400" />
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
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Real-time Parking Status</CardTitle>
                  <CardDescription>Overview of parking zones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.isArray(zones) && zones.map((zone) => {
                    const zoneOccupancy = (zone.occupied / zone.total) * 100;
                    return (
                      <div key={zone.id} className="space-y-2">
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
              <Card>
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

                  <div className="bg-slate-50 p-3 rounded-lg">
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
            <Card>
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
            <Analytics apiFetch={apiFetch} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
