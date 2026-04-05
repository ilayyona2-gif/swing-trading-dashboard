import { useState } from 'react'

const SECTOR_COLORS = {
  'Technology':             '#2d7eff',
  'Healthcare':             '#00c896',
  'Financials':             '#f5a623',
  'Consumer Discretionary': '#ff3358',
  'Consumer Staples':       '#f0c040',
  'Energy':                 '#f5a623',
  'Industrials':            '#00d4e8',
  'Materials':              '#00c896',
  'Real Estate':            '#bc8cff',
  'Utilities':              '#a8daff',
  'Communication Services': '#f5a623',
}

function SectorPill({ sector }) {
  if (!sector || sector === 'Unknown') return <span className="text-t3 text-[10px]">—</span>
  const color = SECTOR_COLORS[sector] ?? '#627b96'
  const short = sector.replace('Consumer ', 'Cons. ').replace(' Services', '')
  return (
    <span className="inline-block text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap leading-tight"
      style={{ color, backgroundColor: color + '18', border: `1px solid ${color}30` }}>
      {short}
    </span>
  )
}

function VolBadge({ surge }) {
  if (surge == null) return <span className="text-t3 text-xs">—</span>
  const [color, bg] =
    surge >= 3   ? ['#ff3358', '#ff335818'] :
    surge >= 2   ? ['#f5a623', '#f5a62318'] :
    surge >= 1.5 ? ['#f0c040', '#f0c04018'] :
                   ['#627b96', '#627b9618']
  return (
    <span className="inline-block text-[11px] px-1.5 py-0.5 rounded font-mono font-semibold tabular-nums"
      style={{ color, backgroundColor: bg }}>
      {surge.toFixed(1)}x
    </span>
  )
}

function fmt(price) {
  if (price == null) return 'N/A'
  if (price >= 10000) return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 0 })
  return '$' + price.toFixed(2)
}

function StretchBar({ pct }) {
  const clamp = Math.min(pct, 20)
  const w = (clamp / 20) * 100
  const color =
    pct >= 15 ? '#ff3358' :
    pct >= 10 ? '#f5a623' :
    pct >= 8  ? '#f0c040' :
                '#2d7eff'
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <span className="text-xs font-semibold w-[52px] text-right shrink-0 font-mono tabular-nums" style={{ color }}>
        {pct.toFixed(2)}%
      </span>
      <div className="flex-1 h-[3px] bg-dim rounded-full overflow-hidden">
        <div className="bar-fill h-full rounded-full" style={{ width: `${w}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

const COLS = [
  { key: '#',        label: '#',       align: 'left',  sortKey: null     },
  { key: 'symbol',   label: 'Symbol',  align: 'left',  sortKey: 'symbol' },
  { key: 'sector',   label: 'Sector',  align: 'left',  sortKey: 'sector' },
  { key: 'price',    label: 'Price',   align: 'right', sortKey: 'price'  },
  { key: 'chg',      label: 'Day %',   align: 'right', sortKey: 'chg_pct' },
  { key: 'sma20',    label: '20-SMA',  align: 'right', sortKey: 'sma20'  },
  { key: 'pct',      label: 'Stretch', align: 'left',  sortKey: 'pct_below' },
  { key: 'vol',      label: 'Vol',     align: 'left',  sortKey: 'vol_surge' },
]

const TIER_COLORS = {
  1: { dot: 'bg-down',    badge: 'text-down bg-down/10 border border-down/20'    },
  2: { dot: 'bg-warn',    badge: 'text-warn bg-warn/10 border border-warn/20'    },
  3: { dot: 'bg-accent',  badge: 'text-accent bg-accent/10 border border-accent/20' },
}

export default function SetupTable({ title, subtitle, tier, setups, collapsed = false }) {
  const [open, setOpen] = useState(!collapsed)
  const [sortKey, setSortKey] = useState('pct_below')
  const [sortDir, setSortDir] = useState(-1) // -1=desc, 1=asc
  const meta = TIER_COLORS[tier]

  function handleSort(key) {
    if (!key) return
    setSortKey(k => {
      if (k === key) { setSortDir(d => -d); return k }
      setSortDir(-1)
      return key
    })
  }

  const sorted = [...setups].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey]
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    if (typeof av === 'string') return sortDir * av.localeCompare(bv)
    return sortDir * (bv - av)
  })

  return (
    <div className="rounded-xl border border-line overflow-hidden bg-card">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 border-b border-line hover:bg-hover transition-colors duration-150"
      >
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
          <span className="font-semibold text-[13px] text-t1 tracking-tight">{title}</span>
          <span className="text-t3 text-[11px] hidden sm:inline">{subtitle}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${meta.badge}`}>
            {setups.length} setup{setups.length !== 1 ? 's' : ''}
          </span>
          <svg className={`w-3.5 h-3.5 text-t3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        setups.length === 0 ? (
          <div className="px-6 py-10 text-center text-t3 text-sm">No setups for this tier today</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  {COLS.map(col => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.sortKey)}
                      className={`text-${col.align} ${sortKey === col.sortKey ? 'sort-active' : ''} ${!col.sortKey ? 'cursor-default' : ''}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {col.sortKey && sortKey === col.sortKey && (
                          <span className="text-[8px]">{sortDir < 0 ? '▼' : '▲'}</span>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, i) => (
                  <tr
                    key={row.symbol}
                    className="row-enter"
                    style={{ animationDelay: `${Math.min(i * 20, 400)}ms` }}
                  >
                    <td className="text-t3 text-[11px] tabular-nums w-8">{i + 1}</td>

                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-t1 text-[13px] tracking-tight font-mono">{row.symbol}</span>
                        {row.pct_below >= 15 && (
                          <span className="text-[9px] px-1 py-0.5 bg-down/15 text-down rounded uppercase font-bold tracking-wider">
                            HOT
                          </span>
                        )}
                      </div>
                    </td>

                    <td><SectorPill sector={row.sector} /></td>

                    <td className="text-right font-mono text-t1 text-[13px] tabular-nums">{fmt(row.price)}</td>

                    <td className={`text-right font-mono text-[13px] tabular-nums ${row.chg_pct >= 0 ? 'text-up' : 'text-down'}`}>
                      {row.chg_pct >= 0 ? '+' : ''}{row.chg_pct.toFixed(2)}%
                    </td>

                    <td className="text-right font-mono text-t2 text-[13px] tabular-nums">{fmt(row.sma20)}</td>

                    <td><StretchBar pct={row.pct_below} /></td>

                    <td><VolBadge surge={row.vol_surge} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}
