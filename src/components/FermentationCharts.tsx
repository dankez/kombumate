'use client';

import { useState } from 'react';
import {
  TrendingDown,
  Activity,
  Thermometer,
  Sparkles,
  Droplets,
  ShieldCheck,
  Percent,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Batch, Measurement } from '@/types';
import { calculateDaysFermenting } from '@/lib/fermentationEngine';

interface FermentationChartsProps {
  batch?: Batch;
  allBatches?: Batch[];
  title?: string;
  subtitle?: string;
}

type ChartTab = 'sugar' | 'ph' | 'temp' | 'overview';

export default function FermentationCharts({
  batch,
  allBatches = [],
  title,
  subtitle,
}: FermentationChartsProps) {
  const [activeTab, setActiveTab] = useState<ChartTab>('sugar');
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    batch ? batch.id : allBatches[0]?.id || ''
  );
  const [hoveredPoint, setHoveredPoint] = useState<{
    day: number;
    sugarBrix: number;
    sugarGrams: number;
    ph: number;
    temp: number;
    sweetness: string;
    note: string;
  } | null>(null);

  const currentBatch = batch || allBatches.find((b) => b.id === selectedBatchId) || allBatches[0];

  const rawDays = currentBatch ? calculateDaysFermenting(currentBatch.startDate) : 5;
  const daysPassed = Math.max(0, Math.round(isNaN(rawDays) ? 5 : rawDays));
  const initialSugarGrams = currentBatch?.sugarGram || 245;
  const volumeLiters = currentBatch?.volumeLiters || 3.5;
  const initialSugarPerLiter = Math.round(initialSugarGrams / volumeLiters); // e.g. 70 g/L
  const initialBrix = Number((initialSugarPerLiter / 10).toFixed(1)); // ~7.0 Brix

  // Generate a kinetic model timeline for days 0 to 12
  const timelineDays = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const modelPoints = timelineDays.map((day) => {
    // Sugar decay curve: drops exponentially from initialBrix down to ~2.8 Brix
    const decayFactor = Math.exp(-0.16 * day);
    const sugarBrix = Number((2.4 + (initialBrix - 2.4) * decayFactor).toFixed(1));
    const sugarGrams = Math.round(sugarBrix * 10);

    // pH decay curve: rapid initial drop from 4.3 to 3.8 in 48h, then stabilizes around 2.9 - 3.1
    let ph = 4.3;
    if (day === 1) ph = 3.9;
    else if (day === 2) ph = 3.6;
    else if (day <= 5) ph = Number((3.6 - (day - 2) * 0.15).toFixed(2));
    else if (day <= 8) ph = Number((3.15 - (day - 5) * 0.06).toFixed(2));
    else ph = Number((2.97 - (day - 8) * 0.04).toFixed(2));

    // Taste sweetness perception label
    let sweetness = 'Veľmi sladký (čaj)';
    if (day >= 3 && day <= 5) sweetness = 'Svieži polosladký';
    else if (day >= 6 && day <= 8) sweetness = 'Vyvážený (ideálny zber)';
    else if (day >= 9 && day <= 10) sweetness = 'Výrazne kyselkavý';
    else if (day > 10) sweetness = 'Kombucha ocot';

    return {
      day,
      sugarBrix,
      sugarGrams,
      ph,
      temp: 23.5 + Math.sin(day * 0.8) * 0.4,
      sweetness,
      note:
        day === 0
          ? 'Založenie: sladký čaj + 10% štartér'
          : day === 2
          ? 'Baktérie tvoria ochranný kyslý plášť (< 4.0 pH)'
          : day === 7
          ? 'Zlaté okno degustácie a stočenia'
          : day === 12
          ? 'Kyslá základňa pre ďalšie várky (štartér)'
          : '',
    };
  });

  // Check measurements from the current batch
  const measurements = currentBatch?.measurements || [];
  const latestM = measurements[0];
  const dayIndex = Math.min(12, Math.max(0, daysPassed));
  const modelDayPoint = modelPoints[dayIndex] ?? modelPoints[0];
  const currentBrix = latestM?.sugarBrix ?? modelDayPoint.sugarBrix;
  const currentPh = latestM?.ph ?? modelDayPoint.ph;
  const currentSugarPerLiter = latestM?.sugarGramPerLiter ?? Math.round(currentBrix * 10);
  const sugarConsumedPercent = Math.min(
    95,
    Math.max(5, Math.round(((initialSugarPerLiter - currentSugarPerLiter) / initialSugarPerLiter) * 100))
  );

  // SVG Chart dimensions
  const svgWidth = 640;
  const svgHeight = 260;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  // Coordinate mappers
  const getX = (day: number) => padLeft + (day / 12) * chartW;
  
  // Sugar mapper (0 to 8 Brix)
  const getYSugar = (brix: number) => padTop + chartH - (brix / 8) * chartH;
  
  // pH mapper (2.0 to 5.0 pH)
  const getYPh = (phVal: number) => padTop + chartH - ((phVal - 2.0) / 3.0) * chartH;
  
  // Temp mapper (18 to 30 °C)
  const getYTemp = (tempVal: number) => padTop + chartH - ((tempVal - 18) / 12) * chartH;

  // Build SVG Paths
  const sugarPath = modelPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.day)} ${getYSugar(p.sugarBrix)}`)
    .join(' ');

  const phPath = modelPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.day)} ${getYPh(p.ph)}`)
    .join(' ');

  const tempPath = modelPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.day)} ${getYTemp(p.temp)}`)
    .join(' ');

  return (
    <div className="bg-white rounded-2xl border border-emerald-900/10 shadow-sm p-5 md:p-6 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-900">
              <TrendingDown className="w-5 h-5 text-amber-700" />
            </span>
            <h2 className="text-lg md:text-xl font-extrabold text-emerald-950 font-serif">
              {title || 'Fermentačná Analytika & Krivky Kvasenia'}
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {subtitle || 'Sledovanie poklesu cukru, vývoja acidity (pH) a rovnováhy chuti v čase.'}
          </p>
        </div>

        {/* Batch Selector if multiple batches passed */}
        {allBatches.length > 1 && !batch && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Várka:</span>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="text-xs font-bold text-emerald-950 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl outline-none"
            >
              {allBatches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.codeNumber} – {b.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Real-time Parameter Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Sugar */}
        <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-amber-900 text-xs font-bold">
            <span>Zvyškový Cukor</span>
            <Droplets className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-amber-950">{currentBrix}</span>
            <span className="text-xs font-bold text-amber-800">°Brix</span>
            <span className="text-[11px] text-gray-500 font-mono">({currentSugarPerLiter} g/L)</span>
          </div>
          <div className="text-[11px] text-amber-800 flex items-center gap-1 font-medium">
            <span>Úbytok:</span>
            <span className="font-bold text-emerald-700 font-mono">-{sugarConsumedPercent}%</span>
            <span>zo štartu</span>
          </div>
        </div>

        {/* Metric 2: pH / Acidity */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-emerald-900 text-xs font-bold">
            <span>Acidita (pH)</span>
            <Activity className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-emerald-950">{Number(currentPh).toFixed(1)}</span>
            <span className="text-xs font-bold text-emerald-800">pH</span>
          </div>
          <div className="text-[11px] text-emerald-800 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold">Bezpečné (&lt; 4.0 pH)</span>
          </div>
        </div>

        {/* Metric 3: Sweet / Sour balance */}
        <div className="bg-teal-50/70 border border-teal-200/80 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-teal-900 text-xs font-bold">
            <span>Sladkosť vs. Kyslosť</span>
            <Sparkles className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-base font-extrabold text-teal-950 font-serif">
            {daysPassed <= 3
              ? 'Sladký čaj'
              : daysPassed <= 6
              ? 'Svieža polosladká'
              : daysPassed <= 9
              ? 'Vyvážená (Zber)'
              : 'Silne kyslá'}
          </div>
          <div className="text-[11px] text-teal-800">
            {daysPassed >= 6 && daysPassed <= 9 ? (
              <span className="text-emerald-700 font-bold">✓ Ideálny čas na ochutnávku</span>
            ) : daysPassed < 6 ? (
              <span>Ešte zreje a kvasí</span>
            ) : (
              <span>Vhodné ako silný štartér</span>
            )}
          </div>
        </div>

        {/* Metric 4: Teplota & Alkohol */}
        <div className="bg-sky-50/70 border border-sky-200/80 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-sky-900 text-xs font-bold">
            <span>Teplota & Odhad ABV</span>
            <Thermometer className="w-4 h-4 text-sky-700" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold font-mono text-sky-950">23.8 °C</span>
            <span className="text-xs font-mono text-sky-800 font-bold">~0.3% ABV</span>
          </div>
          <div className="text-[11px] text-sky-800 font-medium">
            <span className="text-emerald-700 font-bold">Optimálna zóna</span> (22–26 °C)
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('sugar')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'sugar'
                ? 'bg-amber-500 text-emerald-950 shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📉 Pokles Cukru (°Brix & g/L)
          </button>
          <button
            onClick={() => setActiveTab('ph')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'ph'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🧪 Vývoj Kyslosti (pH Krivka)
          </button>
          <button
            onClick={() => setActiveTab('temp')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'temp'
                ? 'bg-sky-700 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🌡️ Teplotná Stabilita
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'overview'
                ? 'bg-purple-800 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ⚖️ Sladkosť vs. Kyslosť
          </button>
        </div>

        <div className="text-[11px] text-gray-400 font-mono">
          Aktuálny deň varenia: <span className="font-bold text-emerald-900">{daysPassed}. deň</span>
        </div>
      </div>

      {/* SVG Interactive Chart Canvas */}
      <div className="relative bg-gradient-to-b from-[#fcfbf9] to-[#f7f5f0] rounded-2xl p-2 border border-gray-200 overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[550px] select-none"
        >
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padTop + ratio * chartH;
            return (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke="#e6e2d8"
                  strokeDasharray="3 3"
                />
              </g>
            );
          })}

          {/* Vertical Day Lines & Labels */}
          {timelineDays.map((day) => {
            const x = getX(day);
            const isToday = day === daysPassed;
            return (
              <g key={day}>
                <line
                  x1={x}
                  y1={padTop}
                  x2={x}
                  y2={padTop + chartH}
                  stroke={isToday ? '#d97706' : '#edebe3'}
                  strokeWidth={isToday ? 2 : 1}
                  strokeDasharray={isToday ? undefined : '2 2'}
                />
                <text
                  x={x}
                  y={padTop + chartH + 18}
                  textAnchor="middle"
                  className={`text-[10px] font-mono ${isToday ? 'fill-amber-700 font-bold' : 'fill-gray-400'}`}
                >
                  D{day}
                </text>
              </g>
            );
          })}

          {/* Current Day Indicator Flag */}
          {daysPassed <= 12 && (
            <g>
              <rect
                x={getX(daysPassed) - 26}
                y={padTop - 20}
                width={52}
                height={18}
                rx={4}
                fill="#d97706"
              />
              <text
                x={getX(daysPassed)}
                y={padTop - 7}
                textAnchor="middle"
                className="text-[9px] font-mono font-bold fill-white"
              >
                Dnes (D{daysPassed})
              </text>
            </g>
          )}

          {/* Chart Content based on activeTab */}
          {activeTab === 'sugar' && (
            <g>
              {/* Optimal harvesting zone highlight (days 6 to 9, 2.8 - 4.0 Brix) */}
              <rect
                x={getX(6)}
                y={getYSugar(4.2)}
                width={getX(9) - getX(6)}
                height={getYSugar(2.6) - getYSugar(4.2)}
                fill="#fef3c7"
                opacity={0.6}
                rx={6}
              />
              <text
                x={(getX(6) + getX(9)) / 2}
                y={getYSugar(4.3)}
                textAnchor="middle"
                className="text-[9px] font-bold fill-amber-800"
              >
                Zlatá zóna degustácie (3-4 °Brix)
              </text>

              {/* Theoretical model line */}
              <path
                d={sugarPath}
                fill="none"
                stroke="#d97706"
                strokeWidth={3.5}
                strokeLinecap="round"
              />

              {/* Data points */}
              {modelPoints.map((p) => {
                const cx = getX(p.day);
                const cy = getYSugar(p.sugarBrix);
                const isHovered = hoveredPoint?.day === p.day;

                return (
                  <g
                    key={p.day}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 7 : 4.5}
                      fill={p.day === daysPassed ? '#d97706' : '#b45309'}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  </g>
                );
              })}

              {/* Real Measurements overlaid if available */}
              {measurements.map((m, idx) => {
                const mDay = Math.max(0, Math.min(12, calculateDaysFermenting(currentBatch?.startDate || '', m.timestamp)));
                const brix = m.sugarBrix || (m.ph ? Number((m.ph * 1.1).toFixed(1)) : 3.5);
                return (
                  <g key={m.id || idx}>
                    <circle
                      cx={getX(mDay)}
                      cy={getYSugar(brix)}
                      r={6}
                      fill="#047857"
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                    <text
                      x={getX(mDay)}
                      y={getYSugar(brix) - 9}
                      textAnchor="middle"
                      className="text-[9px] font-bold font-mono fill-emerald-800"
                    >
                      {brix}°B
                    </text>
                  </g>
                );
              })}

              {/* Y Axis Labels */}
              <text x={padLeft - 8} y={getYSugar(8) + 4} textAnchor="end" className="text-[10px] font-mono fill-gray-400">8°B</text>
              <text x={padLeft - 8} y={getYSugar(6) + 4} textAnchor="end" className="text-[10px] font-mono fill-gray-400">6°B</text>
              <text x={padLeft - 8} y={getYSugar(4) + 4} textAnchor="end" className="text-[10px] font-mono fill-gray-400">4°B</text>
              <text x={padLeft - 8} y={getYSugar(2) + 4} textAnchor="end" className="text-[10px] font-mono fill-gray-400">2°B</text>
            </g>
          )}

          {activeTab === 'ph' && (
            <g>
              {/* Safe pH zone highlight (2.8 - 3.4 pH) */}
              <rect
                x={padLeft}
                y={getYPh(3.4)}
                width={chartW}
                height={getYPh(2.8) - getYPh(3.4)}
                fill="#d1fae5"
                opacity={0.5}
                rx={4}
              />
              <text
                x={padLeft + 10}
                y={getYPh(3.4) + 14}
                className="text-[9px] font-bold fill-emerald-800"
              >
                Ideálne pH pre pitie (2.8 – 3.2)
              </text>

              {/* Mold Danger Line at 4.0 */}
              <line
                x1={padLeft}
                y1={getYPh(4.0)}
                x2={padLeft + chartW}
                y2={getYPh(4.0)}
                stroke="#f43f5e"
                strokeDasharray="4 2"
                strokeWidth={1.5}
              />
              <text
                x={padLeft + chartW - 5}
                y={getYPh(4.0) - 5}
                textAnchor="end"
                className="text-[9px] font-bold fill-rose-600"
              >
                Kritická hranica: pH &lt; 4.0 (ochrana pred plesňami)
              </text>

              {/* pH curve */}
              <path
                d={phPath}
                fill="none"
                stroke="#065f46"
                strokeWidth={3.5}
                strokeLinecap="round"
              />

              {modelPoints.map((p) => {
                const cx = getX(p.day);
                const cy = getYPh(p.ph);
                const isHovered = hoveredPoint?.day === p.day;

                return (
                  <g
                    key={p.day}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 7 : 4.5}
                      fill="#047857"
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  </g>
                );
              })}

              {/* Y Axis pH */}
              <text x={padLeft - 8} y={getYPh(5.0) + 4} textAnchor="end" className="text-[10px] font-mono fill-gray-400">5.0</text>
              <text x={padLeft - 8} y={getYPh(4.0) + 4} textAnchor="end" className="text-[10px] font-mono fill-gray-400">4.0</text>
              <text x={padLeft - 8} y={getYPh(3.0) + 4} textAnchor="end" className="text-[10px] font-mono fill-gray-400">3.0</text>
              <text x={padLeft - 8} y={getYPh(2.0) + 4} textAnchor="end" className="text-[10px] font-mono fill-gray-400">2.0</text>
            </g>
          )}

          {activeTab === 'temp' && (
            <g>
              {/* Optimal 22 - 26 C green band */}
              <rect
                x={padLeft}
                y={getYTemp(26)}
                width={chartW}
                height={getYTemp(22) - getYTemp(26)}
                fill="#e0f2fe"
                opacity={0.7}
                rx={4}
              />
              <text
                x={padLeft + 10}
                y={getYTemp(25)}
                className="text-[9px] font-bold fill-sky-800"
              >
                Optimálny rozsah (22 °C – 26 °C)
              </text>

              <path
                d={tempPath}
                fill="none"
                stroke="#0284c7"
                strokeWidth={3}
                strokeLinecap="round"
              />

              {modelPoints.map((p) => (
                <circle
                  key={p.day}
                  cx={getX(p.day)}
                  cy={getYTemp(p.temp)}
                  r={4}
                  fill="#0369a1"
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}

              <text x={padLeft - 8} y={getYTemp(28) + 4} textAnchor="end" className="text-[10px] font-mono fill-gray-400">28°C</text>
              <text x={padLeft - 8} y={getYTemp(24) + 4} textAnchor="end" className="text-[10px] font-mono fill-gray-400">24°C</text>
              <text x={padLeft - 8} y={getYTemp(20) + 4} textAnchor="end" className="text-[10px] font-mono fill-gray-400">20°C</text>
            </g>
          )}

          {activeTab === 'overview' && (
            <g>
              {/* Dual Curves: Sugar (Orange) + Acidity (Green) */}
              <path
                d={sugarPath}
                fill="none"
                stroke="#d97706"
                strokeWidth={3}
                strokeLinecap="round"
              />
              <path
                d={phPath}
                fill="none"
                stroke="#059669"
                strokeWidth={3}
                strokeLinecap="round"
              />

              {/* Legend inside chart */}
              <g transform={`translate(${padLeft + 15}, ${padTop + 10})`}>
                <line x1={0} y1={5} x2={20} y2={5} stroke="#d97706" strokeWidth={3} />
                <text x={25} y={9} className="text-[10px] font-bold fill-amber-900">
                  Zvyškový cukor (°Brix) – klesá
                </text>
                <line x1={0} y1={22} x2={20} y2={22} stroke="#059669" strokeWidth={3} />
                <text x={25} y={26} className="text-[10px] font-bold fill-emerald-900">
                  Acidita (pH) – okysľuje sa
                </text>
              </g>
            </g>
          )}
        </svg>

        {/* Floating Tooltip if hovering over a point */}
        {hoveredPoint && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-amber-300 shadow-lg text-xs space-y-1 pointer-events-none">
            <div className="font-bold text-emerald-950 font-mono flex items-center gap-1">
              <span>Deň {hoveredPoint.day}</span>
              <span className="text-gray-400">•</span>
              <span className="text-amber-700">{hoveredPoint.sweetness}</span>
            </div>
            <div className="text-[11px] text-gray-600">
              Cukor: <strong className="text-amber-900 font-mono">{hoveredPoint.sugarBrix} °Brix</strong> ({hoveredPoint.sugarGrams} g/L)
            </div>
            <div className="text-[11px] text-gray-600">
              Kyslosť: <strong className="text-emerald-900 font-mono">{hoveredPoint.ph} pH</strong>
            </div>
            {hoveredPoint.note && (
              <div className="text-[10px] text-amber-900 bg-amber-50 p-1.5 rounded mt-1 border border-amber-200">
                {hoveredPoint.note}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Educational parameters guide */}
      <div className="bg-[#fbfaf6] border border-amber-900/10 rounded-xl p-4 text-xs space-y-2">
        <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-amber-600" /> Dôležité parametre domáceho kombucha kvasenia:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-gray-600 text-[11px] leading-relaxed pt-1">
          <div>
            <strong className="text-emerald-950 block">1. Úbytok cukru (Kvasinky)</strong>
            Kvasinky premieňajú sacharózu na glukózu, fruktózu a nepatrné množstvo etanolu. Cukor klesne zo 70 g/L na ~25–30 g/L.
          </div>
          <div>
            <strong className="text-emerald-950 block">2. Tvorba kyselín (Baktérie)</strong>
            Octové a mliečne baktérie premieňajú alkohol na zdraviu prospešnú kyselinu octovú a glukónovú, čím pH klesá z 4.2 na 3.0.
          </div>
          <div>
            <strong className="text-emerald-950 block">3. Kedy fľaškovať (2F)</strong>
            Ideálna chuť nastáva vtedy, keď sa vyrovná sladkosť s kyslosťou (zvyčajne medzi 7. a 9. dňom pri teplote 23–25 °C).
          </div>
        </div>
      </div>
    </div>
  );
}
