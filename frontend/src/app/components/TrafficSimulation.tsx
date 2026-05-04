import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

type ApiFetch = (url: string, options?: RequestInit) => Promise<Response>;
type Props = { actorRole: string; apiFetch: ApiFetch };

export default function TrafficSimulation({ actorRole, apiFetch }: Props) {
  const API_BASE = 'http://localhost:5000/api';
  const [zonesData, setZonesData] = useState<Record<string, any[]>>({});
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [form, setForm] = useState({ userName: '', userType: 'Student', zoneId: 'A', slotId: '', vehicleId: '', gate: 'Gate A1' });
  const [message, setMessage] = useState('');

  const refreshGlobalData = async () => {
    try {
      const [slotsRes, sessionsRes] = await Promise.all([
        apiFetch(`${API_BASE}/parking/slots/all`),
        apiFetch(`${API_BASE}/parking/sessions/active`),
      ]);
      if (slotsRes.ok) setZonesData(await slotsRes.json());
      if (sessionsRes.ok) setActiveSessions(await sessionsRes.json());
    } catch (err) { console.error('TrafficSimulation sync error:', err); }
  };

  useEffect(() => { refreshGlobalData(); }, []);

  const availableSlotsInZone = React.useMemo(() => {
    const slots = zonesData[form.zoneId] || [];
    return slots.filter((slot) => slot.status === 'available');
  }, [zonesData, form.zoneId]);

  useEffect(() => {
    if (availableSlotsInZone.length > 0 && !form.slotId) {
      setForm((p) => ({ ...p, slotId: availableSlotsInZone[0].id }));
    }
  }, [availableSlotsInZone]);

  const handleEntry = async () => {
    if (!form.slotId || !form.vehicleId) { setMessage('Vui lòng điền đầy đủ biển số và chọn vị trí!'); return; }
    try {
      const res = await apiFetch(`${API_BASE}/parking/sessions/entry`, {
        method: 'POST',
        body: JSON.stringify({ userName: form.userName || 'Guest', userType: form.userType, zoneId: form.zoneId, slotId: form.slotId, vehicleId: form.vehicleId, gate: form.gate }),
      });
      if (res.ok) {
        setMessage(`Thành công: Vị trí ${form.slotId} đã được chiếm dụng.`);
        setForm((p) => ({ ...p, vehicleId: '', userName: '', slotId: '' }));
        await refreshGlobalData();
      } else {
        const error = await res.json();
        setMessage(`Lỗi: ${error.message}`);
      }
    } catch { setMessage('Không thể kết nối đến server.'); }
  };

  const handleExit = async (sessionId: string) => {
    try {
      const res = await apiFetch(`${API_BASE}/parking/sessions/${sessionId}/exit`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setMessage(`Xe đã ra khỏi bãi. Phí: ₫${data.fee?.toLocaleString() || '0'}. Vị trí đã được giải phóng.`);
        await refreshGlobalData();
      } else {
        const error = await res.json();
        setMessage(`Lỗi: ${error.message}`);
      }
    } catch { setMessage('Không thể kết nối đến server.'); }
  };

  return (
    <div className="space-y-4">
      <Card className="border-blue-500 shadow-md">
        <CardHeader>
          <CardTitle className="text-blue-700">Mô phỏng xe vào (Entry Logic)</CardTitle>
          <CardDescription>Dữ liệu này sẽ được đồng bộ trực tiếp lên sơ đồ bãi xe.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="border rounded px-3 py-2 text-sm" placeholder="Tên người dùng" value={form.userName} onChange={(e) => setForm((p) => ({ ...p, userName: e.target.value }))} />
            <select className="border rounded px-3 py-2 text-sm" value={form.userType} onChange={(e) => setForm((p) => ({ ...p, userType: e.target.value }))}>
              {['Student', 'Faculty', 'Staff', 'Visitor'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input className="border rounded px-3 py-2 text-sm" placeholder="Biển số xe" value={form.vehicleId} onChange={(e) => setForm((p) => ({ ...p, vehicleId: e.target.value }))} />
            <select className="border rounded px-3 py-2 text-sm font-semibold" value={form.zoneId} onChange={(e) => setForm((p) => ({ ...p, zoneId: e.target.value, slotId: '' }))}>
              {(Object.keys(zonesData).length > 0 ? Object.keys(zonesData) : ['A', 'B', 'C', 'D', 'E']).map((z) => <option key={z} value={z}>Khu vực {z}</option>)}
            </select>
            <select className="border rounded px-3 py-2 text-sm bg-green-50 font-bold" value={form.slotId} onChange={(e) => setForm((p) => ({ ...p, slotId: e.target.value }))}>
              <option value="">-- Chọn vị trí trống ({availableSlotsInZone.length}) --</option>
              {availableSlotsInZone.map((s) => <option key={s.id} value={s.id}>{s.id} (Trống)</option>)}
            </select>
            <input className="border rounded px-3 py-2 text-sm" placeholder="Cổng vào" value={form.gate} onChange={(e) => setForm((p) => ({ ...p, gate: e.target.value }))} />
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleEntry} disabled={!form.slotId || !form.vehicleId}>
            Xác nhận xe vào bãi
          </Button>
          {message && <p className="text-sm font-medium text-blue-600 bg-blue-50 p-2 rounded border border-blue-100">{message}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Danh sách xe đang trong bãi</CardTitle><CardDescription>Bấm "Cho xe ra" để giải phóng vị trí trên bản đồ.</CardDescription></CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-auto space-y-2">
            {activeSessions.length === 0 ? (
              <p className="text-center text-slate-400 py-4 italic">Hiện không có xe nào trong bãi.</p>
            ) : (
              activeSessions.map((s) => (
                <div key={s.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col"><span className="font-bold text-slate-800">{s.vehicleId}</span><span className="text-xs text-slate-500">{s.userType} | Gate: {s.gate}</span></div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-mono">{s.slotId}</Badge>
                    <Button size="sm" variant="destructive" onClick={() => handleExit(s.id)}>Cho xe ra</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
