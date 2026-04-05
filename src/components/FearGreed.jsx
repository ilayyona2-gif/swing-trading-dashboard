import { useEffect, useRef } from 'react'

// 0–25 Extreme Fear, 25–45 Fear, 45–55 Neutral, 55–75 Greed, 75–100 Extreme Greed
const BANDS = [
  { min: 75,  max: 100, label: 'Extreme Greed', color: '#00c896', short: 'EG' },
  { min: 55,  max: 75,  label: 'Greed',         color: '#00d4e8', short: 'G'  },
  { min: 45,  max: 55,  label: 'Neutral',        color: '#f0c040', short: 'N'  },
  { min: 25,  max: 45,  label: 'Fear',           color: '#f5a623', short: 'F'  },
  { min: 0,   max: 25,  label: 'Extreme Fear',   color: '#ff3358', short: 'EF' },
]

function getBand(score) {
  return BANDS.find(b => score >= b.min) ?? BANDS[BANDS.length - 1]
}

function Gauge({ score }) {
  const fgRef = useRef(null)
  const R = 68, cx = 110, cy = 90
  const ARC_START = 210
  const ARC_SWEEP = 240

  const deg2rad = d => (d * Math.PI) / 180
  const ptOnArc = (r, a) => ({
    x: cx + r * Math.cos(deg2rad(a)),
    y: cy + r * Math.sin(deg2rad(a)),
  })

  const endAngle = ARC_START - ARC_SWEEP
  const p1 = ptOnArc(R, ARC_START)
  const p2 = ptOnArc(R, endAngle)
  const bgPath = `M ${p1.x} ${p1.y} A ${R} ${R} 0 1 1 ${p2.x} ${p2.y}`
  const arcLen = R * deg2rad(ARC_SWEEP)
  const targetOffset = arcLen * (1 - score / 100)
  const band = getBand(score)

  // Colored band segments behind the active arc
  const segments = [...BANDS].reverse().map(b => {
    const startDeg = ARC_START - (b.min / 100) * ARC_SWEEP
    const endDeg   = ARC_START - (b.max / 100) * ARC_SWEEP
    const sp = ptOnArc(R, startDeg)
    const ep = ptOnArc(R, endDeg)
    const large = (b.max - b.min) / 100 * ARC_SWEEP > 180 ? 1 : 0
    return { path: `M ${sp.x} ${sp.y} A ${R} ${R} 0 ${large} 1 ${ep.x} ${ep.y}`, color: b.color }
  })

  // Tick marks
  const ticks = [0, 25, 45, 55, 75, 100].map(pct => {
    const a = ARC_START - (pct / 100) * ARC_SWEEP
    return { inner: ptOnArc(R - 7, a), outer: ptOnArc(R + 2, a), pct }
  })

  useEffect(() => {
    const el = fgRef.current
    if (!el) return
    el.style.strokeDasharray  = `${arcLen} ${arcLen * 2}`
    el.style.strokeDashoffset = `${arcLen}`
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.strokeDashoffset = `${targetOffset}`
    }))
  }, [score, arcLen, targetOffset])

  return (
    <svg viewBox="0 0 220 108" className="w-full max-w-[280px]">
      <defs>
        <filter id="fg-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Colored zone backdrop */}
      {segments.map((seg, i) => (
        <path key={i} d={seg.path} fill="none" stroke={seg.color}
          strokeWidth="10" strokeLinecap="butt" opacity="0.12" />
      ))}

      {/* Dark track */}
      <path d={bgPath} fill="none" stroke="#0d1d30" strokeWidth="8" strokeLinecap="butt" />

      {/* Active arc */}
      <path ref={fgRef} d={bgPath} fill="none"
        stroke={band.color} strokeWidth="8" strokeLinecap="butt"
        className="gauge-arc" filter="url(#fg-glow)" style={{ opacity: 0.95 }} />

      {/* Ticks */}
      {ticks.map(({ inner, outer, pct }) => (
        <line key={pct}
          x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
          stroke={pct <= score ? band.color : '#1a2e47'}
          strokeWidth="1.5" opacity="0.5" />
      ))}

      {/* Score number */}
      <text x="110" y="76" textAnchor="middle" fill={band.color}
        fontSize="36" fontWeight="700" fontFamily="JetBrains Mono, monospace" letterSpacing="-1">
        {Math.round(score)}
      </text>
      <text x="110" y="92" textAnchor="middle" fill="#2d4255"
        fontSize="9" fontFamily="JetBrains Mono, monospace" letterSpacing="2">
        / 100
      </text>
    </svg>
  )
}

function Sparkline({ history, band }) {
  if (!history || history.length < 2) return null
  const vals = history.map(p => p.y)
  const min = Math.min(...vals), max = Math.max(...vals)
  const range = max - min || 1
  const W = 300, H = 40, PAD = 2

  const pts = vals.map((v, i) => {
    const x = PAD + (i / (vals.length - 1)) * (W - PAD * 2)
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  // gradient area
  const firstX = PAD.toFixed(1), lastX = (PAD + W - PAD * 2).toFixed(1), baseY = (H - PAD).toFixed(1)
  const area = `M ${firstX},${baseY} L ${pts.split(' ').join(' L ')} L ${lastX},${baseY} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-10" preserveAspectRatio="none">
      <defs>
        <linearGradient id="fg-spark-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={band.color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={band.color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#fg-spark-grad)" />
      <polyline points={pts} fill="none" stroke={band.color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DeltaBadge({ label, score, current }) {
  if (score == null) return null
  const scoreBand = getBand(score)
  const diff = current - score
  const diffUp = diff >= 0
  return (
    <div className="text-center">
      <div className="text-[13px] font-mono font-bold tabular-nums" style={{ color: scoreBand.color }}>
        {Math.round(score)}
      </div>
      <div className="text-[10px] text-t3 mt-0.5">{label}</div>
      <div className={`text-[10px] font-mono mt-0.5 ${diffUp ? 'text-up' : 'text-down'}`}>
        {diffUp ? '+' : ''}{diff.toFixed(1)}
      </div>
    </div>
  )
}

export default function FearGreed({ fg }) {
  if (!fg) return null
  const band = getBand(fg.score)

  return (
    <div className="rounded-xl border border-line bg-card p-5">
      <div className="text-2xs font-semibold uppercase tracking-[0.12em] text-t3 mb-4">
        CNN Fear &amp; Greed Index — Stock Market
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">

        {/* Gauge */}
        <div className="flex flex-col items-center shrink-0">
          <Gauge score={fg.score} />
          <div className="text-center -mt-1">
            <div className="text-[15px] font-bold tracking-[0.12em] uppercase"
              style={{ color: band.color }}>
              {band.label}
            </div>
            <div className="text-t2 text-[11px] mt-1">
              {fg.score <= 25
                ? 'Investors are in panic mode — potential contrarian buy signal'
                : fg.score <= 45
                ? 'Market sentiment is fearful — watch for reversal setups'
                : fg.score <= 55
                ? 'Market sentiment is balanced — no strong directional bias'
                : fg.score <= 75
                ? 'Investors are optimistic — be cautious of complacency'
                : 'Market euphoria — elevated risk of correction'}
            </div>
          </div>
        </div>

        {/* Right side: sparkline + comparisons */}
        <div className="flex-1 w-full space-y-4">

          {/* 30-day sparkline */}
          <div>
            <div className="text-2xs text-t3 uppercase tracking-wider mb-1.5">30-Day Trend</div>
            <div className="bg-dim rounded-lg px-3 pt-2 pb-1">
              <Sparkline history={fg.history} band={band} />
              <div className="flex justify-between text-[10px] text-t3 font-mono mt-1">
                <span>30d ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* Historical comparison */}
          <div>
            <div className="text-2xs text-t3 uppercase tracking-wider mb-1.5">vs. Prior Periods</div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Prev Close',  score: fg.previous_close   },
                { label: '1 Week Ago',  score: fg.previous_1_week  },
                { label: '1 Month Ago', score: fg.previous_1_month },
                { label: '1 Year Ago',  score: fg.previous_1_year  },
              ].map(item => (
                <div key={item.label} className="card-enter bg-dim rounded-lg py-2.5 text-center border border-line" style={{ animationDelay: `${['Prev Close','1 Week Ago','1 Month Ago','1 Year Ago'].indexOf(item.label) * 60}ms` }}>
                  <DeltaBadge label={item.label} score={item.score} current={fg.score} />
                </div>
              ))}
            </div>
          </div>

          {/* Zone legend */}
          <div className="flex items-center gap-2 flex-wrap">
            {[...BANDS].reverse().map(b => (
              <div key={b.label} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                <span className="text-[10px] text-t3">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
