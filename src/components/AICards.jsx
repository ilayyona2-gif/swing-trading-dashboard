// ── Sentiment → single source of truth ──────────────────────────────────────
const SENTIMENT = {
  Bullish: { hex: '#00c896', r: 0,   g: 200, b: 150 },
  Bearish: { hex: '#ff3358', r: 255, g: 51,  b: 88  },
  Neutral: { hex: '#f0c040', r: 240, g: 192, b: 64  },
  Watch:   { hex: '#2d7eff', r: 45,  g: 126, b: 255 },
}

function rgba(s, a) {
  return `rgba(${s.r},${s.g},${s.b},${a})`
}

// ── Category accent colours (top border only) ────────────────────────────────
const CATEGORY_ACCENT = {
  'Geopolitics & Macro': '#2d7eff',
  'Broad Market Trends': '#00c896',
  'Sector Focus':        '#f5a623',
  'Risk & Sentiment':    '#ff3358',
}

// ── Icons (stroke coloured by parent) ────────────────────────────────────────
const ICONS = {
  globe: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  trending: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
  sector: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
    </svg>
  ),
  risk: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  fire: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2c0 0-4 4.5-4 8a4 4 0 0 0 8 0c0-1.5-.5-2.5-.5-2.5s-.5 2-2 2c-1.5 0-2-1-2-2 0-2 2.5-4.5 2.5-4.5S17 6.5 17 10a5 5 0 0 1-10 0C7 6.5 12 2 12 2z"/>
    </svg>
  ),
}

export default function AICards({ cards, generatedAt }) {
  if (!cards || cards.length === 0) return null

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 slide-enter">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent live-dot" />
          <span className="text-t1 font-semibold text-[13px] tracking-tight">AI Market Analysis</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent/15 text-accent border border-accent/25 tracking-wider">
            QWEN 2.5
          </span>
        </div>
        {generatedAt && (
          <span className="text-t3 text-[10px] font-mono">Updated {generatedAt}</span>
        )}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        {cards.map((card, i) => {
          const s      = SENTIMENT[card.impact] ?? SENTIMENT.Neutral
          const accent = CATEGORY_ACCENT[card.category] ?? s.hex
          const icon   = ICONS[card.icon] ?? ICONS.globe

          return (
            <div
              key={i}
              className="card-enter ai-card rounded-xl p-4 flex flex-col gap-3 cursor-default"
              style={{
                animationDelay: `${i * 90}ms`,
                background: `linear-gradient(135deg, ${rgba(s, 0.06)} 0%, rgba(11,18,32,0.95) 60%)`,
                border: `1px solid ${rgba(s, 0.35)}`,
                borderTop: `2px solid ${s.hex}`,
                '--ai-color':  rgba(s, 0.5),
                '--ai-shadow': rgba(s, 0.3),
              }}
            >
              {/* Category label + icon — all in sentiment colour */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5" style={{ color: s.hex }}>
                  {icon}
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em]">
                    {card.category}
                  </span>
                </div>

                {/* Badge — sentiment colour, solid */}
                <span
                  className="text-[10px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-md"
                  style={{
                    color: s.hex,
                    background: rgba(s, 0.15),
                    border: `1px solid ${rgba(s, 0.5)}`,
                    textShadow: `0 0 10px ${rgba(s, 0.8)}`,
                  }}
                >
                  {card.impact}
                </span>
              </div>

              {/* Divider — sentiment colour gradient */}
              <div className="h-px w-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${s.hex}, transparent)` }} />

              {/* Title — sentiment colour */}
              <div
                className="font-bold text-[14px] leading-snug"
                style={{ color: s.hex }}
              >
                {card.title}
              </div>

              {/* Summary — lighter tint of sentiment */}
              <div
                className="text-[12px] leading-relaxed flex-1"
                style={{ color: rgba(s, 0.75) }}
              >
                {card.summary}
              </div>

              {/* Bottom glow line */}
              <div className="h-px w-full rounded-full mt-auto"
                style={{
                  background: `linear-gradient(90deg, transparent, ${s.hex}, transparent)`,
                  boxShadow: `0 0 8px ${rgba(s, 0.6)}`,
                }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
