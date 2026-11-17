import React, { useMemo, useState } from 'react';
import { Machine } from '../../types/sanket';
import { formatTimestamp } from '../../utils/formatters';

interface ConditionChartsProps {
  machine: Machine;
  height?: number;
  showBaselineBand?: boolean;
}

interface SingleMetricChartProps {
  title: string;
  unit: string;
  strokeColor: string;
  bandColor: string;
  values: (number | null)[];
  timestamps: string[];
  baselineMin: number;
  baselineMax: number;
  hoveredIndex: number | null;
  onHoverIndex: (idx: number | null) => void;
  decimals: number;
  height: number;
  showBaselineBand: boolean;
}

const SingleMetricChart: React.FC<SingleMetricChartProps> = ({
  title,
  unit,
  strokeColor,
  bandColor,
  values,
  timestamps,
  baselineMin,
  baselineMax,
  hoveredIndex,
  onHoverIndex,
  decimals,
  height,
  showBaselineBand,
}) => {
  const width = 620;
  const padLeft = 46;
  const padRight = 16;
  const padTop = 14;
  const padBottom = 26;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const { minY, maxY, yTicks, segments, points } = useMemo(() => {
    const valid = values.filter((v): v is number => v !== null);
    const allNumbers = [...valid, baselineMin, baselineMax];
    const rawMin = allNumbers.length ? Math.min(...allNumbers) : 0;
    const rawMax = allNumbers.length ? Math.max(...allNumbers) : 10;
    const span = Math.max(0.5, rawMax - rawMin);
    const yMin = Math.max(0, rawMin - span * 0.2);
    const yMax = rawMax + span * 0.22;

    const toX = (i: number) =>
      values.length <= 1 ? padLeft + plotW / 2 : padLeft + (i / (values.length - 1)) * plotW;
    const toY = (v: number) =>
      padTop + plotH - ((v - yMin) / Math.max(0.001, yMax - yMin)) * plotH;

    const segs: string[] = [];
    let currentSeg: string[] = [];
    const pts: Array<{ x: number; y: number | null; value: number | null; ts: string; index: number }> = [];

    values.forEach((val, idx) => {
      const x = toX(idx);
      if (val === null) {
        if (currentSeg.length > 0) {
          segs.push(currentSeg.join(' '));
          currentSeg = [];
        }
        pts.push({ x, y: null, value: null, ts: timestamps[idx], index: idx });
      } else {
        const y = toY(val);
        currentSeg.push(`${x.toFixed(1)},${y.toFixed(1)}`);
        pts.push({ x, y, value: val, ts: timestamps[idx], index: idx });
      }
    });
    if (currentSeg.length > 0) {
      segs.push(currentSeg.join(' '));
    }

    const ticks = [0, 0.33, 0.66, 1].map((t) => {
      const val = yMin + (yMax - yMin) * (1 - t);
      return { y: padTop + plotH * t, label: val.toFixed(decimals === 2 ? 1 : 0) };
    });

    return { minY: yMin, maxY: yMax, yTicks: ticks, segments: segs, points: pts };
  }, [values, timestamps, baselineMin, baselineMax, plotW, plotH, decimals]);

  const bandTopY =
    padTop + plotH - ((baselineMax - minY) / Math.max(0.001, maxY - minY)) * plotH;
  const bandBottomY =
    padTop + plotH - ((baselineMin - minY) / Math.max(0.001, maxY - minY)) * plotH;
  const bandHeight = Math.max(2, bandBottomY - bandTopY);

  const latestVal = [...values].reverse().find((v) => v !== null) ?? null;
  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;
  const displayVal = hoveredPoint ? hoveredPoint.value : latestVal;

  const firstTs = timestamps[0] ? formatTimestamp(timestamps[0]) : '--';
  const midTs = timestamps[Math.floor(timestamps.length / 2)]
    ? formatTimestamp(timestamps[Math.floor(timestamps.length / 2)])
    : '--';
  const lastTs = timestamps[timestamps.length - 1]
    ? formatTimestamp(timestamps[timestamps.length - 1])
    : '--';

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-xs shrink-0"
            style={{ backgroundColor: strokeColor }}
            aria-hidden="true"
          />
          <span className="text-xs font-semibold text-slate-800">{title}</span>
          {showBaselineBand && (
            <span className="text-[11px] text-slate-500">
              · Baseline {baselineMin.toFixed(decimals)}–{baselineMax.toFixed(decimals)} {unit}
            </span>
          )}
        </div>
        <div className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
          {displayVal !== null ? `${displayVal.toFixed(decimals)} ${unit}` : `No Signal`}
          {hoveredPoint && (
            <span className="ml-2 font-normal text-slate-500">
              ({formatTimestamp(hoveredPoint.ts)})
            </span>
          )}
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto block select-none"
          onMouseLeave={() => onHoverIndex(null)}
          role="img"
          aria-label={`${title} simulated time-series chart`}
        >
          {/* Horizontal grid lines & Y axis labels */}
          {yTicks.map((t, i) => (
            <g key={i}>
              <line
                x1={padLeft}
                y1={t.y}
                x2={width - padRight}
                y2={t.y}
                stroke="#E2E8F0"
                strokeWidth="1"
              />
              <text
                x={padLeft - 8}
                y={t.y + 3.5}
                textAnchor="end"
                className="fill-slate-400 font-mono text-[10px]"
              >
                {t.label}
              </text>
            </g>
          ))}

          {/* Learned baseline envelope band */}
          {showBaselineBand && (
            <rect
              x={padLeft}
              y={Math.max(padTop, bandTopY)}
              width={plotW}
              height={Math.min(plotH, bandHeight)}
              fill={bandColor}
              opacity="0.16"
            />
          )}

          {/* Data line segments */}
          {segments.map((pts, idx) => (
            <polyline
              key={idx}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pts}
            />
          ))}

          {/* Data points & hover column */}
          {points.map((pt) => {
            const isHovered = hoveredIndex === pt.index;
            return (
              <g key={pt.index}>
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={padTop}
                    x2={pt.x}
                    y2={padTop + plotH}
                    stroke="#94A3B8"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                )}
                {pt.y !== null && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 4 : 2.2}
                    fill={isHovered ? '#0F172A' : strokeColor}
                    stroke="#FFFFFF"
                    strokeWidth={isHovered ? 1.5 : 1}
                  />
                )}
                <rect
                  x={pt.x - plotW / Math.max(1, points.length * 2)}
                  y={padTop}
                  width={plotW / Math.max(1, points.length)}
                  height={plotH}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => onHoverIndex(pt.index)}
                />
              </g>
            );
          })}

          {/* X-axis timestamps */}
          <text x={padLeft} y={height - 6} textAnchor="start" className="fill-slate-400 font-mono text-[10px]">
            {firstTs}
          </text>
          <text
            x={padLeft + plotW / 2}
            y={height - 6}
            textAnchor="middle"
            className="fill-slate-400 font-mono text-[10px]"
          >
            {midTs}
          </text>
          <text
            x={width - padRight}
            y={height - 6}
            textAnchor="end"
            className="fill-slate-400 font-mono text-[10px]"
          >
            {lastTs}
          </text>
        </svg>
      </div>
    </div>
  );
};

export const ConditionCharts: React.FC<ConditionChartsProps> = ({
  machine,
  height = 152,
  showBaselineBand = true,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const timestamps = useMemo(
    () => machine.readings.map((r) => r.timestamp),
    [machine.readings]
  );
  const vibValues = useMemo(
    () => machine.readings.map((r) => r.vibrationMmS),
    [machine.readings]
  );
  const tempValues = useMemo(
    () => machine.readings.map((r) => r.temperatureC),
    [machine.readings]
  );

  return (
    <div className="space-y-5">
      <SingleMetricChart
        title="Vibration RMS"
        unit="mm/s"
        strokeColor="#2563EB"
        bandColor="#3B82F6"
        values={vibValues}
        timestamps={timestamps}
        baselineMin={machine.fingerprint.vibrationMinMmS}
        baselineMax={machine.fingerprint.vibrationMaxMmS}
        hoveredIndex={hoveredIndex}
        onHoverIndex={setHoveredIndex}
        decimals={2}
        height={height}
        showBaselineBand={showBaselineBand}
      />
      <div className="border-t border-slate-100 pt-4">
        <SingleMetricChart
          title="Operating Temperature"
          unit="°C"
          strokeColor="#D97706"
          bandColor="#F59E0B"
          values={tempValues}
          timestamps={timestamps}
          baselineMin={machine.fingerprint.temperatureMinC}
          baselineMax={machine.fingerprint.temperatureMaxC}
          hoveredIndex={hoveredIndex}
          onHoverIndex={setHoveredIndex}
          decimals={1}
          height={height}
          showBaselineBand={showBaselineBand}
        />
      </div>
    </div>
  );
};
