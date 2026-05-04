// ─── IoTMonitoring.tsx ────────────────────────────────────────────────────────
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Wifi, WifiOff, Activity, AlertCircle, CheckCircle, RefreshCw, Settings, MapPin, Zap } from 'lucide-react';

type ApiFetch = (url: string, options?: RequestInit) => Promise<Response>;

export default function IoTMonitoring({ apiFetch }: { apiFetch: ApiFetch }) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [gateways, setGateways] = useState<any[]>([]);
  const [sensors, setSensors] = useState<any[]>([]);
  const [signage, setSignage] = useState<any[]>([]);
  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchData = async () => {
      const [statusRes, sensorsRes, signageRes] = await Promise.all([
        apiFetch(`${API_BASE}/iot/status`),
        apiFetch(`${API_BASE}/iot/sensors`),
        apiFetch(`${API_BASE}/iot/signage`),
      ]);
      const status = await statusRes.json();
      const sensorsData = await sensorsRes.json();
      const signageData = await signageRes.json();
      setGateways(status.gateways || []);
      setSensors(sensorsData || []);
      setSignage(signageData || []);
    };
    fetchData();
    if (!autoRefresh) return;
    const timer = setInterval(fetchData, 10000);
    return () => clearInterval(timer);
  }, [autoRefresh]);

  const sensorStats = useMemo(() => {
    const total = sensors.length;
    const online = sensors.filter((s) => s.status === 'online').length;
    const offline = sensors.filter((s) => s.status === 'offline').length;
    const maintenance = sensors.filter((s) => s.status === 'maintenance').length;
    return { total, online, offline, maintenance };
  }, [sensors]);

  const toggleSensorStatus = async (sensor: any) => {
    const nextStatus = sensor.status === 'online' ? 'offline' : 'online';
    await apiFetch(`${API_BASE}/iot/events/slot-occupancy`, {
      method: 'POST',
      body: JSON.stringify({ sensorId: sensor.id, status: nextStatus }),
    });
    setSensors((prev) => prev.map((s) => (s.id === sensor.id ? { ...s, status: nextStatus, lastUpdate: 'just now' } : s)));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sensors', value: sensorStats.total, color: 'text-slate-900', sub: <Progress value={(sensorStats.online / (sensorStats.total || 1)) * 100} className="mt-2" /> },
          { label: 'Online', value: sensorStats.online, color: 'text-green-600', sub: <p className="text-xs text-slate-500 mt-1">{((sensorStats.online / (sensorStats.total || 1)) * 100).toFixed(1)}% operational</p> },
          { label: 'Offline', value: sensorStats.offline, color: 'text-red-600', sub: <p className="text-xs text-slate-500 mt-1">Requires attention</p> },
          { label: 'Maintenance', value: sensorStats.maintenance, color: 'text-yellow-600', sub: <p className="text-xs text-slate-500 mt-1">Scheduled</p> },
        ].map(({ label, value, color, sub }) => (
          <Card key={label}>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">{label}</CardTitle></CardHeader>
            <CardContent><div className={`text-2xl font-bold ${color}`}>{value}</div>{sub}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>IoT Gateways</CardTitle><CardDescription>Network infrastructure status</CardDescription></div>
            <div className="flex items-center gap-2">
              <Badge variant={autoRefresh ? 'secondary' : 'outline'} className="gap-1">
                <RefreshCw className={`w-3 h-3 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh: {autoRefresh ? 'On' : 'Off'}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setAutoRefresh(!autoRefresh)}><Settings className="w-4 h-4 mr-2" />Configure</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {gateways.map((gateway) => (
              <div key={gateway.id} className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${gateway.status === 'online' ? 'bg-green-100' : gateway.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'}`}>
                      {gateway.status === 'online' && <Wifi className="w-5 h-5 text-green-600" />}
                      {gateway.status === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                      {gateway.status === 'offline' && <WifiOff className="w-5 h-5 text-red-600" />}
                    </div>
                    <div><div className="text-sm font-semibold text-slate-900">{gateway.name}</div><div className="text-xs text-slate-500">{gateway.id} • {gateway.zone}</div></div>
                  </div>
                  <Badge variant={gateway.status === 'online' ? 'secondary' : 'outline'} className={gateway.status === 'online' ? 'bg-green-100 text-green-700' : gateway.status === 'warning' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-red-100 text-red-700 border-red-300'}>
                    {gateway.status.charAt(0).toUpperCase() + gateway.status.slice(1)}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><div className="text-xs text-slate-500 mb-1">Sensors</div><div className="text-sm font-medium text-slate-900">{gateway.sensorsOnline}/{gateway.sensors}</div></div>
                  <div><div className="text-xs text-slate-500 mb-1">Uptime</div><div className="text-sm font-medium text-slate-900">{gateway.uptime}</div></div>
                  <div><div className="text-xs text-slate-500 mb-1">Signal</div><div className="flex items-center gap-2"><Progress value={gateway.signalStrength} className="flex-1" /><span className="text-xs font-medium text-slate-700">{gateway.signalStrength}%</span></div></div>
                  <div><div className="text-xs text-slate-500 mb-1">Last Update</div><div className="text-sm font-medium text-slate-900">{gateway.lastUpdate}</div></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Sensor Status</CardTitle><CardDescription>Individual sensor monitoring</CardDescription></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  {['Sensor ID', 'Location', 'Status', 'Battery', 'Signal', 'Last Update', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sensors.map((sensor) => (
                  <tr key={sensor.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4"><div className="text-sm font-mono text-slate-700">{sensor.id}</div></td>
                    <td className="py-3 px-4"><div className="flex items-center gap-1 text-sm text-slate-700"><MapPin className="w-3 h-3 text-slate-400" />{sensor.zone} • {sensor.slot}</div></td>
                    <td className="py-3 px-4">
                      <Badge variant={sensor.status === 'online' ? 'secondary' : 'outline'} className={sensor.status === 'online' ? 'bg-green-100 text-green-700' : sensor.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-red-100 text-red-700 border-red-300'}>
                        {sensor.status === 'online' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {sensor.status === 'maintenance' && <Settings className="w-3 h-3 mr-1" />}
                        {sensor.status === 'offline' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4"><div className="flex items-center gap-2"><Progress value={sensor.battery} className="w-16" /><span className={`text-xs font-medium ${sensor.battery > 50 ? 'text-green-600' : sensor.battery > 20 ? 'text-yellow-600' : 'text-red-600'}`}>{sensor.battery}%</span></div></td>
                    <td className="py-3 px-4"><div className="flex items-center gap-2"><Progress value={sensor.signal} className="w-16" /><span className="text-xs text-slate-600">{sensor.signal}%</span></div></td>
                    <td className="py-3 px-4"><div className="text-sm text-slate-600">{sensor.lastUpdate}</div></td>
                    <td className="py-3 px-4 text-right"><Button variant="ghost" size="sm" onClick={() => toggleSensorStatus(sensor)}><Settings className="w-4 h-4" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Electronic Signage</CardTitle><CardDescription>Dynamic guidance display status</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {signage.map((sign) => (
              <div key={sign.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sign.status === 'online' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {sign.status === 'online' ? <Activity className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-900">{sign.location}</div>
                    <div className="text-xs text-slate-500 mb-1">{sign.id} • {sign.zone}</div>
                    <div className="text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded inline-block">{sign.message}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right"><div className="text-xs text-slate-500">Uptime</div><div className="text-sm font-medium text-slate-900">{sign.uptime}</div></div>
                  <Badge variant={sign.status === 'online' ? 'secondary' : 'destructive'} className={sign.status === 'online' ? 'bg-green-100 text-green-700' : ''}>
                    {sign.status.charAt(0).toUpperCase() + sign.status.slice(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>System Health</CardTitle><CardDescription>IoT infrastructure monitoring</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg"><div className="flex items-center gap-2 mb-2"><Zap className="w-4 h-4 text-green-600" /><span className="text-sm font-medium text-green-900">Data Throughput</span></div><div className="text-xs text-green-700">Real-time data processing: 487 sensors • Avg latency: 0.8s</div></div>
            <div className="p-4 bg-blue-50 rounded-lg"><div className="flex items-center gap-2 mb-2"><Activity className="w-4 h-4 text-blue-600" /><span className="text-sm font-medium text-blue-900">Network Health</span></div><div className="text-xs text-blue-700">All gateways operational • 98.7% average uptime</div></div>
            <div className="p-4 bg-yellow-50 rounded-lg"><div className="flex items-center gap-2 mb-2"><AlertCircle className="w-4 h-4 text-yellow-600" /><span className="text-sm font-medium text-yellow-900">Maintenance Queue</span></div><div className="text-xs text-yellow-700">5 sensors scheduled • 8 offline requiring attention</div></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
