import { useState, useEffect } from 'react'

function calc(entry, stop, target) {
  const e = parseFloat(entry), s = parseFloat(stop), t = parseFloat(target)
  if (!e || !s || !t || e <= 0 || isNaN(e) || isNaN(s) || isNaN(t)) return null
  const risk   = Math.abs(e - s)
  const reward = Math.abs(t - e)
  if (risk === 0) return null
  return {
    risk,
    reward,
    rrr:       reward / risk,
    riskPct:   (risk / e) * 100,
    rewardPct: (reward / e) * 100,
  }
}

function rrrColor(rrr) {
  if (rrr >= 3) return '#00c896'
  if (rrr >= 2) return '#2d7eff'
  if (rrr >= 1) return '#f5a623'
  return '#ff3358'
}

function rrrLabel(rrr) {
  if (rrr >= 3) return 'Excellent'
  if (rrr >= 2) return 'Good'
  if (rrr >= 1) return 'Acceptable'
  return 'Poor'
}

const FIELDS = [
  { key: 'entry',  label: 'Entry'  },
  { key: 'stop',   label: 'Stop'   },
  { key: 'target', label: 'Target' },
]

// ── Shared panel content (inputs + results) ───────────────────────────────────
function PanelContent({ values, setValues, result }) {
  const set = key => e => setValues(v => ({ ...v, [key]: e.target.value }))

  return (
    <div className="space-y-3">
      {FIELDS.map(({ key, label }) => (
        <div key={key}>
          <label className="block text-t3 text-[10px] font-semibold uppercase tracking-wider mb-1">
            {label}
          </label>
          <input
            type="number"
            step="any"
            min="0"
            value={values[key]}
            onChange={set(key)}
            placeholder="0.00"
            className="rrr-input"
          />
        </div>
      ))}

      <div className="pt-2 border-t border-line">
        {result ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-dim rounded-lg px-3 py-2">
              <span className="text-t3 text-[11px]">Risk / Reward</span>
              <div className="text-right">
                <div className="text-[15px] font-bold font-mono tabular-nums"
                  style={{ color: rrrColor(result.rrr) }}>
                  1:{result.rrr.toFixed(2)}
                </div>
                <div className="text-[10px] font-semibold" style={{ color: rrrColor(result.rrr) }}>
                  {rrrLabel(result.rrr)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'Risk $',   value: `$${result.risk.toFixed(2)}`,      color: '#ff3358' },
                { label: 'Reward $', value: `$${result.reward.toFixed(2)}`,    color: '#00c896' },
                { label: '% Risk',   value: `${result.riskPct.toFixed(2)}%`,   color: '#ff3358' },
                { label: '% Reward', value: `${result.rewardPct.toFixed(2)}%`, color: '#00c896' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-dim rounded-lg px-2 py-1.5 text-center">
                  <div className="text-[10px] text-t3 mb-0.5">{label}</div>
                  <div className="text-[11px] font-mono font-bold tabular-nums" style={{ color }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-t3 text-[11px] py-2">
            Enter entry, stop &amp; target
          </div>
        )}
      </div>

      {(values.entry || values.stop || values.target) && (
        <button
          onClick={() => setValues({ entry: '', stop: '', target: '' })}
          className="w-full text-[10px] text-t3 hover:text-t2 py-1 transition-colors duration-150"
        >
          Clear
        </button>
      )}
    </div>
  )
}

export default function RRRCalculator() {
  // Desktop: persisted open state (defaults true)
  const [open, setOpen] = useState(() => {
    try { return localStorage.getItem('rrr-open') !== 'false' } catch { return true }
  })
  // Mobile: always starts closed (non-intrusive)
  const [mobileOpen, setMobileOpen] = useState(false)

  const [values, setValues] = useState({ entry: '', stop: '', target: '' })

  useEffect(() => {
    try { localStorage.setItem('rrr-open', String(open)) } catch {}
  }, [open])

  const result = calc(values.entry, values.stop, values.target)

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          DESKTOP  (sm and above) — 100% original, untouched
      ══════════════════════════════════════════════════════════ */}
      <div
        className="hidden sm:block fixed bottom-5 right-5 z-50 w-[220px]"
        style={{ filter: 'drop-shadow(0 8px 40px rgba(0,0,0,0.6))' }}
      >
        {/* Toggle */}
        <button
          onClick={() => setOpen(o => !o)}
          className={`w-full flex items-center justify-between bg-card border border-line px-4 py-2.5
            hover:border-t3 hover:bg-hover transition-all duration-150
            ${open ? 'rounded-t-xl' : 'rounded-xl'}`}
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-t1">
              RRR Calc
            </span>
          </div>
          <div className="flex items-center gap-2">
            {result && (
              <span className="text-[11px] font-mono font-bold" style={{ color: rrrColor(result.rrr) }}>
                1:{result.rrr.toFixed(1)}
              </span>
            )}
            <svg className={`w-3 h-3 text-t3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Panel */}
        {open && (
          <div className="bg-card border border-t-0 border-line rounded-b-xl p-4">
            <PanelContent values={values} setValues={setValues} result={result} />
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          MOBILE  (below sm) — compact FAB, tap to expand
      ══════════════════════════════════════════════════════════ */}
      <div className="sm:hidden fixed bottom-5 right-4 z-50">
        {/* Expanded panel — floats above the FAB */}
        {mobileOpen && (
          <div
            className="absolute bottom-14 right-0 w-[200px] bg-card border border-line rounded-xl p-4 card-enter"
            style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.7)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-t1">RRR Calc</span>
              </div>
              {result && (
                <span className="text-[11px] font-mono font-bold" style={{ color: rrrColor(result.rrr) }}>
                  1:{result.rrr.toFixed(1)}
                </span>
              )}
            </div>
            <PanelContent values={values} setValues={setValues} result={result} />
          </div>
        )}

        {/* FAB button */}
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="w-11 h-11 rounded-full bg-card border border-line flex items-center justify-center transition-all duration-150 hover:border-t3 active:scale-95"
          style={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            borderColor: mobileOpen ? 'rgba(45,126,255,0.5)' : undefined,
          }}
          aria-label="RRR Calculator"
        >
          {mobileOpen ? (
            /* Close × */
            <svg className="w-4 h-4 text-t2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            /* Calculator icon */
            <svg className="w-4 h-4 text-t2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h8M8 10h2m4 0h2M8 14h2m4 0h2M8 18h2m4 0h2" />
            </svg>
          )}
        </button>
      </div>
    </>
  )
}
