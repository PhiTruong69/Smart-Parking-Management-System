import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import React, { useState, useEffect } from "react";
import { Car, Navigation, ArrowLeft, Info, AlertCircle } from 'lucide-react';

interface ParkingSlot {
  id: string;
  status: 'available' | 'occupied';
  sensorDisabled?: boolean;
}

export default function SmartParkingMap() {
  // 1. Khởi tạo dữ liệu mặc định để tránh màn hình trắng khi chưa gọi được API
  const [zonesData, setZonesData] = useState<Record<string, ParkingSlot[]>>({
    A: Array.from({ length: 100 }, (_, i) => ({ id: `A-${i + 1}`, status: 'available', sensorDisabled: false })),
    B: Array.from({ length: 100 }, (_, i) => ({ id: `B-${i + 1}`, status: 'available', sensorDisabled: false })),
    C: Array.from({ length: 100 }, (_, i) => ({ id: `C-${i + 1}`, status: 'available', sensorDisabled: false })),
    D: Array.from({ length: 100 }, (_, i) => ({ id: `D-${i + 1}`, status: 'available', sensorDisabled: false })),
    E: Array.from({ length: 100 }, (_, i) => ({ id: `E-${i + 1}`, status: 'available', sensorDisabled: false })),
  });

  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [disabledSensors, setDisabledSensors] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('disabledSensors');
      return new Set(saved ? JSON.parse(saved) : []);
    } catch {
      return new Set();
    }
  });
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Lưu disabled sensors vào localStorage
  useEffect(() => {
    localStorage.setItem('disabledSensors', JSON.stringify(Array.from(disabledSensors)));
  }, [disabledSensors]);

  // 2. Logic đồng bộ dữ liệu từ API
  useEffect(() => {
    const syncWithDatabase = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/parking/slots/all');
        if (!res.ok) return;
        const data = await res.json();
        
        // KIỂM TRA DỮ LIỆU: Chỉ cập nhật nếu data trả về đúng cấu trúc object
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          const updatedZones: Record<string, ParkingSlot[]> = {};
          Object.keys(data).forEach((zone) => {
            if (Array.isArray(data[zone])) {
              updatedZones[zone] = data[zone].map((slot: any) => ({
                id: slot.id,
                status: slot.status,
                sensorDisabled: disabledSensors.has(`S-${slot.id}`),
              }));
            }
          });
          if (Object.keys(updatedZones).length > 0) {
            setZonesData(updatedZones);
          }
        }
      } catch (err) {
        console.error("Lỗi đồng bộ bãi xe:", err);
      }
    };

    syncWithDatabase();
    const interval = setInterval(syncWithDatabase, 3000); // 3 giây cập nhật 1 lần
    return () => clearInterval(interval);
  }, [disabledSensors]);

  // Load disabled sensors từ backend khi khởi động
  useEffect(() => {
    const loadDisabledSensors = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/iot/sensors');
        if (!res.ok) return;
        const sensors = await res.json();
        if (Array.isArray(sensors)) {
          const disabled = new Set(sensors.filter((s: any) => s.disabled).map((s: any) => s.id));
          if (disabled.size > 0) {
            setDisabledSensors(disabled);
          }
        }
      } catch (err) {
        console.error("Lỗi tải disabled sensors:", err);
      }
    };
    loadDisabledSensors();
  }, []);

  // 3. Hàm tính toán trạng thái cho bảng điện tử
  const getZoneStatus = (zoneId: string) => {
    const slots = zonesData[zoneId] || []; // Tránh lỗi undefined
    const occupiedCount = slots.filter(s => s.status === 'occupied').length;
    const disabledCount = slots.filter(s => s.sensorDisabled).length;
    const availableCount = slots.filter(s => s.status === 'available' && !s.sensorDisabled).length;
    const capacity = slots.length || 100;
    
    // Tính tỉ lệ dựa trên số slot còn trống thực tế (trừ đi sensor disabled)
    const ratio = (occupiedCount + disabledCount) / capacity;

    if (ratio >= 1) return { label: 'FULL', color: 'bg-red-600', text: 'text-red-600' };
    if (ratio >= 0.8) return { label: 'NEARLY FULL', color: 'bg-yellow-500', text: 'text-yellow-600' };
    return { label: 'AVAILABLE', color: 'bg-green-500', text: 'text-green-600' };
  };

  // 4. Hàm toggle sensor khi nhấp vào slot
  const toggleSlotSensor = async (slotId: string) => {
    const sensorId = `S-${slotId}`;
    const isCurrentlyDisabled = disabledSensors.has(sensorId);

    try {
      const response = await fetch(`http://localhost:5000/api/iot/sensors/${sensorId}/toggle`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ disable: !isCurrentlyDisabled }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle sensor');
      }

      // Update disabled sensors set
      const newDisabledSensors = new Set(disabledSensors);
      if (isCurrentlyDisabled) {
        newDisabledSensors.delete(sensorId);
      } else {
        newDisabledSensors.add(sensorId);
      }
      setDisabledSensors(newDisabledSensors);

      // Update UI
      setZonesData((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((zone) => {
          updated[zone] = updated[zone].map((slot) => {
            if (slot.id === slotId) {
              return { ...slot, sensorDisabled: !isCurrentlyDisabled };
            }
            return slot;
          });
        });
        return updated;
      });

      showNotification(
        'success',
        `Sensor at slot ${slotId} ${!isCurrentlyDisabled ? 'disabled' : 'enabled'} successfully`
      );
    } catch (err) {
      console.error('Error toggling sensor:', err);
      showNotification('error', `Failed to toggle sensor at slot ${slotId}`);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Notification */}
      {notification && (
        <Card className={notification.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardContent className="p-4 flex items-center gap-2">
            <AlertCircle className={`w-5 h-5 flex-shrink-0 ${notification.type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
            <p className={`text-sm ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {notification.message}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Bảng điện tử mô phỏng */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.keys(zonesData).map((zId) => {
          const status = getZoneStatus(zId);
          const slots = zonesData[zId] || [];
          const occupied = slots.filter(s => s.status === 'occupied').length;
          const disabledCount = slots.filter(s => s.sensorDisabled).length;
          return (
            <Card key={zId} className="border-2 border-slate-800 bg-slate-900 text-white overflow-hidden">
              <div className={`${status.color} px-2 py-1 text-[10px] font-bold text-center uppercase`}>
                ZONE {zId}
              </div>
              <CardContent className="p-4 text-center">
                <div className={`text-xl font-mono font-bold mb-1 ${status.text}`}>
                  {status.label}
                </div>
                <div className="text-2xl font-mono text-white">
                  {slots.length - occupied} <span className="text-sm text-slate-400">TRỐNG</span>
                </div>
                {disabledCount > 0 && (
                  <div className="text-xs text-yellow-400 mt-2">
                    {disabledCount} sensor(s) disabled
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <hr className="border-slate-200" />

      {/* Hiển thị Zone hoặc Chi tiết */}
      {!selectedZone ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.keys(zonesData).map((zId) => {
            const disabledCount = (zonesData[zId] || []).filter(s => s.sensorDisabled).length;
            return (
              <Card key={zId} className="cursor-pointer hover:border-blue-500 transition-all" onClick={() => setSelectedZone(zId)}>
                <CardHeader>
                  <CardTitle>Khu vực {zId}</CardTitle>
                  <CardDescription>Nhấn để xem 100 vị trí cụ thể</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="outline">
                      Đã đỗ: {(zonesData[zId] || []).filter(s => s.status === 'occupied').length}/100
                    </Badge>
                    {disabledCount > 0 && (
                      <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-200">
                        {disabledCount} sensor disabled
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setSelectedZone(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
            </Button>
            <CardTitle>Sơ đồ chi tiết Zone {selectedZone}</CardTitle>
            <div className="w-4" /> {/* Spacer */}
          </CardHeader>
          <CardContent className="p-8">
            <p className="text-sm text-slate-600 mb-4">
              <Info className="w-4 h-4 inline mr-1" />
              Nhấp vào một chỗ đỗ để tắt/bật sensor tương ứng
            </p>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-3 max-w-5xl mx-auto">
              {(zonesData[selectedZone] || []).map((slot) => {
                const sensorId = `S-${slot.id}`;
                const isSensorDisabled = disabledSensors.has(sensorId);
                return (
                  <div
                    key={slot.id}
                    onClick={() => toggleSlotSensor(slot.id)}
                    className={`relative h-16 border-2 rounded-md flex flex-col items-center justify-center transition-all cursor-pointer hover:shadow-lg
                      ${isSensorDisabled 
                        ? 'bg-gray-300 border-gray-500 text-gray-700 opacity-70' 
                        : slot.status === 'occupied' 
                          ? 'bg-red-50 border-red-500 text-red-700 hover:bg-red-100' 
                          : 'bg-green-50 border-green-500 text-green-700 hover:bg-green-100'}`}
                    title={`${slot.id} - ${isSensorDisabled ? 'Sensor Disabled (Broken)' : slot.status}`}
                  >
                    <span className="text-[10px] font-bold">{slot.id}</span>
                    {isSensorDisabled ? (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    ) : slot.status === 'occupied' ? (
                      <Car className="w-6 h-6" />
                    ) : (
                      <div className="w-6 h-6 border-2 border-dashed border-green-300 rounded-full" />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 text-sm text-slate-600 flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-50 border-2 border-green-500 rounded"></div>
                <span>Trống (Sensor OK)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-50 border-2 border-red-500 rounded flex items-center justify-center">
                  <Car className="w-2 h-2 text-red-700" />
                </div>
                <span>Đã đỗ (Sensor OK)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 border-2 border-gray-500 rounded flex items-center justify-center">
                  <AlertCircle className="w-2 h-2 text-red-600" />
                </div>
                <span>Sensor Hỏng (Không thể đỗ)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}