import { useState } from 'react';
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

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data for dashboard statistics
  const stats = {
    totalSpaces: 500,
    occupied: 342,
    available: 158,
    revenue: 125000,
    activeUsers: 1234,
    sensors: 500,
    sensorsOnline: 487
  };

  const occupancyRate = (stats.occupied / stats.totalSpaces) * 100;

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
                  <div className="text-2xl font-bold text-slate-900">{stats.totalSpaces}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {stats.available} Available
                    </Badge>
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      {stats.occupied} Occupied
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
                    Monthly Revenue
                  </CardTitle>
                  <DollarSign className="w-4 h-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    ₫{stats.revenue.toLocaleString()}
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
                  <div className="text-2xl font-bold text-slate-900">{stats.activeUsers}</div>
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
                  {[
                    { zone: 'Zone A - Main Building', total: 150, occupied: 142, status: 'full' },
                    { zone: 'Zone B - Engineering', total: 120, occupied: 85, status: 'available' },
                    { zone: 'Zone C - Library', total: 100, occupied: 63, status: 'available' },
                    { zone: 'Zone D - Sports Center', total: 80, occupied: 35, status: 'available' },
                    { zone: 'Zone E - Visitor', total: 50, occupied: 17, status: 'available' }
                  ].map((zone) => {
                    const zoneOccupancy = (zone.occupied / zone.total) * 100;
                    return (
                      <div key={zone.zone} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">{zone.zone}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">
                              {zone.occupied}/{zone.total}
                            </span>
                            <Badge
                              variant={zone.status === 'full' ? 'destructive' : 'secondary'}
                              className={zone.status === 'full' ? '' : 'bg-green-100 text-green-700'}
                            >
                              {zone.status === 'full' ? 'Full' : 'Available'}
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
                        {stats.sensorsOnline}/{stats.sensors}
                      </Badge>
                    </div>
                    <Progress value={(stats.sensorsOnline / stats.sensors) * 100} />
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
                  {[
                    {
                      time: '2 min ago',
                      user: 'Nguyen Van A (Student)',
                      action: 'Entered',
                      zone: 'Zone B',
                      type: 'entry'
                    },
                    {
                      time: '5 min ago',
                      user: 'Tran Thi B (Faculty)',
                      action: 'Exited',
                      zone: 'Zone A',
                      type: 'exit'
                    },
                    {
                      time: '8 min ago',
                      user: 'Visitor #2341',
                      action: 'Ticket Issued',
                      zone: 'Zone E',
                      type: 'ticket'
                    },
                    {
                      time: '12 min ago',
                      user: 'Le Van C (Student)',
                      action: 'Payment Processed',
                      zone: 'BKPay',
                      type: 'payment'
                    },
                    {
                      time: '15 min ago',
                      user: 'System',
                      action: 'Sensor B-23 reconnected',
                      zone: 'Zone B',
                      type: 'system'
                    }
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-0">
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
                      <span className="text-xs text-slate-400 flex-shrink-0">{activity.time}</span>
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

          {/* Users Tab */}
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <BillingPanel />
          </TabsContent>

          {/* IoT Monitoring Tab */}
          <TabsContent value="iot">
            <IoTMonitoring />
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="activity">
            <ActivityLogs />
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
