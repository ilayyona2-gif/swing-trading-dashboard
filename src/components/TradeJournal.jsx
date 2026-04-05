import { useState, useEffect } from 'react'

// ── Theme constants (matching tailwind.config tokens) ─────────────────────────
const C = {
  card:   '#0b1220',
  dim:    '#0d1d30',
  hover:  '#0f1b2d',
  line:   '#1a2e47',
  t1:     '#dce9f8',
  t2:     '#627b96',
  t3:     '#2d4255',
  up:     '#00c896',
  down:   '#ff3358',
  warn:   '#f5a623',
  accent: '#2d7eff',
}

const STATUS_CFG = {
  Open: { color: C.t2,   bg: 'rgba(98,123,150,0.12)',  label: 'Open'  },
  Won:  { color: C.up,   bg: 'rgba(0,200,150,0.12)',   label: 'Won'   },
  Lost: { color: C.down, bg: 'rgba(255,51,88,0.12)',   label: 'Lost'  },
}

// ── localStorage helpers ──────────────────────────────────────────────────────
const STORAGE_KEY = 'swing_scanner_trades_v1'

function loadTrades() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}
function saveTrades(trades) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trades))
}

// ── RRR calculation ───────────────────────────────────────────────────────────
function calcRRR(entry, stop, target) {
  const e = parseFloat(entry), s = parseFloat(stop), t = parseFloat(target)
  if (!e || !s || !t || e === s) return null
  const risk   = Math.abs(e - s)
  const reward = Math.abs(t - e)
  return reward / risk
}

// ── Input component ───────────────────────────────────────────────────────────
function Field({ label, type = 'text', value, onChange, placeholder, style }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.t3 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        step="any"
        className="rounded-lg px-3 py-2 text-[13px] font-mono outline-none transition-colors"
        style={{
          background: C.dim,
          border: `1px solid ${C.line}`,
          color: C.t1,
          ...style,
        }}
        onFocus={e  => e.target.style.borderColor = C.accent}
        onBlur={e   => e.target.style.borderColor = C.line}
      />
    </div>
  )
}

// ── Add Trade form ────────────────────────────────────────────────────────────
function AddTradeForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({
    ticker: '', entry: '', stop: '', target: '', status: 'Open', notes: '',
  })

  const f = k => v => setForm(p => ({ ...p, [k]: v }))
  const rrr = calcRRR(form.entry, form.stop, form.target)

  const rrrColor =
    rrr == null  ? C.t3 :
    rrr >= 3     ? C.up :
    rrr >= 2     ? C.warn :
    rrr >= 1     ? C.accent :
                   C.down

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.ticker.trim() || !form.entry || !form.stop || !form.target) return
    onAdd({
      id:     Date.now(),
      date:   new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      ticker: form.ticker.trim().toUpperCase(),
      entry:  parseFloat(form.entry),
      stop:   parseFloat(form.stop),
      target: parseFloat(form.target),
      rrr,
      status: form.status,
      notes:  form.notes.trim(),
    })
  }

  return (
    <div
      className="rounded-xl p-5 mb-5 card-enter"
      style={{ background: C.card, border: `1px solid ${C.line}` }}
    >
      <div className="text-[13px] font-semibold mb-4" style={{ color: C.t1 }}>
        Log New Trade
      </div>

      <form onSubmit={handleSubmit}>
        {/* Row 1: Ticker + Status + RRR display */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <Field label="Ticker" value={form.ticker} onChange={v => f('ticker')(v.toUpperCase())} placeholder="AAPL" />
          <Field label="Entry Price" type="number" value={form.entry} onChange={f('entry')} placeholder="195.00" />
          <Field label="Stop Loss"   type="number" value={form.stop}  onChange={f('stop')}  placeholder="190.00" />
          <Field label="Take Profit" type="number" value={form.target} onChange={f('target')} placeholder="205.00" />
        </div>

        {/* Row 2: Status + RRR display + Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {/* Status selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.t3 }}>
              Status
            </label>
            <div className="flex gap-2 h-[38px] items-center">
              {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => f('status')(key)}
                  className="px-3 py-1 rounded-lg text-[11px] font-bold transition-all"
                  style={form.status === key
                    ? { color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}40` }
                    : { color: C.t3,      background: 'transparent', border: `1px solid ${C.line}` }
                  }
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          {/* Live RRR display */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.t3 }}>
              Risk / Reward
            </label>
            <div
              className="rounded-lg px-3 flex items-center h-[38px]"
              style={{ background: C.dim, border: `1px solid ${C.line}` }}
            >
              {rrr != null ? (
                <span className="font-mono font-bold text-[15px]" style={{ color: rrrColor }}>
                  1 : {rrr.toFixed(2)}
                  <span className="text-[10px] font-normal ml-2" style={{ color: C.t3 }}>
                    {rrr >= 2 ? 'Good' : rrr >= 1 ? 'OK' : 'Poor'}
                  </span>
                </span>
              ) : (
                <span className="text-[12px]" style={{ color: C.t3 }}>Enter prices above</span>
              )}
            </div>
          </div>

          {/* Notes */}
          <Field label="Notes (optional)" value={form.notes} onChange={f('notes')} placeholder="Setup reason..." />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors"
            style={{ color: C.t2, border: `1px solid ${C.line}`, background: 'transparent' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-[12px] font-bold transition-all"
            style={{ color: '#fff', background: C.accent, border: `1px solid ${C.accent}` }}
          >
            Log Trade
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, bar }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2 stat-enter"
      style={{ background: C.card, border: `1px solid ${C.line}` }}
    >
      <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.t3 }}>
        {label}
      </div>
      <div className="font-mono font-bold text-[24px] leading-none" style={{ color: color || C.t1 }}>
        {value}
      </div>
      {sub && <div className="text-[11px]" style={{ color: C.t3 }}>{sub}</div>}
      {bar != null && (
        <div className="h-1 rounded-full mt-1" style={{ background: C.line }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(bar, 100)}%`, background: color || C.accent }}
          />
        </div>
      )}
    </div>
  )
}

// ── Trade row ─────────────────────────────────────────────────────────────────
function TradeRow({ trade, onDelete, onStatusChange, index }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editingStatus, setEditingStatus] = useState(false)
  const cfg = STATUS_CFG[trade.status] || STATUS_CFG.Open

  return (
    <tr
      className="group border-b transition-colors"
      style={{
        borderColor: C.line,
        animationDelay: `${index * 30}ms`,
        backgroundColor: 'transparent',
      }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = C.hover}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <td className="py-3 px-4 text-[11px] font-mono" style={{ color: C.t3 }}>
        {trade.date}
      </td>
      <td className="py-3 px-4">
        <span className="font-mono font-bold text-[14px]" style={{ color: C.t1 }}>
          {trade.ticker}
        </span>
        {trade.notes && (
          <div className="text-[10px] mt-0.5 truncate max-w-[120px]" style={{ color: C.t3 }}>
            {trade.notes}
          </div>
        )}
      </td>
      <td className="py-3 px-4 font-mono text-[12px] text-right tabular-nums" style={{ color: C.t1 }}>
        ${trade.entry.toFixed(2)}
      </td>
      <td className="py-3 px-4 font-mono text-[12px] text-right tabular-nums" style={{ color: C.down }}>
        ${trade.stop.toFixed(2)}
      </td>
      <td className="py-3 px-4 font-mono text-[12px] text-right tabular-nums" style={{ color: C.up }}>
        ${trade.target.toFixed(2)}
      </td>
      <td className="py-3 px-4 text-right">
        {trade.rrr != null ? (
          <span
            className="font-mono font-bold text-[12px] tabular-nums"
            style={{
              color: trade.rrr >= 3 ? C.up : trade.rrr >= 2 ? C.warn : trade.rrr >= 1 ? C.accent : C.down
            }}
          >
            1:{trade.rrr.toFixed(2)}
          </span>
        ) : (
          <span style={{ color: C.t3 }}>—</span>
        )}
      </td>
      <td className="py-3 px-4">
        {editingStatus ? (
          <div className="flex gap-1">
            {Object.entries(STATUS_CFG).map(([key, c]) => (
              <button
                key={key}
                onClick={() => { onStatusChange(trade.id, key); setEditingStatus(false) }}
                className="px-2 py-0.5 rounded text-[10px] font-bold"
                style={{ color: c.color, background: c.bg, border: `1px solid ${c.color}40` }}
              >
                {key}
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setEditingStatus(true)}
            className="px-2 py-0.5 rounded text-[11px] font-bold transition-opacity hover:opacity-80"
            style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}40` }}
          >
            {cfg.label}
          </button>
        )}
      </td>
      <td className="py-3 px-4 text-right">
        {confirmDelete ? (
          <div className="flex gap-1 justify-end">
            <button
              onClick={() => onDelete(trade.id)}
              className="text-[10px] font-bold px-2 py-0.5 rounded"
              style={{ color: C.down, background: 'rgba(255,51,88,0.1)', border: `1px solid rgba(255,51,88,0.3)` }}
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-[10px] px-2 py-0.5 rounded"
              style={{ color: C.t3 }}
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="opacity-0 group-hover:opacity-100 text-[11px] transition-opacity hover:opacity-100 px-1.5 py-0.5 rounded"
            style={{ color: C.t3 }}
            title="Delete trade"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </td>
    </tr>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TradeJournal() {
  const [trades, setTrades]       = useState(loadTrades)
  const [showForm, setShowForm]   = useState(false)
  const [filterStatus, setFilter] = useState('All')

  // Persist to localStorage whenever trades change
  useEffect(() => saveTrades(trades), [trades])

  function addTrade(trade) {
    setTrades(prev => [trade, ...prev])
    setShowForm(false)
  }
  function deleteTrade(id)           { setTrades(prev => prev.filter(t => t.id !== id)) }
  function updateStatus(id, status)  { setTrades(prev => prev.map(t => t.id === id ? { ...t, status } : t)) }

  // Analytics
  const closed  = trades.filter(t => t.status !== 'Open')
  const won     = trades.filter(t => t.status === 'Won')
  const lost    = trades.filter(t => t.status === 'Lost')
  const winRate = closed.length > 0 ? (won.length / closed.length * 100) : null
  const rrrList = trades.filter(t => t.rrr != null).map(t => t.rrr)
  const avgRRR  = rrrList.length > 0 ? rrrList.reduce((a, b) => a + b, 0) / rrrList.length : null

  // Filter
  const filtered = filterStatus === 'All' ? trades : trades.filter(t => t.status === filterStatus)

  return (
    <div className="section-1">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="font-semibold text-[16px] tracking-tight" style={{ color: C.t1 }}>
            Trade Journal
          </div>
          <div className="text-[11px] mt-0.5" style={{ color: C.t3 }}>
            Saved to browser · {trades.length} trade{trades.length !== 1 ? 's' : ''} logged
          </div>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-bold transition-all"
          style={showForm
            ? { color: C.t2, background: 'transparent', border: `1px solid ${C.line}` }
            : { color: '#fff', background: C.accent, border: `1px solid ${C.accent}` }
          }
        >
          {showForm ? (
            'Cancel'
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Trade
            </>
          )}
        </button>
      </div>

      {/* ── Add Trade form ──────────────────────────────────────── */}
      {showForm && (
        <AddTradeForm onAdd={addTrade} onCancel={() => setShowForm(false)} />
      )}

      {/* ── Analytics row ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard
          label="Total Trades"
          value={trades.length}
          sub={`${won.length}W · ${lost.length}L · ${trades.length - won.length - lost.length} Open`}
        />
        <StatCard
          label="Win Rate"
          value={winRate != null ? `${winRate.toFixed(1)}%` : '—'}
          sub={closed.length > 0 ? `${closed.length} closed trades` : 'No closed trades yet'}
          color={winRate != null ? (winRate >= 50 ? C.up : C.down) : C.t3}
          bar={winRate}
        />
        <StatCard
          label="Avg R:R Ratio"
          value={avgRRR != null ? `1 : ${avgRRR.toFixed(2)}` : '—'}
          sub={rrrList.length > 0 ? `Across ${rrrList.length} trades` : 'No trades yet'}
          color={avgRRR != null ? (avgRRR >= 2 ? C.up : avgRRR >= 1 ? C.warn : C.down) : C.t3}
        />
        <StatCard
          label="Expectancy"
          value={(() => {
            if (winRate == null || avgRRR == null) return '—'
            const w = winRate / 100
            const exp = (w * avgRRR) - (1 - w)
            return exp >= 0 ? `+${exp.toFixed(2)}R` : `${exp.toFixed(2)}R`
          })()}
          sub="(Win% × AvgR) − Loss%"
          color={(() => {
            if (winRate == null || avgRRR == null) return C.t3
            const w = winRate / 100
            const exp = (w * avgRRR) - (1 - w)
            return exp >= 0.5 ? C.up : exp >= 0 ? C.warn : C.down
          })()}
        />
      </div>

      {/* ── Trade history ──────────────────────────────────────── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: C.card, border: `1px solid ${C.line}` }}
      >
        {/* Table header with filter */}
        <div
          className="px-5 py-3 flex items-center justify-between border-b"
          style={{ borderColor: C.line }}
        >
          <span className="text-[12px] font-semibold" style={{ color: C.t1 }}>
            Trade History
          </span>
          <div className="flex gap-1.5">
            {['All', 'Open', 'Won', 'Lost'].map(f => {
              const isActive = filterStatus === f
              const cfg = f === 'All' ? null : STATUS_CFG[f]
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all"
                  style={isActive
                    ? { color: cfg?.color || C.t1, background: cfg?.bg || `rgba(220,233,248,0.1)`,
                        border: `1px solid ${cfg?.color || C.t1}40` }
                    : { color: C.t3, background: 'transparent', border: `1px solid transparent` }
                  }
                >
                  {f}
                  {f !== 'All' && (
                    <span className="ml-1 opacity-60">
                      {trades.filter(t => t.status === f).length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center" style={{ color: C.t3 }}>
            <svg className="w-8 h-8 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <div className="text-[12px]">
              {filterStatus === 'All' ? 'No trades logged yet — click Add Trade to start' : `No ${filterStatus} trades`}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                  {['Date', 'Ticker', 'Entry', 'Stop', 'Target', 'R:R', 'Status', ''].map((h, i) => (
                    <th
                      key={i}
                      className={`py-2.5 px-4 text-[10px] font-semibold uppercase tracking-wider ${i >= 2 && i <= 5 ? 'text-right' : ''}`}
                      style={{ color: C.t3 }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((trade, i) => (
                  <TradeRow
                    key={trade.id}
                    trade={trade}
                    index={i}
                    onDelete={deleteTrade}
                    onStatusChange={updateStatus}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
