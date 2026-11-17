import React, { useState } from 'react';
import { Bell, Check, Info, RotateCcw, Sliders, User } from 'lucide-react';
import { getSensitivityRules, useSanket } from '../../context/SanketContext';
import { SensitivityLevel } from '../../types/sanket';
import { InfoTooltip } from '../common/InfoTooltip';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetDemoData } = useSanket();
  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmingResetAll, setConfirmingResetAll] = useState(false);

  const activeRules = getSensitivityRules(settings.sensitivity);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      operatorName: settings.operatorName.trim() || 'Demo Operator',
      operatorRole: settings.operatorRole.trim() || 'Condition Monitoring Reviewer',
    });
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2200);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-3xl sm:text-[34px] font-bold tracking-tight text-zinc-900">
          Settings
        </h1>
        <p className="mt-1.5 text-sm sm:text-[15px] font-medium text-zinc-600">
          Update the demo operator profile, adjust how sensitive alerts are, or reset the demo.
        </p>
      </div>

      {/* Demo Operator Profile */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-[#F5F4F2] rounded-2xl p-5 sm:p-6 space-y-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-zinc-700" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold text-zinc-900">
              Demo Operator Profile
            </h2>
          </div>
          {savedNotice && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-white px-3 py-1 rounded-full">
              <Check className="w-3.5 h-3.5" />
              Saved locally
            </span>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="operator-name"
                className="block text-xs font-medium text-zinc-600 mb-1.5"
              >
                Operator Display Name
              </label>
              <input
                id="operator-name"
                type="text"
                value={settings.operatorName}
                onChange={(e) => updateSettings({ operatorName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-[#F5F4F2] rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#D96B27]/40"
              />
            </div>

            <div>
              <label
                htmlFor="operator-role"
                className="block text-xs font-medium text-zinc-600 mb-1.5"
              >
                Role Label
              </label>
              <input
                id="operator-role"
                type="text"
                value={settings.operatorRole}
                onChange={(e) => updateSettings({ operatorRole: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-[#F5F4F2] rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#D96B27]/40"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-full text-xs font-medium bg-[#D96B27] text-white hover:bg-[#C05A1B] transition-colors"
            >
              Save Profile Preferences
            </button>
          </div>
        </div>
      </form>

      {/* Monitoring Sensitivity & Transparent Rules */}
      <section className="bg-[#F5F4F2] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#D96B27]" aria-hidden="true" />
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-display text-lg font-bold text-zinc-900">
                Anomaly Detection Sensitivity
              </h2>
              <InfoTooltip
                label="Transparent Rule Thresholds"
                explanation="Sensitivity adjusts the margin above each machine's baseline ceiling and the number of consecutive readings required before escalating."
              />
            </div>
            <p className="text-xs font-medium text-zinc-500">
              Controls how fast warnings appear when readings climb above a machine’s normal range.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(
            [
              {
                level: 'Low' as SensitivityLevel,
                desc: 'Wider tolerance (+25% margin, 3 readings for WARNING, 5 for CRITICAL).',
              },
              {
                level: 'Standard' as SensitivityLevel,
                desc: 'Balanced early-warning (+15% margin, 2 readings for WARNING, 4 for CRITICAL).',
              },
              {
                level: 'High' as SensitivityLevel,
                desc: 'Tighter detection (+8% margin, 2 readings for WARNING, 3 for CRITICAL).',
              },
            ] as const
          ).map((item) => {
            const active = settings.sensitivity === item.level;
            return (
              <button
                key={item.level}
                type="button"
                onClick={() => updateSettings({ sensitivity: item.level })}
                className={`p-4 rounded-xl text-left transition-colors ${
                  active
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white text-zinc-800 hover:bg-zinc-50'
                }`}
              >
                <div className="text-sm font-semibold">{item.level}</div>
                <p
                  className={`mt-1 text-xs leading-relaxed ${
                    active ? 'text-zinc-300' : 'text-zinc-500'
                  }`}
                >
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <div className="text-zinc-500">WARNING Margin</div>
              <div className="font-semibold text-zinc-900 tabular-nums mt-0.5">
                +{Math.round(activeRules.warningMarginFactor * 100)}% of band
              </div>
            </div>
            <div>
              <div className="text-zinc-500">CRITICAL Margin</div>
              <div className="font-semibold text-zinc-900 tabular-nums mt-0.5">
                +{Math.round(activeRules.criticalMarginFactor * 100)}% of band
              </div>
            </div>
            <div>
              <div className="text-zinc-500">WARNING Persistence</div>
              <div className="font-semibold text-zinc-900 tabular-nums mt-0.5">
                {activeRules.warningPersistence} readings
              </div>
            </div>
            <div>
              <div className="text-zinc-500">CRITICAL Persistence</div>
              <div className="font-semibold text-zinc-900 tabular-nums mt-0.5">
                {activeRules.criticalPersistence} readings
              </div>
            </div>
          </div>

          <label className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <div className="text-sm font-medium text-zinc-900">
                Combine Vibration & Temperature Checks
              </div>
              <div className="text-xs text-zinc-500">
                Escalate to CRITICAL when both vibration and temperature stay high together.
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.correlateVibAndTemp}
              onChange={(e) =>
                updateSettings({ correlateVibAndTemp: e.target.checked })
              }
              className="w-4 h-4 accent-[#D96B27]"
            />
          </label>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="bg-[#F5F4F2] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600" aria-hidden="true" />
          <h2 className="font-display text-lg font-bold text-zinc-900">
            Notification Preferences
          </h2>
        </div>

        <div className="bg-white rounded-xl divide-y divide-zinc-100 px-4 sm:px-5">
          <label className="py-3.5 flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <div className="text-sm font-semibold text-zinc-900">
                In-App Alert Notifications
              </div>
              <div className="text-xs text-zinc-500">
                Show active inspection alerts in the top-right bell drawer.
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.inAppNotifications}
              onChange={(e) =>
                updateSettings({ inAppNotifications: e.target.checked })
              }
              className="w-4 h-4 accent-[#D96B27]"
            />
          </label>

          <label className="py-3.5 flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <div className="text-sm font-semibold text-zinc-900">
                WARNING-to-CRITICAL Persistence Escalation
              </div>
              <div className="text-xs text-zinc-500">
                Allow sustained high readings to escalate from WARNING to CRITICAL alerts.
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.warningEscalation}
              onChange={(e) =>
                updateSettings({ warningEscalation: e.target.checked })
              }
              className="w-4 h-4 accent-[#D96B27]"
            />
          </label>

          <label className="py-3.5 flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <div className="text-sm font-semibold text-zinc-900">
                Daily Summary Digest (Future Pilot Preference)
              </div>
              <div className="text-xs text-zinc-500">
                Saved locally as a preference; no external email service is connected in this prototype.
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.emailDigestPreview}
              onChange={(e) =>
                updateSettings({ emailDigestPreview: e.target.checked })
              }
              className="w-4 h-4 accent-[#D96B27]"
            />
          </label>
        </div>
      </section>

      {/* Application Information & Reset */}
      <section className="bg-[#F5F4F2] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-zinc-700" aria-hidden="true" />
          <h2 className="font-display text-lg font-bold text-zinc-900">
            About SANKET+
          </h2>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 space-y-4">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <dt className="text-zinc-500">Platform Name</dt>
              <dd className="font-semibold text-zinc-900 mt-0.5">
                SANKET+ — Smart ANomaly & Knowledge-based Early Tracking
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Tagline</dt>
              <dd className="font-medium text-zinc-900 mt-0.5">
                More than a warning.
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Prototype Mode</dt>
              <dd className="text-zinc-700 mt-0.5">
                Standalone software prototype using simulated sensor data and rule-based logic (saved in browser localStorage).
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Hardware Status</dt>
              <dd className="text-zinc-700 mt-0.5">
                Physical sensors and gateway ingestion are planned for future pilot deployment.
              </dd>
            </div>
          </dl>

          <div className="pt-4 border-t border-zinc-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-zinc-500">
                Restore initial 3 machines (2 NORMAL, 1 WARNING, 0 Active Alerts) and demonstration baselines.
              </span>
              {!confirmingResetAll && (
                <button
                  type="button"
                  onClick={() => setConfirmingResetAll(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border border-zinc-200 text-zinc-700 hover:bg-[#F5F4F2] whitespace-nowrap self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo State</span>
                </button>
              )}
            </div>

            {confirmingResetAll && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-red-900">
                  Reset all simulated machines, learned baselines, alert history, and settings to defaults?
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      resetDemoData();
                      setConfirmingResetAll(false);
                    }}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-red-700 text-white hover:bg-red-800"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingResetAll(false)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
