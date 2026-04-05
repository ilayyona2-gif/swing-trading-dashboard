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

const TIER_META = {
  1: { label: 'T1', color: '#ff3358', bg: '#ff335815' },
  2: { label: 'T2', color: '#f5a623', bg: '#f5a62315' },
  3: { label: 'T3', color: '#2d7eff', bg: '#2d7eff15' },
}

function SectorDot({ sector }) {
  if (!sector || sector === 'Unknown') return null
  const color = SECTOR_COLORS[sector] ?? '#627b96'
  const abbr = {
    'Technology': 'Tech', 'Healthcare': 'Health', 'Financials': 'Fin',
    'Consumer Discretionary': 'Cons-D', 'Consumer Staples': 'Cons-S',
    'Energy': 'Energy', 'Industrials': 'Indus', 'Materials': 'Mat',
    'Real Estate': 'RE', 'Utilities': 'Util', 'Communication Services': 'Comm',
  }[sector] ?? sector
  return (
    <span className="text-[10px] font-medium" style={{ color }}>{abbr}</span>
  )
}

function VolBadge({ surge }) {
  if (surge == null || surge < 1.5) return null
  const [color, bg] =
    surge >= 3   ? ['#ff3358', '#ff335815'] :
    surge >= 2   ? ['#f5a623', '#f5a62315'] :
                   ['#f0c040', '#f0c04015']
  return (
    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
      style={{ color, backgroundColor: bg }}>
      {surge.toFixed(1)}x vol
    </span>
  )
}

function StockCard({ stock, rank }) {
  const tier = TIER_META[stock.tier]
  const pctColor =
    stock.pct_below >= 15 ? '#ff3358' :
    stock.pct_below >= 10 ? '#f5a623' :
    stock.pct_below >= 8  ? '#f0c040' :
                            '#2d7eff'
  const barW = Math.min((stock.pct_below / 20) * 100, 100)
  const tvUrl = `https://www.tradingview.com/chart/?symbol=${stock.symbol}`

  return (
    <a
      href={tvUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
      style={{ animationDelay: `${rank * 35}ms` }}
    >
      <div className="card-enter card-hover bg-card border border-line rounded-xl p-4 flex flex-col gap-3 group cursor-pointer h-full">
        {/* Top: rank + symbol + tier badge */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-t3 text-[11px] font-mono tabular-nums w-5 shrink-0">
              {rank}
            </span>
            <div>
              <div className="font-bold text-[17px] text-t1 tracking-tight font-mono leading-none group-hover:text-accent transition-colors">
                {stock.symbol}
              </div>
              <div className="mt-0.5">
                <SectorDot sector={stock.sector} />
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 rounded-md shrink-0"
            style={{ color: tier.color, backgroundColor: tier.bg }}>
            {tier.label}
          </span>
        </div>

        {/* Price + day change */}
        <div className="flex items-end justify-between">
          <div>
            <div className="font-mono font-bold text-[20px] text-t1 tabular-nums leading-none">
              ${stock.price.toFixed(2)}
            </div>
            <div className={`text-[12px] font-mono font-semibold mt-1 tabular-nums ${
              stock.chg_pct >= 0 ? 'text-up' : 'text-down'
            }`}>
              {stock.chg_pct >= 0 ? '+' : ''}{stock.chg_pct.toFixed(2)}%
            </div>
          </div>
          <VolBadge surge={stock.vol_surge} />
        </div>

        {/* Stretch bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-t3 text-[10px] uppercase tracking-wider">Below 20-SMA</span>
            <span className="text-[11px] font-mono font-bold tabular-nums" style={{ color: pctColor }}>
              {stock.pct_below.toFixed(2)}%
            </span>
          </div>
          <div className="h-1 bg-dim rounded-full overflow-hidden">
            <div
              className="bar-fill h-full rounded-full"
              style={{ width: `${barW}%`, backgroundColor: pctColor }}
            />
          </div>
        </div>

        {/* TradingView hint — visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
          <svg className="w-3 h-3 text-t3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span className="text-t3 text-[10px]">Open in TradingView</span>
        </div>
      </div>
    </a>
  )
}

export default function TopPicks({ picks }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const str = picks.map(s => s.symbol).join(', ')
    navigator.clipboard.writeText(str).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }).catch(() => {
      // Fallback for browsers that block clipboard without interaction
      const ta = document.createElement('textarea')
      ta.value = str
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  if (!picks || picks.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-card p-10 text-center text-t3">
        No setups found today.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-line bg-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-line flex items-center justify-between">
        <div>
          <div className="text-t1 font-semibold text-[14px] tracking-tight">Top Picks</div>
          <div className="text-t3 text-[11px] mt-0.5">
            Ranked by stretch × volume surge — highest conviction setups
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Copy to TradingView button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all duration-200"
            style={copied ? {
              color: '#00c896',
              borderColor: 'rgba(0,200,150,0.35)',
              backgroundColor: 'rgba(0,200,150,0.08)',
            } : {
              color: '#627b96',
              borderColor: '#1a2e47',
              backgroundColor: 'transparent',
            }}
          >
            {copied ? (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy to TradingView
              </>
            )}
          </button>

          <div className="text-2xs font-semibold text-t3 uppercase tracking-wider">
            {picks.length} stocks
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {picks.map((stock, i) => (
          <StockCard key={stock.symbol} stock={stock} rank={i + 1} />
        ))}
      </div>
    </div>
  )
}
