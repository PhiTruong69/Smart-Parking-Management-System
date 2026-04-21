import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import React, { useEffect, useMemo, useState } from "react";
import { Car, Navigation, Maximize2 } from 'lucide-react';

export default function ParkingMap() {
  const [zones, setZones] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [entryForm, setEntryForm] = useState({ userId: '', zoneId: 'E', gate: 'Gate E1', vehicleId: '' });
  const [message, setMessage] = useState('');
  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchData = async () => {
      const [zonesRes, sessionsRes] = await Promise.all([
        fetch(`${API_BASE}/parking/zones`),
        fetch(`${API_BASE}/parking/sessions/active`)
      ]);
      const zonesData = await zonesRes.json();
      const sessionsData = await sessionsRes.json();
      setZones(zonesData || []);
      setActiveSessions(sessionsData || []);
    };
    fetchData();
    const timer = setInterval(fetchData, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleEntry = async () => {
    const res = await fetch(`${API_BASE}/parking/sessions/entry`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(entryForm),
    });
    const data = await res.json();
    setMessage(res.ok ? `Entry success: ${data.id}` : data.message || 'Entry failed');
  };

  const handleExit = async (sessionId: string) => {
    const res = await fetch(`${API_BASE}/parking/sessions/${sessionId}/exit`, { method: 'POST' });
    const data = await res.json();
    setMessage(res.ok ? `Exit success: ${sessionId}, fee ₫${(data.fee || 0).toLocaleString()}` : data.message || 'Exit failed');
  };

  const issueTicket = async () => {
    const res = await fetch(`${API_BASE}/parking/tickets/issue`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ zoneId: entryForm.zoneId, gate: entryForm.gate }),
    });
    const data = await res.json();
    setMessage(res.ok ? `Ticket issued: ${data.ticketNo}` : data.message || 'Issue ticket failed');
  };

  const zoneColors: Record<string, string> = {
    A: 'bg-blue-500',
    B: 'bg-green-500',
    C: 'bg-purple-500',
    D: 'bg-orange-500',
    E: 'bg-pink-500',
  };

  const parkingSpaces = useMemo(
    () =>
      zones.flatMap((zone) =>
        Array.from({ length: zone.total }, (_, i) => ({
          id: `${zone.id}-${i + 1}`,
          zone: zone.id,
          status: i < zone.occupied ? 'occupied' : 'available',
          x: zone.id === 'A' || zone.id === 'C' ? 50 + (i % 10) * 80 : zone.id === 'B' || zone.id === 'D' ? 900 + (i % 8) * 80 : 450 + (i % 5) * 80,
          y: zone.id === 'A' ? 50 + Math.floor(i / 10) * 60 : zone.id === 'B' ? 50 + Math.floor(i / 8) * 60 : zone.id === 'C' ? 300 + Math.floor(i / 10) * 60 : zone.id === 'D' ? 300 + Math.floor(i / 8) * 60 : 450,
        })),
      ),
    [zones],
  );

  return (
    <div className="space-y-4">
      {/* Zone Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {zones.map((zone) => (
          <Card key={zone.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${zoneColors[zone.id] || 'bg-slate-400'}`}></div>
                <CardTitle className="text-sm">Zone {zone.id}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {zone.total - zone.occupied}
              </div>
              <p className="text-xs text-slate-500">
                Available of {zone.total}
              </p>
              <Badge
                variant={zone.occupied / zone.total > 0.9 ? 'destructive' : 'secondary'}
                className={zone.occupied / zone.total > 0.9 ? '' : 'bg-green-100 text-green-700 mt-2'}
              >
                {zone.occupied / zone.total > 0.9 ? 'Nearly Full' : 'Available'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interactive Parking Map */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Campus Parking Map</CardTitle>
              <CardDescription>Real-time parking space availability</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Navigation className="w-4 h-4 mr-2" />
                Enable Guidance
              </Button>
              <Button variant="outline" size="sm">
                <Maximize2 className="w-4 h-4 mr-2" />
                Fullscreen
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex items-center gap-6 mb-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-slate-600">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-slate-600">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-slate-600">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-300 rounded"></div>
              <span className="text-sm text-slate-600">Maintenance</span>
            </div>
          </div>

          {/* SVG Map */}
          <div className="bg-slate-50 rounded-lg p-6 overflow-auto">
            <svg viewBox="0 0 1600 600" className="w-full h-auto">
              {/* Zone Labels */}
              <text x="250" y="30" className="text-sm font-semibold fill-blue-600">Zone A - Main Building</text>
              <text x="1100" y="30" className="text-sm font-semibold fill-green-600">Zone B - Engineering</text>
              <text x="250" y="280" className="text-sm font-semibold fill-purple-600">Zone C - Library</text>
              <text x="1100" y="280" className="text-sm font-semibold fill-orange-600">Zone D - Sports</text>
              <text x="550" y="430" className="text-sm font-semibold fill-pink-600">Zone E - Visitor</text>

              {/* Parking Spaces */}
              {parkingSpaces.map((space) => (
                <g key={space.id}>
                  <rect
                    x={space.x}
                    y={space.y}
                    width="70"
                    height="50"
                    rx="4"
                    className={`${
                      space.status === 'occupied'
                        ? 'fill-red-500'
                        : space.status === 'reserved'
                        ? 'fill-yellow-500'
                        : 'fill-green-500'
                    } stroke-white stroke-2 cursor-pointer hover:opacity-80 transition-opacity`}
                  />
                  <text
                    x={space.x + 35}
                    y={space.y + 30}
                    textAnchor="middle"
                    className="text-xs font-medium fill-white pointer-events-none"
                  >
                    {space.id}
                  </text>
                </g>
              ))}

              {/* Roads/Paths */}
              <path
                d="M 40 200 L 1560 200"
                className="stroke-slate-300 stroke-[8] fill-none"
                strokeDasharray="20,10"
              />
              <path
                d="M 800 40 L 800 560"
                className="stroke-slate-300 stroke-[8] fill-none"
                strokeDasharray="20,10"
              />
            </svg>
          </div>

          {/* Space Details */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="border rounded px-3 py-2 text-sm" placeholder="User ID (empty for visitor)" value={entryForm.userId} onChange={(e) => setEntryForm((p) => ({ ...p, userId: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm" placeholder="Vehicle ID / Plate" value={entryForm.vehicleId} onChange={(e) => setEntryForm((p) => ({ ...p, vehicleId: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm" placeholder="Zone ID (A-E)" value={entryForm.zoneId} onChange={(e) => setEntryForm((p) => ({ ...p, zoneId: e.target.value.toUpperCase() }))} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={handleEntry}>Record Entry</Button>
            <Button variant="outline" onClick={issueTicket}>Issue Visitor Ticket</Button>
          </div>
          {message && <p className="text-xs text-blue-700 mt-2">{message}</p>}

          <div className="mt-4 border rounded-lg p-3">
            <div className="text-sm font-semibold mb-2">Active Sessions</div>
            <div className="space-y-2">
              {activeSessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-b-0">
                  <span>{s.id} • Zone {s.zoneId} • {s.vehicleId}</span>
                  <Button size="sm" variant="outline" onClick={() => handleExit(s.id)}>Record Exit</Button>
                </div>
              ))}
              {!activeSessions.length && <div className="text-xs text-slate-500">No active sessions</div>}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Car className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Student Parking</span>
              </div>
              <p className="text-xs text-blue-700">
                ID card required. Billing cycle: Monthly
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Car className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Faculty/Staff</span>
              </div>
              <p className="text-xs text-green-700">
                Reserved spaces. Special rates apply
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Car className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Visitor Parking</span>
              </div>
              <p className="text-xs text-purple-700">
                Temporary tickets. Hourly rates
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
