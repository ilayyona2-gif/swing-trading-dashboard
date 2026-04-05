function fmt(price) {
  if (price == null) return 'N/A'
  if (price >= 10000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (price >= 1000)  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return price.toFixed(2)
}

function parseSym(label)  { return label.match(/\(([^)]+)\)/)?.[1] ?? label.trim() }
function parseName(label) { return label.replace(/\s*\([^)]*\)/, '').trim() }

const NO_PREFIX = ['BTC-USD','ETH-USD','DX-Y.NYB','^VIX','GC=F','SI=F','CL=F','^DJI']
const hasPrefix  = sym => !NO_PREFIX.some(s => sym === s)

// SVG sparkline from a history array (% changes from oldest price)
function Sparkline({ data, positive }) {
  if (!data || data.length < 2) return null

  const W = 80, H = 28, PAD = 2
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const pts = data.map((v, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2)
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  // Area fill path
  const lastX = (PAD + (W - PAD * 2)).toFixed(1)
  const firstX = PAD.toFixed(1)
  const baseY  = (H - PAD).toFixed(1)
  const areaPath = `M ${firstX},${baseY} L ${pts.split(' ').map(p => p).join(' L ')} L ${lastX},${baseY} Z`

  const color = positive ? '#00c896' : '#ff3358'

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-7 spark-enter" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sg-${positive})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MacroCard({ item }) {
  const sym  = parseSym(item.label)
  const name = parseName(item.label)
  const isVix = sym === '^VIX'

  // VIX: invert direction color (rising VIX = fear = red)
  const chgPositive = isVix
    ? (item.chg_pct != null && item.chg_pct < 0)   // VIX falling = good
    : (item.chg_pct != null && item.chg_pct >= 0)

  // VIX price color based on level
  const vixColor =
    item.price >= 30 ? '#ff3358' :
    item.price >= 20 ? '#f5a623' :
                       '#00c896'

  const priceColor = isVix ? vixColor : '#dce9f8'

  const sparkPositive = isVix
    ? (item.history?.length >= 2 && item.history[item.history.length - 1] < item.history[0])
    : chgPositive

  return (
    <div className="card-enter card-hover bg-dim border border-line rounded-xl p-3.5 flex flex-col gap-2"
      style={{ animationDelay: `${Math.random() * 200}ms` }}>
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className="text-t3 text-[10px] font-semibold uppercase tracking-wider truncate pr-2">{name}</span>
        <span className="text-accent text-[10px] font-bold font-mono shrink-0">{sym}</span>
      </div>

      {/* Sparkline */}
      <Sparkline data={item.history} positive={sparkPositive} />

      {/* Price row */}
      {item.price != null ? (
        <div className="flex items-end justify-between">
          <span className="font-mono font-bold text-[15px] tabular-nums leading-none"
            style={{ color: priceColor }}>
            {hasPrefix(sym) && '$'}{fmt(item.price)}
          </span>
          <div className="text-right">
            <div className={`text-xs font-mono font-semibold tabular-nums ${chgPositive ? 'text-up' : 'text-down'}`}>
              {item.chg_pct != null
                ? `${item.chg_pct >= 0 ? '+' : ''}${item.chg_pct.toFixed(2)}%`
                : 'N/A'}
            </div>
            {isVix ? (
              <div className="text-[10px] font-semibold uppercase tracking-wide mt-0.5"
                style={{ color: vixColor }}>
                {item.price >= 30 ? 'PANIC' : item.price >= 20 ? 'ELEV.' : 'CALM'}
              </div>
            ) : item.vs_sma_pct != null ? (
              <div className={`text-[10px] font-mono mt-0.5 ${item.vs_sma_pct >= 0 ? 'text-up' : 'text-down'}`}>
                SMA{item.vs_sma_pct > 0 ? '+' : ''}{item.vs_sma_pct.toFixed(1)}%
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="text-t3 text-xs font-mono">N/A</div>
      )}
    </div>
  )
}

export default function MacroGrid({ macro }) {
  return (
    <div className="rounded-xl border border-line bg-card p-5 h-full">
      <div className="text-2xs font-semibold uppercase tracking-[0.12em] text-t3 mb-4">
        Macro Overview
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {macro.map((item, i) => (
          <MacroCard key={i} item={item} />
        ))}
      </div>
    </div>
  )
}
