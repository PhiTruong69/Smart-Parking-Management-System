import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import {
  Wifi,
  WifiOff,
  Activity,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Settings,
  MapPin,
  Zap
} from 'lucide-react';

export default function IoTMonitoring() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const sensorStats = {
    total: 500,
    online: 487,
    offline: 8,
    maintenance: 5
  };

  const gateways = [
    {
      id: 'GW-001',
      name: 'Gateway Zone A',
      zone: 'Zone A',
      status: 'online',
      sensors: 150,
      sensorsOnline: 148,
      uptime: '99.8%',
      lastUpdate: '2 sec ago',
      signalStrength: 95
    },
    {
      id: 'GW-002',
      name: 'Gateway Zone B',
      zone: 'Zone B',
      status: 'online',
      sensors: 120,
      sensorsOnline: 118,
      uptime: '99.5%',
      lastUpdate: '3 sec ago',
      signalStrength: 92
    },
    {
      id: 'GW-003',
      name: 'Gateway Zone C',
      zone: 'Zone C',
      status: 'online',
      sensors: 100,
      sensorsOnline: 99,
      uptime: '99.9%',
      lastUpdate: '1 sec ago',
      signalStrength: 98
    },
    {
      id: 'GW-004',
      name: 'Gateway Zone D',
      zone: 'Zone D',
      status: 'online',
      sensors: 80,
      sensorsOnline: 78,
      uptime: '98.7%',
      lastUpdate: '4 sec ago',
      signalStrength: 88
    },
    {
      id: 'GW-005',
      name: 'Gateway Zone E',
      zone: 'Zone E',
      status: 'warning',
      sensors: 50,
      sensorsOnline: 44,
      uptime: '95.2%',
      lastUpdate: '15 sec ago',
      signalStrength: 65
    }
  ];

  const sensors = [
    { id: 'S-A-001', zone: 'Zone A', slot: 'A-1', status: 'online', battery: 85, signal: 92, lastUpdate: '2 sec ago' },
    { id: 'S-A-023', zone: 'Zone A', slot: 'A-23', status: 'offline', battery: 0, signal: 0, lastUpdate: '2 hours ago' },
    { id: 'S-B-015', zone: 'Zone B', slot: 'B-15', status: 'online', battery: 92, signal: 88, lastUpdate: '3 sec ago' },
    { id: 'S-B-023', zone: 'Zone B', slot: 'B-23', status: 'online', battery: 78, signal: 85, lastUpdate: '1 sec ago' },
    { id: 'S-C-042', zone: 'Zone C', slot: 'C-42', status: 'online', battery: 95, signal: 96, lastUpdate: '2 sec ago' },
    { id: 'S-D-008', zone: 'Zone D', slot: 'D-8', status: 'maintenance', battery: 45, signal: 0, lastUpdate: '1 day ago' },
    { id: 'S-E-003', zone: 'Zone E', slot: 'E-3', status: 'online', battery: 88, signal: 72, lastUpdate: '5 sec ago' },
    { id: 'S-A-089', zone: 'Zone A', slot: 'A-89', status: 'offline', battery: 12, signal: 0, lastUpdate: '6 hours ago' }
  ];

  const signage = [
    { id: 'SIGN-001', location: 'Main Entrance', zone: 'All', status: 'online', message: 'Zone A: Full • Zone B: Available', uptime: '99.9%' },
    { id: 'SIGN-002', location: 'Zone A Entrance', zone: 'Zone A', status: 'online', message: 'Nearly Full - 2 spaces', uptime: '99.7%' },
    { id: 'SIGN-003', location: 'Zone B Entrance', zone: 'Zone B', status: 'online', message: 'Available - 35 spaces', uptime: '99.8%' },
    { id: 'SIGN-004', location: 'Junction 1', zone: 'All', status: 'online', message: 'Zone C: Available • Zone D: Available', uptime: '99.5%' },
    { id: 'SIGN-005', location: 'Visitor Entrance', zone: 'Zone E', status: 'offline', message: 'N/A', uptime: '92.3%' }
  ];

  return (
    <div className="space-y-4">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Total Sensors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{sensorStats.total}</div>
            <Progress value={(sensorStats.online / sensorStats.total) * 100} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Online</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{sensorStats.online}</div>
            <p className="text-xs text-slate-500 mt-1">
              {((sensorStats.online / sensorStats.total) * 100).toFixed(1)}% operational
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Offline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{sensorStats.offline}</div>
            <p className="text-xs text-slate-500 mt-1">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{sensorStats.maintenance}</div>
            <p className="text-xs text-slate-500 mt-1">Scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* IoT Gateways */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>IoT Gateways</CardTitle>
              <CardDescription>Network infrastructure status</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={autoRefresh ? 'secondary' : 'outline'} className="gap-1">
                <RefreshCw className={`w-3 h-3 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh: {autoRefresh ? 'On' : 'Off'}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {gateways.map((gateway) => (
              <div
                key={gateway.id}
                className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      gateway.status === 'online' ? 'bg-green-100' :
                      gateway.status === 'warning' ? 'bg-yellow-100' :
                      'bg-red-100'
                    }`}>
                      {gateway.status === 'online' && <Wifi className="w-5 h-5 text-green-600" />}
                      {gateway.status === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                      {gateway.status === 'offline' && <WifiOff className="w-5 h-5 text-red-600" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{gateway.name}</div>
                      <div className="text-xs text-slate-500">{gateway.id} • {gateway.zone}</div>
                    </div>
                  </div>
                  <Badge
                    variant={gateway.status === 'online' ? 'secondary' : 'outline'}
                    className={
                      gateway.status === 'online' ? 'bg-green-100 text-green-700' :
                      gateway.status === 'warning' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                      'bg-red-100 text-red-700 border-red-300'
                    }
                  >
                    {gateway.status.charAt(0).toUpperCase() + gateway.status.slice(1)}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Sensors</div>
                    <div className="text-sm font-medium text-slate-900">
                      {gateway.sensorsOnline}/{gateway.sensors}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Uptime</div>
                    <div className="text-sm font-medium text-slate-900">{gateway.uptime}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Signal</div>
                    <div className="flex items-center gap-2">
                      <Progress value={gateway.signalStrength} className="flex-1" />
                      <span className="text-xs font-medium text-slate-700">{gateway.signalStrength}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Last Update</div>
                    <div className="text-sm font-medium text-slate-900">{gateway.lastUpdate}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sensor Details */}
      <Card>
        <CardHeader>
          <CardTitle>Sensor Status</CardTitle>
          <CardDescription>Individual sensor monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Sensor ID
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Location
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Battery
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Signal
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Last Update
                  </th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sensors.map((sensor) => (
                  <tr
                    key={sensor.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="text-sm font-mono text-slate-700">{sensor.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-sm text-slate-700">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {sensor.zone} • {sensor.slot}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={sensor.status === 'online' ? 'secondary' : 'outline'}
                        className={
                          sensor.status === 'online' ? 'bg-green-100 text-green-700' :
                          sensor.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                          'bg-red-100 text-red-700 border-red-300'
                        }
                      >
                        {sensor.status === 'online' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {sensor.status === 'maintenance' && <Settings className="w-3 h-3 mr-1" />}
                        {sensor.status === 'offline' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Progress value={sensor.battery} className="w-16" />
                        <span className={`text-xs font-medium ${
                          sensor.battery > 50 ? 'text-green-600' :
                          sensor.battery > 20 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {sensor.battery}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Progress value={sensor.signal} className="w-16" />
                        <span className="text-xs text-slate-600">{sensor.signal}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-slate-600">{sensor.lastUpdate}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Electronic Signage */}
      <Card>
        <CardHeader>
          <CardTitle>Electronic Signage</CardTitle>
          <CardDescription>Dynamic guidance display status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {signage.map((sign) => (
              <div
                key={sign.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    sign.status === 'online' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {sign.status === 'online' ? (
                      <Activity className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-900">{sign.location}</div>
                    <div className="text-xs text-slate-500 mb-1">{sign.id} • {sign.zone}</div>
                    <div className="text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded inline-block">
                      {sign.message}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Uptime</div>
                    <div className="text-sm font-medium text-slate-900">{sign.uptime}</div>
                  </div>
                  <Badge
                    variant={sign.status === 'online' ? 'secondary' : 'destructive'}
                    className={sign.status === 'online' ? 'bg-green-100 text-green-700' : ''}
                  >
                    {sign.status.charAt(0).toUpperCase() + sign.status.slice(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>IoT infrastructure monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Data Throughput</span>
              </div>
              <div className="text-xs text-green-700">
                Real-time data processing: 487 sensors • Avg latency: 0.8s
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Network Health</span>
              </div>
              <div className="text-xs text-blue-700">
                All gateways operational • 98.7% average uptime
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Maintenance Queue</span>
              </div>
              <div className="text-xs text-yellow-700">
                5 sensors scheduled • 8 offline requiring attention
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
