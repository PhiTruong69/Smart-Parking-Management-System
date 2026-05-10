// ─── ParkingMap.tsx ────────────────────────────────────────────────────────
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import React, { useState, useEffect } from 'react';
import { Car, ArrowLeft } from 'lucide-react';

interface ParkingSlot { id: string; status: 'available' | 'occupied'; }
type ApiFetch = (url: string, options?: RequestInit) => Promise<Response>;
type Props = {
  apiFetch: ApiFetch;
  zoneUpdateTick?: number; // tăng mỗi khi WS nhận zone update
};

export default function SmartParkingMap({ apiFetch, zoneUpdateTick = 0 }: Props) {
  const [zonesData, setZonesData] = useState<Record<string, ParkingSlot[]>>({
    A: Array.from({ length: 100 }, (_, i) => ({ id: `A-${i + 1}`, status: 'available' })),
    B: Array.from({ length: 100 }, (_, i) => ({ id: `B-${i + 1}`, status: 'available' })),
    C: Array.from({ length: 100 }, (_, i) => ({ id: `C-${i + 1}`, status: 'available' })),
    D: Array.from({ length: 100 }, (_, i) => ({ id: `D-${i + 1}`, status: 'available' })),
    E: Array.from({ length: 100 }, (_, i) => ({ id: `E-${i + 1}`, status: 'available' })),
  });

  const syncSlots = async () => {
    try {
      const res = await apiFetch('http://localhost:5000/api/parking/slots/all');
      if (!res.ok) return;
      const data = await res.json();
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        setZonesData(data);
      }
    } catch (err) {
      console.error('ParkingMap sync error:', err);
    }
  };


  const [selectedZone, setSelectedZone] = useState<string | null>(null);


  // useEffect(() => {
  //   const sync = async () => {
  //     try {
  //       const res = await apiFetch('http://localhost:5000/api/parking/slots/all');
  //       if (!res.ok) return;
  //       const data = await res.json();
  //       if (data && typeof data === 'object' && Object.keys(data).length > 0) setZonesData(data);
  //     } catch (err) { console.error('ParkingMap sync error:', err); }
  //   };
  //   const interval = setInterval(sync, 3000);
  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    syncSlots();
    const fallback = setInterval(syncSlots, 30000);
    return () => clearInterval(fallback);
  }, []);

  useEffect(() => {
    if (zoneUpdateTick > 0) syncSlots();
  }, [zoneUpdateTick]);

  const getZoneStatus = (zoneId: string) => {
    const slots = zonesData[zoneId] || [];
    const ratio = slots.filter((s) => s.status === 'occupied').length / (slots.length || 100);
    if (ratio >= 1) return { label: 'FULL', color: 'bg-red-600', text: 'text-red-600' };
    if (ratio >= 0.8) return { label: 'NEARLY FULL', color: 'bg-yellow-500', text: 'text-yellow-600' };
    return { label: 'AVAILABLE', color: 'bg-green-500', text: 'text-green-600' };
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.keys(zonesData).map((zId) => {
          const status = getZoneStatus(zId);
          const slots = zonesData[zId] || [];
          const occupied = slots.filter((s) => s.status === 'occupied').length;
          return (
            <Card key={zId} className="border-2 border-slate-800 bg-slate-900 text-white overflow-hidden">
              <div className={`${status.color} px-2 py-1 text-[10px] font-bold text-center uppercase`}>ZONE {zId}</div>
              <CardContent className="p-4 text-center">
                <div className={`text-xl font-mono font-bold mb-1 ${status.text}`}>{status.label}</div>
                <div className="text-2xl font-mono text-white">{slots.length - occupied} <span className="text-sm text-slate-400">TRỐNG</span></div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <hr className="border-slate-200" />
      {!selectedZone ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.keys(zonesData).map((zId) => (
            <Card key={zId} className="cursor-pointer hover:border-blue-500 transition-all" onClick={() => setSelectedZone(zId)}>
              <CardHeader><CardTitle>Khu vực {zId}</CardTitle><CardDescription>Nhấn để xem 100 vị trí cụ thể</CardDescription></CardHeader>
              <CardContent><Badge variant="outline">Đã đỗ: {(zonesData[zId] || []).filter((s) => s.status === 'occupied').length}/100</Badge></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setSelectedZone(null)}><ArrowLeft className="w-4 h-4 mr-2" />Quay lại</Button>
            <CardTitle>Sơ đồ chi tiết Zone {selectedZone}</CardTitle>
            <div className="w-4" />
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-5 md:grid-cols-10 gap-3 max-w-5xl mx-auto">
              {(zonesData[selectedZone] || []).map((slot) => (
                <div key={slot.id} className={`relative h-16 border-2 rounded-md flex flex-col items-center justify-center transition-all ${slot.status === 'occupied' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-green-50 border-green-500 text-green-700'}`}>
                  <span className="text-[10px] font-bold">{slot.id}</span>
                  {slot.status === 'occupied' ? <Car className="w-6 h-6" /> : <div className="w-6 h-6 border-2 border-dashed border-green-300 rounded-full" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
