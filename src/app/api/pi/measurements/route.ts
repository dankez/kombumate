import { NextResponse } from 'next/server';

// Temporary in-memory store for dev/telemetry demonstration
let telemetryStore: Array<{
  id: string;
  deviceId: string;
  batchId?: string;
  temperature: number;
  ph?: number;
  ambientHumidity?: number;
  timestamp: string;
}> = [
  {
    id: 'pi-read-1',
    deviceId: 'rpi-booch-01',
    batchId: 'kb-active-1',
    temperature: 24.2,
    ph: 3.1,
    ambientHumidity: 48,
    timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: 'pi-read-2',
    deviceId: 'rpi-booch-01',
    batchId: 'kb-active-1',
    temperature: 24.5,
    ph: 3.05,
    ambientHumidity: 47,
    timestamp: new Date().toISOString(),
  },
];

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('x-api-key');
    
    // Simple key authentication for IoT device
    if (process.env.PI_API_KEY && authHeader !== `Bearer ${process.env.PI_API_KEY}` && authHeader !== process.env.PI_API_KEY) {
      return NextResponse.json({ error: 'Neautorizovaný prístup. Neplatný API kľúč.' }, { status: 401 });
    }

    const body = await request.json();
    const { deviceId, batchId, temperature, ph, ambientHumidity } = body;

    if (!deviceId || typeof temperature !== 'number') {
      return NextResponse.json(
        { error: 'Neplatné údaje. Pole deviceId a temperature (číslo) sú povinné.' },
        { status: 400 }
      );
    }

    const newMeasurement = {
      id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      deviceId,
      batchId: batchId || undefined,
      temperature,
      ph: typeof ph === 'number' ? ph : undefined,
      ambientHumidity: typeof ambientHumidity === 'number' ? ambientHumidity : undefined,
      timestamp: new Date().toISOString(),
    };

    telemetryStore.push(newMeasurement);

    // Keep store bounded
    if (telemetryStore.length > 500) {
      telemetryStore.shift();
    }

    return NextResponse.json({
      success: true,
      message: 'Meranie zo senzora bolo úspešne uložené',
      data: newMeasurement,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: 'Chyba pri spracovaní merania: ' + error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    deviceType: 'Raspberry Pi Kombucha Hub Sensor Interface',
    totalLogsCount: telemetryStore.length,
    recentMeasurements: telemetryStore.slice(-20).reverse(),
  });
}
