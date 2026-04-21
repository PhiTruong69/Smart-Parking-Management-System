import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

type Props = {
  actorRole: string;
};

export default function TrafficSimulation({ actorRole }: Props) {
  const API_BASE = 'http://localhost:5000/api';
  const [zones, setZones] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [form, setForm] = useState({
    userName: '',
    userType: 'Student',
    zoneId: 'A',
    slotId: 'A-1',
    vehicleId: '',
    gate: 'Gate A1',
  });
  const [message, setMessage] = useState('');

  const loadData = async () => {
    const [zonesRes, sessionsRes] = await Promise.all([
      fetch(`${API_BASE}/parking/zones`),
      fetch(`${API_BASE}/parking/sessions/active`),
    ]);
    const zonesData = await zonesRes.json();
    const sessionsData = await sessionsRes.json();
    setZones(zonesData || []);
    setSessions(sessionsData || []);
  };

  const loadSlots = async (zoneId: string) => {
    const res = await fetch(`${API_BASE}/parking/slots/${zoneId}`);
    const data = await res.json();
    const available = (data.slots || []).filter((s: any) => !s.occupied);
    setSlots(available);
    if (available.length) setForm((p) => ({ ...p, slotId: available[0].slotId }));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadSlots(form.zoneId);
  }, [form.zoneId]);

  const addVehicle = async () => {
    const res = await fetch(`${API_BASE}/parking/sessions/entry`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        userName: form.userName,
        userType: form.userType,
        zoneId: form.zoneId,
        slotId: form.slotId,
        gate: form.gate,
        vehicleId: form.vehicleId,
        method: form.userType === 'Visitor' ? 'TICKET' : 'CARD',
      }),
    });
    const data = await res.json();
    setMessage(res.ok ? `Added ${form.userType} vehicle: ${data.id}` : data.message || 'Failed');
    await loadData();
    await loadSlots(form.zoneId);
  };

  const exitVehicle = async (sessionId: string) => {
    const customFeeRaw = window.prompt('Custom fee (admin only, optional):', '');
    const customFee = customFeeRaw ? Number(customFeeRaw) : undefined;
    const res = await fetch(`${API_BASE}/parking/sessions/${sessionId}/exit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-role': actorRole || 'END_USER' },
      body: JSON.stringify(Number.isNaN(customFee) ? {} : { customFee }),
    });
    const data = await res.json();
    setMessage(res.ok ? `Exit done for ${sessionId}, fee: ₫${(data.fee || 0).toLocaleString()}` : data.message || 'Failed');
    await loadData();
    await loadSlots(form.zoneId);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Flow Simulation</CardTitle>
          <CardDescription>Add learner/faculty/visitor vehicles, pick zone/slot, and simulate entry/exit.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="border rounded px-3 py-2 text-sm" placeholder="Name" value={form.userName} onChange={(e) => setForm((p) => ({ ...p, userName: e.target.value }))} />
            <select className="border rounded px-3 py-2 text-sm" value={form.userType} onChange={(e) => setForm((p) => ({ ...p, userType: e.target.value }))}>
              <option>Student</option>
              <option>Graduate</option>
              <option>Doctoral</option>
              <option>Faculty</option>
              <option>Staff</option>
              <option>Visitor</option>
            </select>
            <input className="border rounded px-3 py-2 text-sm" placeholder="Vehicle Plate" value={form.vehicleId} onChange={(e) => setForm((p) => ({ ...p, vehicleId: e.target.value }))} />
            <select className="border rounded px-3 py-2 text-sm" value={form.zoneId} onChange={(e) => setForm((p) => ({ ...p, zoneId: e.target.value }))}>
              {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
            <select className="border rounded px-3 py-2 text-sm" value={form.slotId} onChange={(e) => setForm((p) => ({ ...p, slotId: e.target.value }))}>
              {slots.map((s) => <option key={s.slotId} value={s.slotId}>{s.slotId}</option>)}
            </select>
            <input className="border rounded px-3 py-2 text-sm" placeholder="Gate" value={form.gate} onChange={(e) => setForm((p) => ({ ...p, gate: e.target.value }))} />
          </div>
          <div className="mt-3">
            <Button onClick={addVehicle}>Add Vehicle Entry</Button>
          </div>
          {message && <div className="text-sm text-blue-700 mt-2">{message}</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between border rounded p-2 text-sm">
                <span>{s.id} • {s.userName || s.userId} • Zone {s.zoneId} • {s.slotId || 'N/A'} • {s.vehicleId}</span>
                <Button size="sm" variant="outline" onClick={() => exitVehicle(s.id)}>Exit</Button>
              </div>
            ))}
            {!sessions.length && <div className="text-xs text-slate-500">No active vehicles</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
