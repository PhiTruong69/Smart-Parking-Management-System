// ─── ParkingMap.tsx ────────────────────────────────────────────────────────
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import React, { useState, useEffect, useCallback } from 'react';
import { Car, ArrowLeft } from 'lucide-react';

interface ParkingSlot { id: string; status: 'available' | 'occupied'; maintenanceMode?: boolean; }
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

  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [maintenanceSensors, setMaintenanceSensors] = useState<Set<string>>(new Set());

  const syncSlots = useCallback(async () => {
    try {
      const [slotsRes, sensorsRes] = await Promise.all([
        apiFetch('http://localhost:5000/api/parking/slots/all'),
        apiFetch('http://localhost:5000/api/iot/sensors'),
      ]);
      if (slotsRes.ok) {
        const data = await slotsRes.json();
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          setZonesData(data);
        }
      }
      if (sensorsRes.ok) {
        const sensors = await sensorsRes.json();
        const maintenance = new Set<string>(
          sensors
            .filter((s: any) => s.maintenanceMode)
            .map((s: any) => s.slot)
        );
        setMaintenanceSensors(maintenance);
      }
    } catch (err) {
      console.error('ParkingMap sync error:', err);
    }
  }, [apiFetch]);

  const toggleSensorMaintenance = async (slotId: string) => {
    try {
      const sensorId = `S-${slotId}`;
      const res = await apiFetch(`http://localhost:5000/api/iot/sensors/${sensorId}/maintenance`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setMaintenanceSensors((prev) => {
          const updated = new Set(prev);
          if (data.maintenanceMode) {
            updated.add(slotId);
          } else {
            updated.delete(slotId);
          }
          return updated;
        });
      }
    } catch (err) {
      console.error('Error toggling sensor maintenance:', err);
    }
  };


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
  }, [syncSlots]);

  useEffect(() => {
    if (zoneUpdateTick > 0) syncSlots();
  }, [zoneUpdateTick, syncSlots]);

  const getZoneStatus = (zoneId: string) => {
    const slots = zonesData[zoneId] || [];
    const ratio = slots.filter((s) => s.status === 'occupied').length / (slots.length || 100);
    if (ratio >= 1) return { label: 'FULL', color: 'bg-red-600', text: 'text-red-600' };
    if (ratio >= 0.8) return { label: 'NEARLY FULL', color: 'bg-yellow-500', text: 'text-yellow-600' };
    return { label: 'AVAILABLE', color: 'bg-green-500', text: 'text-green-600' };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.keys(zonesData).map((zId) => {
          const status = getZoneStatus(zId);
          const slots = zonesData[zId] || [];
          const occupied = slots.filter((s) => s.status === 'occupied').length;
          return (
            <Card key={zId} className="overflow-hidden border-0 bg-slate-950 text-white ring-1 ring-white/10">
              <div className={`${status.color} px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-wide`}>ZONE {zId}</div>
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
            <Card key={zId} className="cursor-pointer border-0 bg-white/95 ring-1 ring-slate-200/70 transition-all hover:-translate-y-0.5 hover:ring-teal-300" onClick={() => setSelectedZone(zId)}>
              <CardHeader><CardTitle>Khu vực {zId}</CardTitle><CardDescription>Nhấn để xem 100 vị trí cụ thể</CardDescription></CardHeader>
              <CardContent><Badge variant="outline">Đã đỗ: {(zonesData[zId] || []).filter((s) => s.status === 'occupied').length}/100</Badge></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-0 bg-white/95 ring-1 ring-teal-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setSelectedZone(null)}><ArrowLeft className="w-4 h-4 mr-2" />Quay lại</Button>
            <CardTitle>Sơ đồ chi tiết Zone {selectedZone}</CardTitle>
            <div className="w-4" />
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-5 md:grid-cols-10 gap-3 max-w-5xl mx-auto">
              {(zonesData[selectedZone] || []).map((slot) => {
                const isInMaintenance = maintenanceSensors.has(slot.id);
                const canClick = isInMaintenance || slot.status !== 'occupied';
                const bgClass = isInMaintenance 
                  ? 'bg-yellow-100 border-yellow-500 text-yellow-700 cursor-pointer hover:bg-yellow-200' 
                  : slot.status === 'occupied' 
                  ? 'bg-red-50 border-red-500 text-red-700 cursor-not-allowed' 
                  : 'bg-green-50 border-green-500 text-green-700 cursor-pointer hover:bg-green-100';
                
                return (
                  <div 
                    key={slot.id} 
                    className={`relative h-16 border-2 rounded-md flex flex-col items-center justify-center transition-all ${bgClass}`}
                    onClick={() => canClick && toggleSensorMaintenance(slot.id)}
                    title={isInMaintenance ? 'Bảo trì - nhấn để hủy' : slot.status === 'occupied' ? 'Đã đỗ' : 'Nhấn để bảo trì'}
                  >
                    <span className="text-[10px] font-bold">{slot.id}</span>
                    {isInMaintenance ? (
                      <div className="w-5 h-5 flex items-center justify-center">
                        <span className="text-sm">⚙️</span>
                      </div>
                    ) : slot.status === 'occupied' ? (
                      <Car className="w-6 h-6" />
                    ) : (
                      <div className="w-6 h-6 border-2 border-dashed border-green-300 rounded-full" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
