import React, { useState } from 'react';
import { Bell, Check, Info, RotateCcw, Sliders, User } from 'lucide-react';
import { useSanket } from '../../context/SanketContext';
import { SensitivityLevel } from '../../types/sanket';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetDemoData } = useSanket();
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Configure demo operator profile, prototype notification preferences, and anomaly monitoring sensitivity.
        </p>
      </div>

      {/* Demo Operator Profile */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-5"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-700" aria-hidden="true" />
            <h2 className="font-display text-base font-semibold text-slate-900">
              Demo Operator Profile
            </h2>
          </div>
          {savedNotice && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
              <Check className="w-3.5 h-3.5" />
              Saved locally
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="operator-name"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              Operator Display Name
            </label>
            <input
              id="operator-name"
              type="text"
              value={settings.operatorName}
              onChange={(e) => updateSettings({ operatorName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label
              htmlFor="operator-role"
              className="block text-xs font-medium text-slate-600 mb-1.5"
            >
              Role Label
            </label>
            <input
              id="operator-role"
              type="text"
              value={settings.operatorRole}
              onChange={(e) => updateSettings({ operatorRole: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Save Profile Preferences
          </button>
        </div>
      </form>

      {/* Monitoring Sensitivity */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Sliders className="w-4 h-4 text-amber-600" aria-hidden="true" />
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Monitoring Sensitivity
            </h2>
            <p className="text-xs text-slate-500">
              Adjusts how tightly SANKET+ flags simulated deviations outside each machine’s Health Fingerprint.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(
            [
              {
                level: 'Low' as SensitivityLevel,
                desc: 'Tolerates wider load fluctuations before raising alerts.',
              },
              {
                level: 'Standard' as SensitivityLevel,
                desc: 'Balanced early-warning thresholds for typical rotating machinery.',
              },
              {
                level: 'High' as SensitivityLevel,
                desc: 'Flags subtle upward vibration or thermal drift immediately.',
              },
            ] as const
          ).map((item) => {
            const active = settings.sensitivity === item.level;
            return (
              <button
                key={item.level}
                type="button"
                onClick={() => updateSettings({ sensitivity: item.level })}
                className={`p-4 rounded-xl border text-left transition-colors ${
                  active
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="text-sm font-semibold">{item.level}</div>
                <p
                  className={`mt-1 text-xs leading-relaxed ${
                    active ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Bell className="w-4 h-4 text-blue-600" aria-hidden="true" />
          <h2 className="font-display text-base font-semibold text-slate-900">
            Notification Preferences
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          <label className="py-3 flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <div className="text-sm font-medium text-slate-900">
                In-App Alert Notifications
              </div>
              <div className="text-xs text-slate-500">
                Display active simulated inspection alerts in the header notification drawer.
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.inAppNotifications}
              onChange={(e) =>
                updateSettings({ inAppNotifications: e.target.checked })
              }
              className="w-4 h-4 accent-amber-600"
            />
          </label>

          <label className="py-3 flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <div className="text-sm font-medium text-slate-900">
                Observation-to-Alert Escalation
              </div>
              <div className="text-xs text-slate-500">
                Escalate sustained drift from Under Observation to Critical Inspection Alert.
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.warningEscalation}
              onChange={(e) =>
                updateSettings({ warningEscalation: e.target.checked })
              }
              className="w-4 h-4 accent-amber-600"
            />
          </label>

          <label className="py-3 flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <div className="text-sm font-medium text-slate-900">
                Daily Summary Digest (Prototype Placeholder)
              </div>
              <div className="text-xs text-slate-500">
                External email delivery will be enabled during pilot deployment.
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.emailDigestPreview}
              onChange={(e) =>
                updateSettings({ emailDigestPreview: e.target.checked })
              }
              className="w-4 h-4 accent-amber-600"
            />
          </label>
        </div>
      </section>

      {/* Application Information & Reset */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Info className="w-4 h-4 text-slate-700" aria-hidden="true" />
          <h2 className="font-display text-base font-semibold text-slate-900">
            Application Information
          </h2>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <dt className="text-slate-500">Platform Name</dt>
            <dd className="font-semibold text-slate-900 mt-0.5">
              SANKET+ — Smart ANomaly & Knowledge-based Early Tracking
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Tagline</dt>
            <dd className="font-medium text-slate-900 mt-0.5">
              More than a warning.
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Environment Truth</dt>
            <dd className="text-slate-700 mt-0.5">
              Software prototype operating on simulated sensor data (persisted locally in browser storage).
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Hardware Status</dt>
            <dd className="text-slate-700 mt-0.5">
              Physical sensor & ESP32 gateway integration scheduled for future pilot stage.
            </dd>
          </div>
        </dl>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Restore initial 3 machines (2 Healthy, 1 Under Observation, 0 Active Alerts).
          </span>
          <button
            type="button"
            onClick={resetDemoData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 whitespace-nowrap self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo State</span>
          </button>
        </div>
      </section>
    </div>
  );
};
