import React, { useEffect, useMemo, useState } from 'react';
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
  const [gateways, setGateways] = useState<any[]>([]);
  const [sensors, setSensors] = useState<any[]>([]);
  const [signage, setSignage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_BASE = 'http://localhost:5000/api';

  // Mock signage data
  const defaultSignage = [
    { id: "SIGN-001", location: "Main Entrance", zone: "All", status: "online", message: "Zone A: Full • Zone B: Available", uptime: "99.9%" },
    { id: "SIGN-005", location: "Visitor Entrance", zone: "E", status: "online", message: "Zone E: 6 Spaces Available", uptime: "98.5%" },
  ];

  const fetchData = async () => {
    try {
      setError(null);
      
      const createFallbackResponse = (data: any) => ({
        ok: false,
        json: async () => data,
      });

      const [statusRes, sensorsRes, signageRes] = await Promise.all([
        fetch(`${API_BASE}/iot/status`).catch(() => createFallbackResponse({ gateways: [] })),
        fetch(`${API_BASE}/iot/sensors`).catch(() => createFallbackResponse([])),
        fetch(`${API_BASE}/iot/signage`).catch(() => createFallbackResponse(defaultSignage)),
      ]);

      let status: any[] = [];
      let sensorsData: any[] = [];
      let signageData = defaultSignage;

      if (statusRes.ok) {
        const data = await statusRes.json();
        status = data.gateways || [];
      }

      if (sensorsRes.ok) {
        sensorsData = await sensorsRes.json();
        if (Array.isArray(sensorsData)) {
          // sensorsData is array
        } else {
          // sensorsData might be object, convert to array
          sensorsData = [];
        }
      }

      if (signageRes.ok) {
        const data = await signageRes.json();
        signageData = Array.isArray(data) ? data : defaultSignage;
      }

      setGateways(status);
      setSensors(sensorsData || []);
      setSignage(signageData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching IoT data:", err);
      setError("Failed to load IoT data. Using default data.");
      setGateways([]);
      setSensors([]);
      setSignage(defaultSignage);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (!autoRefresh) return;
    const timer = setInterval(fetchData, 3000); // Refresh every 3 seconds for real-time updates
    return () => clearInterval(timer);
  }, [autoRefresh]);

  const sensorStats = useMemo(() => {
    const total = sensors.length;
    const online = sensors.filter((s) => s.status === 'online' && !s.disabled).length;
    const occupied = sensors.filter((s) => s.occupied && !s.disabled).length;
    const maintenance = sensors.filter((s) => s.disabled).length;
    return { total, online, occupied, maintenance };
  }, [sensors]);

  const toggleSensorStatus = async (sensor: any) => {
    try {
      const response = await fetch(`${API_BASE}/iot/sensors/${sensor.id}/toggle`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ disable: sensor.status === 'online' }),
      });

      if (!response.ok) throw new Error('Failed to toggle sensor');

      // Update UI immediately
      setSensors((prev) =>
        prev.map((s) =>
          s.id === sensor.id
            ? {
                ...s,
                status: sensor.status === 'online' ? 'offline' : 'online',
                battery: sensor.status === 'online' ? 0 : 85,
                signal: sensor.status === 'online' ? 0 : 85,
                lastUpdate: 'just now',
                disabled: sensor.status === 'online',
              }
            : s
        )
      );

      // Update gateway info immediately
      setGateways((prev) =>
        prev.map((gateway) => {
          const sensorZone = sensor.zone;
          if (gateway.zone === sensorZone) {
            const newSensorsOnline = gateway.sensorsOnline + (sensor.status === 'online' ? -1 : 1);
            return {
              ...gateway,
              sensorsOnline: newSensorsOnline,
              status: newSensorsOnline > 0 ? 'online' : 'offline',
            };
          }
          return gateway;
        })
      );
    } catch (err) {
      console.error('Error toggling sensor:', err);
      alert('Failed to toggle sensor status');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Loading IoT data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Total Sensors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{sensorStats.total}</div>
            <Progress value={sensorStats.total > 0 ? (sensorStats.online / sensorStats.total) * 100 : 0} className="mt-2" />
          </CardContent>
        </Card>
       <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Online</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{sensorStats.online}</div>
            <p className="text-xs text-slate-500 mt-1">
              {sensorStats.total > 0 ? ((sensorStats.online / sensorStats.total) * 100).toFixed(1) : 0}% operational
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Occupied / In Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{sensorStats.occupied}</div>
            <p className="text-xs text-slate-500 mt-1">Spaces in use</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{sensorStats.maintenance}</div>
            <p className="text-xs text-slate-500 mt-1">Broken / Disabled</p>
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
          {gateways.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No gateway data available. Using default configuration.</p>
          ) : (
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
          )}
        </CardContent>
      </Card>

      {/* Sensor Details */}
      <Card>
        <CardHeader>
          <CardTitle>Sensor Status</CardTitle>
          <CardDescription>Individual sensor monitoring - Click "Settings" to toggle sensor status</CardDescription>
        </CardHeader>
        <CardContent>
          {sensors.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No sensor data available. Please start the backend server.</p>
          ) : (
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
                          <Progress value={Math.max(0, sensor.battery)} className="w-16" />
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
                          <Progress value={Math.max(0, sensor.signal)} className="w-16" />
                          <span className="text-xs text-slate-600">{sensor.signal}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-slate-600">{sensor.lastUpdate}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => toggleSensorStatus(sensor)}>
                          <Settings className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                Real-time data processing: {sensorStats.total} sensors • Avg latency: 0.8s
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Network Health</span>
              </div>
              <div className="text-xs text-blue-700">
                {gateways.length > 0 ? `${gateways.length} gateways operational` : "Gateway status: OK"} • 98.7% average uptime
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Alerts</span>
              </div>
              <div className="text-xs text-yellow-700">
                Maintenance/Broken sensors: {sensorStats.maintenance}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

