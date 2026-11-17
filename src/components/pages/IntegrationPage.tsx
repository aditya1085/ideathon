import React from 'react';
import {
  ArrowRight,
  Cpu,
  Database,
  LayoutDashboard,
  Radio,
  Router,
  ShieldCheck,
} from 'lucide-react';

export const IntegrationPage: React.FC = () => {
  const futureStages = [
    {
      step: '01',
      title: 'Physical Sensors',
      subtitle: 'Vibration and temperature sensors attached to real machines',
      tag: 'FUTURE PILOT',
      icon: Radio,
    },
    {
      step: '02',
      title: 'Controller / Gateway',
      subtitle: 'Edge device collecting and buffering live sensor packets',
      tag: 'FUTURE PILOT',
      icon: Router,
    },
    {
      step: '03',
      title: 'Secure Data Ingestion',
      subtitle: 'Encrypted MQTT or HTTPS stream sending data to SANKET+',
      tag: 'FUTURE PILOT',
      icon: ShieldCheck,
    },
    {
      step: '04',
      title: 'SANKET+',
      subtitle: 'Baseline comparison, early warning checks, and clear alerts',
      tag: 'ACTIVE IN PROTOTYPE',
      isCurrent: true,
      icon: Cpu,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#F5F4F2] rounded-2xl p-5 sm:p-6 space-y-2">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-[#D96B27]">
            CURRENT: Simulated Sensor Data
          </span>
          <span className="text-zinc-300" aria-hidden="true">·</span>
          <span className="font-medium text-zinc-500">
            FUTURE: Physical Sensors → Gateway → Secure Ingestion → SANKET+
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-[34px] font-bold tracking-tight text-zinc-900">
          Integration Preview
        </h1>
        <p className="text-sm sm:text-[15px] font-medium text-zinc-600 max-w-3xl leading-relaxed">
          SANKET+ currently runs as a software prototype using simulated sensor data. Physical sensors and factory gateways are planned for future pilot stages and are not connected in this demo.
        </p>
      </div>

      {/* Current vs Future Architecture Diagram */}
      <section
        aria-labelledby="arch-diagram-heading"
        className="bg-[#F5F4F2] rounded-2xl p-5 sm:p-6 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2
              id="arch-diagram-heading"
              className="font-display text-lg font-bold text-zinc-900"
            >
              Current Prototype vs. Future Pilot Pipeline
            </h2>
            <p className="text-xs font-medium text-zinc-500 mt-0.5">
              Clear separation between today’s software simulation and future hardware connection
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-[#D96B27] font-medium">● Current Prototype</span>
            <span className="text-zinc-500">○ Future Pilot Integration</span>
          </div>
        </div>

        {/* SVG Pipeline Illustration */}
        <div className="bg-white rounded-xl p-4 w-full overflow-x-auto">
          <svg
            viewBox="0 0 980 210"
            className="w-full min-w-[720px] h-auto block"
            role="img"
            aria-label="SANKET+ Current Simulated Input vs Future Physical Sensor Architecture"
          >
            {/* CURRENT: Simulated Sensor Data */}
            <rect
              x="524"
              y="14"
              width="224"
              height="46"
              rx="10"
              fill="#FFF7ED"
              stroke="#D96B27"
              strokeWidth="1.5"
            />
            <text
              x="636"
              y="33"
              textAnchor="middle"
              className="fill-[#9A3412] font-sans text-[11px] font-semibold"
            >
              CURRENT: Simulated Sensor Data
            </text>
            <text
              x="636"
              y="49"
              textAnchor="middle"
              className="fill-[#C05A1B] font-sans text-[10px]"
            >
              In-browser simulation engine
            </text>
            <path
              d="M636 60 V94"
              stroke="#D96B27"
              strokeWidth="1.75"
              strokeDasharray="4 3"
            />
            <polygon points="632,90 640,90 636,98" fill="#D96B27" />

            {/* FUTURE Pipeline Nodes */}
            {[
              { x: 16, label: 'Physical Sensors', sub: 'Vibration & Temp', future: true },
              { x: 204, label: 'Controller / Gateway', sub: 'ESP32 / Edge Node', future: true },
              { x: 392, label: 'Secure Data Ingestion', sub: 'MQTT / HTTPS TLS', future: true },
              { x: 580, label: 'SANKET+ Engine', sub: 'Baselines & Rules', future: false },
              { x: 768, label: 'Dashboard & Alerts', sub: 'Operator Console', future: false },
            ].map((node, idx) => (
              <g key={node.label}>
                <rect
                  x={node.x}
                  y="102"
                  width="170"
                  height="82"
                  rx="10"
                  fill={node.future ? '#F5F4F2' : '#FFFFFF'}
                  stroke={node.future ? '#D4D4D8' : '#2563EB'}
                  strokeWidth={node.future ? '1.25' : '1.75'}
                  strokeDasharray={node.future ? '5 3' : undefined}
                />
                <text
                  x={node.x + 85}
                  y="130"
                  textAnchor="middle"
                  className="fill-zinc-900 font-sans text-[12px] font-semibold"
                >
                  {node.label}
                </text>
                <text
                  x={node.x + 85}
                  y="148"
                  textAnchor="middle"
                  className="fill-zinc-500 font-sans text-[10.5px]"
                >
                  {node.sub}
                </text>
                <text
                  x={node.x + 85}
                  y="170"
                  textAnchor="middle"
                  className={`font-sans text-[9.5px] font-semibold ${
                    node.future ? 'fill-zinc-500' : 'fill-blue-700'
                  }`}
                >
                  {node.future ? 'FUTURE PILOT ONLY' : 'ACTIVE IN PROTOTYPE'}
                </text>

                {idx < 4 && (
                  <g>
                    <line
                      x1={node.x + 172}
                      y1="143"
                      x2={node.x + 184}
                      y2="143"
                      stroke="#A1A1AA"
                      strokeWidth="1.5"
                    />
                    <polygon
                      points={`${node.x + 181},139 ${node.x + 181},147 ${
                        node.x + 187
                      },143`}
                      fill="#A1A1AA"
                    />
                  </g>
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Stage Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {futureStages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div key={stage.step} className="bg-white rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      stage.isCurrent
                        ? 'bg-orange-50 text-[#D96B27]'
                        : 'bg-[#F5F4F2] text-zinc-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  {idx < futureStages.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-300 hidden md:block" />
                  )}
                </div>
                <div
                  className={`text-[10px] font-semibold ${
                    stage.isCurrent ? 'text-[#D96B27]' : 'text-zinc-500'
                  }`}
                >
                  {stage.tag}
                </div>
                <div className="text-xs font-semibold text-zinc-900">
                  {stage.title}
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {stage.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pilot Interface Readiness Specification */}
      <section className="bg-[#F5F4F2] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-zinc-700" aria-hidden="true" />
          <h2 className="font-display text-lg font-bold text-zinc-900">
            Implementation Status Summary
          </h2>
        </div>

        <div className="bg-white rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[11px] font-semibold text-zinc-500">
                <th className="py-2.5 px-4">Component</th>
                <th className="py-2.5 px-4">Role in SANKET+</th>
                <th className="py-2.5 px-4">Prototype Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              <tr>
                <td className="py-3 px-4 font-medium text-zinc-900">
                  Simulated Sensor Engine
                </td>
                <td className="py-3 px-4 text-zinc-600">
                  Generates vibration (mm/s), temperature (°C), and fault scenarios in-browser
                </td>
                <td className="py-3 px-4 text-[#D96B27] font-medium">
                  CURRENT: Implemented (Simulated)
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-zinc-900">
                  Physical Sensors & Gateway
                </td>
                <td className="py-3 px-4 text-zinc-600">
                  Field accelerometers, temperature probes, and ESP32 / industrial gateway
                </td>
                <td className="py-3 px-4 text-zinc-500">
                  FUTURE: Not connected in prototype
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-zinc-900">
                  Secure Data Ingestion
                </td>
                <td className="py-3 px-4 text-zinc-600">
                  TLS-authenticated MQTT / HTTPS telemetry ingestion service
                </td>
                <td className="py-3 px-4 text-zinc-500">
                  FUTURE: Planned for pilot stage
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-zinc-900">
                  <span className="inline-flex items-center gap-1.5">
                    <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                    SANKET+ Rules & Console
                  </span>
                </td>
                <td className="py-3 px-4 text-zinc-600">
                  Operator baseline workflow, persistence checks, and explainable alert history
                </td>
                <td className="py-3 px-4 text-blue-700 font-medium">
                  CURRENT: Active in browser
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
