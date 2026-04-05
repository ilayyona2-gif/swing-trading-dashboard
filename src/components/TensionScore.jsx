import { useEffect, useRef } from 'react'

const BANDS = [
  {
    max: 100, min: 85, label: 'EXTREME', color: '#ff3358', glow: '#ff335840',
    context: 'Market severely stretched — high snap-back probability',
  },
  {
    max: 85,  min: 65, label: 'HIGH',    color: '#f5a623', glow: '#f5a62340',
    context: 'Strong tension building — reversals likely soon',
  },
  {
    max: 65,  min: 40, label: 'ELEVATED',color: '#f0c040', glow: '#f0c04030',
    context: 'Rubber band is stretching — selective opportunity',
  },
  {
    max: 40,  min: 20, label: 'MODERATE',color: '#2d7eff', glow: '#2d7eff30',
    context: 'Some setups forming — be patient and selective',
  },
  {
    max: 20,  min: 0,  label: 'LOW',     color: '#00c896', glow: '#00c89630',
    context: 'Market near equilibrium — few setups available',
  },
]

function getBand(score) {
  return BANDS.find(b => score >= b.min) ?? BANDS[BANDS.length - 1]
}

function SegmentedGauge({ score }) {
  const fgRef = useRef(null)
  const R = 70, cx = 110, cy = 95
  const ARC_START = 210
  const ARC_SWEEP = 240

  const deg2rad = d => (d * Math.PI) / 180
  const ptOnArc = (r, angleDeg) => ({
    x: cx + r * Math.cos(deg2rad(angleDeg)),
    y: cy + r * Math.sin(deg2rad(angleDeg)),
  })

  const endAngle = ARC_START - ARC_SWEEP
  const p1 = ptOnArc(R, ARC_START)
  const p2 = ptOnArc(R, endAngle)
  const bgPath = `M ${p1.x} ${p1.y} A ${R} ${R} 0 1 1 ${p2.x} ${p2.y}`

  const arcLen = R * deg2rad(ARC_SWEEP)
  const targetOffset = arcLen * (1 - score / 100)

  const band = getBand(score)

  const ticks = [0, 20, 40, 60, 80, 100].map(pct => {
    const angleDeg = ARC_START - (pct / 100) * ARC_SWEEP
    const inner = ptOnArc(R - 8, angleDeg)
    const outer = ptOnArc(R + 2, angleDeg)
    return { inner, outer, pct }
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
    <svg viewBox="0 0 220 110" className="w-full max-w-[260px]">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <path d={bgPath} fill="none" stroke="#0d1d30" strokeWidth="10" strokeLinecap="butt" />

      <path
        ref={fgRef}
        d={bgPath}
        fill="none"
        stroke={band.color}
        strokeWidth="10"
        strokeLinecap="butt"
        className="gauge-arc"
        filter="url(#glow)"
        style={{ opacity: 0.9 }}
      />

      {ticks.map(({ inner, outer, pct }) => (
        <line key={pct}
          x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
          stroke={pct <= score ? band.color : '#1a2e47'}
          strokeWidth={pct % 100 === 0 ? 2 : 1}
          opacity={pct <= score ? 0.6 : 0.4}
        />
      ))}

      <text x="110" y="78" textAnchor="middle" fill={band.color}
        fontSize="34" fontWeight="700" fontFamily="JetBrains Mono, monospace"
        letterSpacing="-1">
        {score}
      </text>
      <text x="110" y="94" textAnchor="middle" fill="#2d4255"
        fontSize="9" fontFamily="JetBrains Mono, monospace" letterSpacing="2">
        / 100
      </text>
    </svg>
  )
}

export default function TensionScore({ data }) {
  const { tension_score, tension_label, tier1, tier2, tier3, total_setups } = data
  const band = getBand(tension_score)

  return (
    <div className="rounded-xl border border-line bg-card flex flex-col p-5">
      <div className="text-2xs font-semibold uppercase tracking-[0.12em] text-t3 mb-4">
        Market Tension
      </div>

      <div className="flex flex-col items-center gap-2 flex-1">
        <div className="gauge-float">
          <SegmentedGauge score={tension_score} />
        </div>

        <div className="text-center -mt-1 px-2">
          <div className="text-[13px] font-bold tracking-[0.15em] uppercase mb-1"
            style={{ color: band.color }}>
            {tension_label}
          </div>
          <div className="text-[11px] text-t2 leading-snug">
            {band.context}
          </div>
        </div>

        {/* Tier counts */}
        <div className="w-full mt-3 grid grid-cols-3 divide-x divide-line border border-line rounded-lg overflow-hidden">
          {[
            { label: 'T1', count: tier1.length, color: '#ff3358' },
            { label: 'T2', count: tier2.length, color: '#f5a623' },
            { label: 'T3', count: tier3.length, color: '#2d7eff' },
          ].map(({ label, count, color }) => (
            <div key={label} className="py-2.5 text-center bg-base">
              <div className="font-mono text-lg font-bold" style={{ color }}>{count}</div>
              <div className="text-2xs text-t3 uppercase tracking-wider mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="text-2xs text-t3 text-center mt-1">
          {total_setups} setups · {data.universe_scanned} stocks scanned
        </div>
      </div>
    </div>
  )
}
