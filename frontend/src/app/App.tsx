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
  const API_BASE = 'http://localhost:5000/api';
  const isAdmin = auth?.user?.role === 'Admin';
  const actorRole = auth?.actorRole || 'END_USER';

  useEffect(() => {
    const fetchDashboard = async () => {
      const [summaryRes, zonesRes, iotRes, logsRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard/summary`),
        fetch(`${API_BASE}/parking/zones`),
        fetch(`${API_BASE}/iot/status`),
        fetch(`${API_BASE}/activity-logs`)
      ]);
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
        sensorsOnline: iot.online ?? null
      });
      setZones(zonesData || []);
      setRecentLogs((logs.items || []).slice(0, 5));
    };
    fetchDashboard();
    const timer = setInterval(fetchDashboard, 10000);
    return () => clearInterval(timer);
  }, []);

  const occupancyRate = (stats.totalSpaces && stats.occupied) ? (stats.occupied / stats.totalSpaces) * 100 : 0;

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
      setAuthError('Register thành công, vui lòng đăng nhập.');
      return;
    }
    setAuth(data);
    localStorage.setItem('spms-auth', JSON.stringify(data));
  };

  const logout = async () => {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    setAuth(null);
    localStorage.removeItem('spms-auth');
  };

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{authMode === 'login' ? 'Đăng nhập hệ thống' : 'Đăng ký tài khoản'}</CardTitle>
            <CardDescription>Admin demo: `admin` / `admin123`; User demo: `1952001` / `123456`</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Mã số / Username" value={authForm.studentId} onChange={(e) => setAuthForm((p) => ({ ...p, studentId: e.target.value }))} />
            <Input placeholder="Mật khẩu" type="password" value={authForm.password} onChange={(e) => setAuthForm((p) => ({ ...p, password: e.target.value }))} />
            {authMode === 'register' && (
              <>
                <Input placeholder="Họ tên" value={authForm.name} onChange={(e) => setAuthForm((p) => ({ ...p, name: e.target.value }))} />
                <Input placeholder="Chương trình / Đơn vị" value={authForm.program} onChange={(e) => setAuthForm((p) => ({ ...p, program: e.target.value }))} />
              </>
            )}
            {authError && <div className="text-sm text-red-600">{authError}</div>}
            <Button onClick={handleAuth} className="w-full">{authMode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</Button>
            <Button variant="ghost" className="w-full" onClick={() => setAuthMode((m) => (m === 'login' ? 'register' : 'login'))}>
              {authMode === 'login' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                System Online
              </Badge>
              <Badge variant="secondary">{auth.user.role}</Badge>
              <Button variant="outline" onClick={logout}>Đăng xuất</Button>
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
          <TabsList className="bg-white border border-slate-200 p-1">
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="parking" className="gap-2">
              <MapPin className="w-4 h-4" />
              Parking Map
            </TabsTrigger>
            <TabsTrigger value="simulation" className="gap-2">
              <Car className="w-4 h-4" />
              Simulation
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="iot" className="gap-2">
              <Wifi className="w-4 h-4" />
              IoT Sensors
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="w-4 h-4" />
              Activity Logs
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total Parking Spaces
                  </CardTitle>
                  <Car className="w-4 h-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stats.totalSpaces ?? '-'}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {stats.available ?? '-'} Available
                    </Badge>
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      {stats.occupied ?? '-'} Occupied
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Occupancy Rate
                  </CardTitle>
                  <Activity className="w-4 h-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{occupancyRate.toFixed(1)}%</div>
                  <Progress value={occupancyRate} className="mt-2" />
                  <p className="text-xs text-slate-500 mt-2">Nearly Full - Consider guidance</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Daily Revenue
                  </CardTitle>
                  <DollarSign className="w-4 h-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {stats.revenue != null ? `₫${(stats.revenue as number).toLocaleString()}` : '-'}
                  </div>
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Active Users
                  </CardTitle>
                  <Users className="w-4 h-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">{stats.activeUsers ?? '-'}</div>
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
                  {zones.map((zone) => {
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
                              {zone.state === 'full' ? 'Full' : zone.state === 'nearly_full' ? 'Nearly Full' : 'Available'}
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
                    <Progress value={stats.sensors && stats.sensorsOnline ? (stats.sensorsOnline / stats.sensors) * 100 : 0} />
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
                    <div key={activity.id || idx} className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-0">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'entry' ? 'bg-green-100' :
                          activity.type === 'exit' ? 'bg-blue-100' :
                          activity.type === 'ticket' ? 'bg-purple-100' :
                          activity.type === 'payment' ? 'bg-yellow-100' :
                          'bg-slate-100'
                        }`}>
                          {activity.type === 'entry' && <Car className="w-4 h-4 text-green-600" />}
                          {activity.type === 'exit' && <Car className="w-4 h-4 text-blue-600" />}
                          {activity.type === 'ticket' && <Clock className="w-4 h-4 text-purple-600" />}
                          {activity.type === 'payment' && <CreditCard className="w-4 h-4 text-yellow-600" />}
                          {activity.type === 'system' && <Activity className="w-4 h-4 text-slate-600" />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{activity.user}</p>
                        <p className="text-xs text-slate-500">{activity.action} • {activity.zone}</p>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">{activity.timestamp}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parking Map Tab */}
          <TabsContent value="parking">
            <ParkingMap />
          </TabsContent>

          <TabsContent value="simulation">
            <TrafficSimulation actorRole={actorRole} />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <BillingPanel isAdmin={isAdmin} actorRole={actorRole} />
          </TabsContent>

          {/* IoT Monitoring Tab */}
          <TabsContent value="iot">
            <IoTMonitoring />
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="activity">
            <ActivityLogs isAdmin={isAdmin} actorRole={actorRole} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
