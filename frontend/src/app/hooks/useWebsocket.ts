/**
 * useWebSocket — hook dùng chung cho Dashboard và ParkingMap
 * Tự động reconnect khi mất kết nối.
 */
import { useEffect, useRef, useState } from 'react';

const WS_URL = 'ws://localhost:5000/ws';
const RECONNECT_DELAY = 3000;

type Options = {
  enabled?: boolean;
  onZoneUpdate?: (zones: any[]) => void;
  onGuidance?: (guidance: any[]) => void;
};

export function useWebSocket({ enabled = true, onZoneUpdate, onGuidance }: Options) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [connected, setConnected] = useState(false);

  // Dùng ref cho callbacks — tránh recreate connect() mỗi lần render
  const onZoneUpdateRef = useRef(onZoneUpdate);
  const onGuidanceRef = useRef(onGuidance);
  useEffect(() => { onZoneUpdateRef.current = onZoneUpdate; }, [onZoneUpdate]);
  useEffect(() => { onGuidanceRef.current = onGuidance; }, [onGuidance]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      if (wsRef.current?.readyState === WebSocket.OPEN) return;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) { ws.close(); return; }
        setConnected(true);
        console.log('[WS] Connected');
        if (reconnectRef.current) clearTimeout(reconnectRef.current);
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'ZONE_UPDATE') onZoneUpdateRef.current?.(msg.zones);
          if (msg.type === 'GUIDANCE') onGuidanceRef.current?.(msg.guidance);
          if (msg.type === 'PING') ws.send(JSON.stringify({ type: 'PONG' }));
        } catch (error) {
          console.error('[WS] Error parsing message:', error);
        }
      };

      ws.onclose = (e) => {
        setConnected(false);
        console.log('[WS] Close code:', e.code, 'reason:', e.reason, 'wasClean:', e.wasClean);
        if (!cancelled) {
          console.log('[WS] Disconnected, reconnecting...');
          reconnectRef.current = setTimeout(connect, RECONNECT_DELAY);
        }
      };

      ws.onerror = (e) => {
        console.log('[WS] Error event:', e);
        ws.close();
      };
    };

    const t = setTimeout(connect, 100);

    return () => {
      cancelled = true;
      clearTimeout(t);
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [enabled]); // chỉ depend vào enabled, không depend vào callbacks

  return { connected };
}