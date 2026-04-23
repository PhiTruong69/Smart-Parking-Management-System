import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

type Props = {
  actorRole: string;
};

export default function TrafficSimulation({ actorRole }: Props) {
  const API_BASE = 'http://localhost:5000/api';
  
  // State quản lý danh sách Zone và Slot thực tế từ Server
  const [zonesData, setZonesData] = useState<Record<string, any[]>>({});
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  
  const [form, setForm] = useState({
    userName: '',
    userType: 'Student',
    zoneId: 'A',
    slotId: '',
    vehicleId: '',
    gate: 'Gate A1',
  });
  
  const [message, setMessage] = useState('');

  // 1. Hàm tải dữ liệu tổng thể (Đồng bộ với cấu trúc của ParkingMap)
  const refreshGlobalData = async () => {
  try {
    const [slotsRes, sessionsRes] = await Promise.all([
      fetch(`${API_BASE}/parking/slots/all`),
      fetch(`${API_BASE}/parking/sessions/active`),
    ]);
    
    if (slotsRes.ok) {
      const data = await slotsRes.json();
      console.log("Dữ liệu Zones nhận được:", data); // Kiểm tra log này ở Console
      setZonesData(data);
    }
    
    if (sessionsRes.ok) {
      setActiveSessions(await sessionsRes.json());
    }
  } catch (err) {
    console.error("Lỗi đồng bộ dữ liệu:", err);
  }
};

  // Tải dữ liệu lần đầu
  useEffect(() => {
    refreshGlobalData();
  }, []);

  // Lấy danh sách các slot trống của Zone đang chọn từ dữ liệu tổng thể
// TrafficSimulation.tsx - Thay thế đoạn lọc cũ
const availableSlotsInZone = React.useMemo(() => {
  const slots = zonesData[form.zoneId] || [];
  return slots.filter(slot => slot.status === 'available');
}, [zonesData, form.zoneId]);
useEffect(() => {
  if (availableSlotsInZone.length > 0 && !form.slotId) {
    setForm(p => ({ ...p, slotId: availableSlotsInZone[0].id }));
  }
}, [availableSlotsInZone]);
  // 2. Xử lý khi xe VÀO (Entry)
  const handleEntry = async () => {
  if (!form.slotId || !form.vehicleId) {
    setMessage("Vui lòng điền đầy đủ biển số và chọn vị trí!");
    return;
  }

  // Khớp với cấu trúc body tại dòng 206 trong server.js
 const payload = {
    userName: form.userName || "Guest",
    userType: form.userType,
    zoneId: form.zoneId, // Phải khớp với các ID như "A", "B"...
    slotId: form.slotId, // Phải là "A-1", "A-2"...
    vehicleId: form.vehicleId,
    gate: form.gate
  };

  try {
    const res = await fetch(`${API_BASE}/parking/sessions/entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setMessage(`Thành công: Vị trí ${form.slotId} đã được chiếm dụng.`);
      // Xóa form để nhập xe tiếp theo
      setForm(p => ({ ...p, vehicleId: '', userName: '' }));
      await refreshGlobalData(); 
    } else {
      const error = await res.json();
      setMessage(`Lỗi: ${error.message}`);
    }
  } catch (err) {
    setMessage("Không thể kết nối đến server.");
  }
};

  // 3. Xử lý khi xe RA (Exit)
  const handleExit = async (sessionId: string) => {
    try {
      const res = await fetch(`${API_BASE}/parking/sessions/${sessionId}/exit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setMessage("Xe đã ra khỏi bãi. Vị trí đã được giải phóng.");
        await refreshGlobalData(); // Làm mới bản đồ ngay lập tức
      }
    } catch (err) {
      console.error("Lỗi khi cho xe ra:", err);
    }
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
            <input className="border rounded px-3 py-2 text-sm" placeholder="Tên người dùng" value={form.userName} onChange={(e) => setForm(p => ({ ...p, userName: e.target.value }))} />
            
            <select className="border rounded px-3 py-2 text-sm" value={form.userType} onChange={(e) => setForm(p => ({ ...p, userType: e.target.value }))}>
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Staff">Staff</option>
              <option value="Visitor">Visitor</option>
            </select>

            <input className="border rounded px-3 py-2 text-sm" placeholder="Biển số xe" value={form.vehicleId} onChange={(e) => setForm(p => ({ ...p, vehicleId: e.target.value }))} />
            
            {/* Chọn Zone */}
            <select className="border rounded px-3 py-2 text-sm font-semibold" value={form.zoneId} onChange={(e) => {
                setForm(p => ({ ...p, zoneId: e.target.value, slotId: '' }));
            }}>
              {Object.keys(zonesData).length > 0 
                ? Object.keys(zonesData).map(z => <option key={z} value={z}>Khu vực {z}</option>)
                : ['A', 'B', 'C', 'D', 'E'].map(z => <option key={z} value={z}>Khu vực {z}</option>)
              }
            </select>

            {/* Chọn Slot trống từ dữ liệu đã đồng bộ */}
            <select 
            className="border rounded px-3 py-2 text-sm bg-green-50 font-bold" 
             value={form.slotId} 
             onChange={(e) => setForm(p => ({ ...p, slotId: e.target.value }))}
            >
            <option value="">-- Chọn vị trí trống ({availableSlotsInZone.length}) --</option>
              {availableSlotsInZone.map(s => (
             <option key={s.id} value={s.id}>
            {s.id} (Trống)
            </option>
           ))}
</select>

            <input className="border rounded px-3 py-2 text-sm" placeholder="Cổng vào" value={form.gate} onChange={(e) => setForm(p => ({ ...p, gate: e.target.value }))} />
          </div>
          
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            onClick={handleEntry} 
            disabled={!form.slotId || !form.vehicleId}
          >
            Xác nhận xe vào bãi
          </Button>
          
          {message && <p className="text-sm font-medium text-blue-600 bg-blue-50 p-2 rounded border border-blue-100">{message}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách xe đang trong bãi</CardTitle>
          <CardDescription>Bấm "Cho xe ra" để giải phóng vị trí trên bản đồ.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-auto space-y-2">
            {activeSessions.length === 0 ? (
              <p className="text-center text-slate-400 py-4 italic">Hiện không có xe nào trong bãi.</p>
            ) : (
              activeSessions.map((s) => (
                <div key={s.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{s.vehicleId}</span>
                    <span className="text-xs text-slate-500">{s.userType} | Gate: {s.gate}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-mono">
                      {s.slotId}
                    </Badge>
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