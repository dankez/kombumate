'use client';

import { useState, useEffect } from 'react';
import { Cpu, RefreshCw, Thermometer, Activity, Wifi, Key } from 'lucide-react';

export default function IotPage() {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pi/measurements');
      const data = await res.json();
      setTelemetry(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-950 to-teal-950 text-white p-6 md:p-8 rounded-2xl shadow-md border border-emerald-800">
        <h1 className="text-2xl font-extrabold font-serif flex items-center gap-2">
          <Cpu className="w-7 h-7 text-amber-400" /> Raspberry Pi IoT Monitorovanie Fermentácie
        </h1>
        <p className="text-emerald-200 text-xs mt-2 max-w-2xl leading-relaxed">
          Rozhranie pre automatické prijímanie meraní teploty (DS18B20) a pH senzorov z Raspberry Pi alebo ESP32.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-emerald-900/10 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="font-bold font-serif text-emerald-950 text-base flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-600" /> Živé Merania zo Senzorov
          </h2>
          <button
            onClick={fetchTelemetry}
            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 transition flex items-center gap-1 text-xs font-bold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Obnoviť
          </button>
        </div>

        <div className="bg-gray-900 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto space-y-2">
          <div className="text-gray-400 font-bold">// Príklad cURL odoslania merania z Raspberry Pi (Python Script):</div>
          <code>
            curl -X POST http://localhost:3000/api/pi/measurements \<br />
            &nbsp;&nbsp;-H &quot;Content-Type: application/json&quot; \<br />
            &nbsp;&nbsp;-d &#39;{`{"deviceId": "rpi-booch-01", "batchId": "kb-active-1", "temperature": 24.2, "ph": 3.1}`}&#39;
          </code>
        </div>

        {telemetry && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-gray-700 uppercase">Posledné Zaznamenané Merania:</h3>
            <div className="grid gap-2">
              {telemetry.recentMeasurements?.map((m: any) => (
                <div key={m.id} className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 flex flex-wrap items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-emerald-950">{m.deviceId}</span>
                    <span className="text-[10px] text-gray-400 block font-mono">{new Date(m.timestamp).toLocaleString('sk-SK')}</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono font-bold">
                    <span className="text-amber-900">{m.temperature} °C</span>
                    {m.ph && <span className="text-emerald-900">pH {m.ph}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
