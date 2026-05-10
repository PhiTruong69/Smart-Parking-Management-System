import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

type ApiFetch = (url: string, options?: RequestInit) => Promise<Response>;
type Props = { actorRole: string; apiFetch: ApiFetch };

const GATES: Record<string, string[]> = {
  A: ['Gate A1', 'Gate A2'],
  B: ['Gate B1', 'Gate B2'],
  C: ['Gate C1'],
  D: ['Gate D1'],
  E: ['Gate E1'],
};

export default function TrafficSimulation({ actorRole, apiFetch }: Props) {
  const API_BASE = 'http://localhost:5000/api';
  const [zonesData, setZonesData] = useState<Record<string, any[]>>({});
  const [activeSessions, setActiveSessions] = useState<any[]>([]);

  // Entry form
  const [form, setForm] = useState({
    userId: '',          // <-- SSO field mới
    userName: '',
    userType: 'Student',
    zoneId: 'A',
    slotId: '',
    vehicleId: '',
    gate: 'Gate A1',
  });

  // Visitor ticket flow
  const [ticketNo, setTicketNo] = useState('');
  const [ticketExitResult, setTicketExitResult] = useState<any>(null);

  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error' | 'info'>('info');

  const showMsg = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage(text);
    setMsgType(type);
  };

  const refreshGlobalData = async () => {
    try {
      const [slotsRes, sessionsRes] = await Promise.all([
        apiFetch(`${API_BASE}/parking/slots/all`),
        apiFetch(`${API_BASE}/parking/sessions/active`),
      ]);
      if (slotsRes.ok) setZonesData(await slotsRes.json());
      if (sessionsRes.ok) setActiveSessions(await sessionsRes.json());
    } catch (err) {
      console.error('TrafficSimulation sync error:', err);
    }
  };

  useEffect(() => { refreshGlobalData(); }, []);

  const availableSlotsInZone = React.useMemo(() => {
    return (zonesData[form.zoneId] || []).filter((s) => s.status === 'available');
  }, [zonesData, form.zoneId]);

  useEffect(() => {
    if (availableSlotsInZone.length > 0 && !form.slotId) {
      setForm((p) => ({ ...p, slotId: availableSlotsInZone[0].id }));
    }
  }, [availableSlotsInZone]);

  // Khi đổi zone → reset slot + gate
  const handleZoneChange = (zoneId: string) => {
    setForm((p) => ({ ...p, zoneId, slotId: '', gate: GATES[zoneId]?.[0] || '' }));
  };

  // Khi đổi userType → nếu Visitor thì xóa userId
  const handleUserTypeChange = (userType: string) => {
    setForm((p) => ({ ...p, userType, userId: userType === 'Visitor' ? '' : p.userId }));
  };

  const handleEntry = async () => {
    if (!form.slotId || !form.vehicleId) {
      showMsg('Vui lòng điền đầy đủ biển số và chọn vị trí!', 'error');
      return;
    }
    // University Member phải có userId để qua SSO
    if (form.userType !== 'Visitor' && !form.userId) {
      showMsg('University Member phải nhập Mã số sinh viên / nhân viên để xác thực SSO.', 'error');
      return;
    }

    try {
      const body: any = {
        userType: form.userType,
        zoneId: form.zoneId,
        slotId: form.slotId,
        vehicleId: form.vehicleId,
        gate: form.gate,
      };
      // Chỉ gửi userId nếu là University Member
      if (form.userType !== 'Visitor') {
        body.userId = form.userId;
      } else {
        body.userName = form.userName || 'Visitor';
      }

      const res = await apiFetch(`${API_BASE}/parking/sessions/entry`, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        const authLabel = data.authMethod === 'SSO' ? '✓ SSO verified' : '✓ Ticket issued';
        showMsg(`Vào bãi thành công! Vị trí: ${form.slotId} | ${authLabel}`, 'success');
        setForm((p) => ({ ...p, vehicleId: '', userName: '', slotId: '', userId: '' }));
        await refreshGlobalData();
      } else {
        // SSO fail → hiển thị displayMessage từ BE
        const errMsg = data.displayMessage || data.message || 'Lỗi không xác định';
        showMsg(`Lỗi: ${errMsg}`, 'error');
      }
    } catch {
      showMsg('Không thể kết nối đến server.', 'error');
    }
  };

  const handleExit = async (sessionId: string) => {
    try {
      const res = await apiFetch(`${API_BASE}/parking/sessions/${sessionId}/exit`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showMsg(`Xe đã ra khỏi bãi. Phí: ₫${data.fee?.toLocaleString() || '0'}. Vị trí đã được giải phóng.`, 'success');
        await refreshGlobalData();
      } else {
        showMsg(`Lỗi: ${data.message}`, 'error');
      }
    } catch {
      showMsg('Không thể kết nối đến server.', 'error');
    }
  };

  // Visitor exit bằng ticketNo
  const handleTicketExit = async () => {
    if (!ticketNo.trim()) { showMsg('Vui lòng nhập mã vé.', 'error'); return; }
    try {
      const res = await apiFetch(`${API_BASE}/parking/tickets/${ticketNo.trim()}/exit`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setTicketExitResult(data.summary);
        showMsg(`Visitor exit thành công! Phí: ₫${data.summary.fee?.toLocaleString()}`, 'success');
        setTicketNo('');
        await refreshGlobalData();
      } else {
        showMsg(`Lỗi: ${data.message}`, 'error');
      }
    } catch {
      showMsg('Không thể kết nối đến server.', 'error');
    }
  };

  const msgColors = {
    success: 'text-green-700 bg-green-50 border-green-200',
    error: 'text-red-700 bg-red-50 border-red-200',
    info: 'text-blue-700 bg-blue-50 border-blue-200',
  };

  return (
    <div className="space-y-4">
      {/* ── Entry Form ── */}
      <Card className="border-blue-300">
        <CardHeader>
          <CardTitle className="text-blue-700">Mô phỏng xe vào (Entry)</CardTitle>
          <CardDescription>
            University Member cần nhập Mã số để xác thực qua HCMUT_SSO. Visitor dùng vé tạm.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* User Type */}
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-medium">Loại người dùng</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.userType}
                onChange={(e) => handleUserTypeChange(e.target.value)}
              >
                {['Student', 'Graduate', 'Doctoral', 'Faculty', 'Staff', 'Visitor'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* userId — chỉ hiện khi không phải Visitor */}
            {form.userType !== 'Visitor' ? (
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-medium">
                  Mã số SV/NV <span className="text-red-500">*</span>
                  <span className="ml-1 text-slate-400">(dùng để xác thực SSO)</span>
                </label>
                <Input
                  placeholder="VD: 1952001, F2001, S1023"
                  value={form.userId}
                  onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value }))}
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-medium">Tên khách (tuỳ chọn)</label>
                <Input
                  placeholder="Khách vãng lai"
                  value={form.userName}
                  onChange={(e) => setForm((p) => ({ ...p, userName: e.target.value }))}
                />
              </div>
            )}

            {/* Biển số */}
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-medium">Biển số xe <span className="text-red-500">*</span></label>
              <Input
                placeholder="VD: 59A-12345"
                value={form.vehicleId}
                onChange={(e) => setForm((p) => ({ ...p, vehicleId: e.target.value }))}
              />
            </div>

            {/* Zone */}
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-medium">Khu vực</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm font-semibold"
                value={form.zoneId}
                onChange={(e) => handleZoneChange(e.target.value)}
              >
                {(Object.keys(zonesData).length > 0 ? Object.keys(zonesData) : ['A','B','C','D','E']).map((z) => (
                  <option key={z} value={z}>Khu vực {z}</option>
                ))}
              </select>
            </div>

            {/* Slot */}
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-medium">
                Vị trí trống ({availableSlotsInZone.length})
              </label>
              <select
                className="w-full border rounded px-3 py-2 text-sm bg-green-50 font-bold"
                value={form.slotId}
                onChange={(e) => setForm((p) => ({ ...p, slotId: e.target.value }))}
              >
                <option value="">-- Chọn vị trí --</option>
                {availableSlotsInZone.map((s) => (
                  <option key={s.id} value={s.id}>{s.id} (Trống)</option>
                ))}
              </select>
            </div>

            {/* Gate */}
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-medium">Cổng vào</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.gate}
                onChange={(e) => setForm((p) => ({ ...p, gate: e.target.value }))}
              >
                {(GATES[form.zoneId] || ['Gate A1']).map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleEntry}
            disabled={!form.slotId || !form.vehicleId}
          >
            Xác nhận xe vào bãi
          </Button>

          {message && (
            <p className={`text-sm font-medium p-2 rounded border ${msgColors[msgType]}`}>
              {message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Visitor Ticket Exit ── */}
      <Card className="border-purple-300">
        <CardHeader>
          <CardTitle className="text-purple-700">Visitor Exit (Vé tạm)</CardTitle>
          <CardDescription>Nhập mã vé tạm để tính phí và cho xe ra.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Mã vé: VD: TKT-abc12345"
              value={ticketNo}
              onChange={(e) => setTicketNo(e.target.value)}
              className="font-mono"
            />
            <Button onClick={handleTicketExit} className="bg-purple-600 hover:bg-purple-700 shrink-0">
              Cho xe ra
            </Button>
          </div>
          {ticketExitResult && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded text-sm space-y-1">
              <div className="font-semibold text-purple-800">Kết quả thanh toán</div>
              <div className="text-purple-700">Thời gian: {ticketExitResult.duration}</div>
              <div className="text-purple-700 font-bold">Phí: ₫{ticketExitResult.fee?.toLocaleString()}</div>
              <div className="text-xs text-purple-500 font-mono">TXN: {ticketExitResult.transactionId}</div>
              <div className="text-xs text-purple-500 break-all">{ticketExitResult.bkpayUrl}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Active Sessions ── */}
      <Card>
        <CardHeader>
          <CardTitle>Xe đang trong bãi</CardTitle>
          <CardDescription>Bấm "Cho xe ra" để giải phóng vị trí.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-72 overflow-auto space-y-2">
            {activeSessions.length === 0 ? (
              <p className="text-center text-slate-400 py-4 italic">Hiện không có xe nào trong bãi.</p>
            ) : (
              activeSessions.map((s) => (
                <div key={s.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-800">{s.vehicleId}</span>
                    <span className="text-xs text-slate-500">
                      {s.userType} | {s.gate} | Zone {s.zoneId}
                    </span>
                    <span className="text-xs">
                      <Badge
                        variant="secondary"
                        className={s.authMethod === 'SSO' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}
                      >
                        {s.authMethod === 'SSO' ? '🔐 SSO' : '🎫 Ticket'}
                      </Badge>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {s.slotId && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-mono">
                        {s.slotId}
                      </Badge>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => handleExit(s.id)}>
                      Cho xe ra
                    </Button>
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