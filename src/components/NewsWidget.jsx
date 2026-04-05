const SOURCE_COLORS = {
  'Bloomberg':    '#2d7eff',
  'CNBC':         '#f5a623',
  'MarketWatch':  '#00c896',
  'Yahoo Finance':'#00d4e8',
  'FT Markets':   '#ff3358',
}

function timeAgo(ts) {
  if (!ts) return 'Older'
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function NewsWidget({ news }) {
  if (!news || news.length === 0) return null

  return (
    <div className="rounded-xl border border-line bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-down animate-pulse" />
          <span className="text-t1 font-semibold text-[13px] tracking-tight">
            Live Macro &amp; Geopolitics
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Source legend */}
          <div className="hidden sm:flex items-center gap-3">
            {Object.entries(SOURCE_COLORS).map(([src, color]) => (
              <div key={src} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[10px] text-t3">{src}</span>
              </div>
            ))}
          </div>
          <span className="text-2xs text-t3 uppercase tracking-wider">{news.length} headlines</span>
        </div>
      </div>

      {/* Headlines */}
      <div className="divide-y divide-line/50">
        {news.map((item, i) => {
          const color = SOURCE_COLORS[item.source] ?? '#627b96'
          return (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="news-row row-enter flex items-start gap-4 px-5 py-3 hover:bg-hover group"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {/* Source tag */}
              <div className="shrink-0 pt-0.5 w-[90px]">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{ color, backgroundColor: color + '18' }}
                >
                  {item.source}
                </span>
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <p className="text-t1 text-[13px] leading-snug group-hover:text-accent transition-colors duration-100 line-clamp-2">
                  {item.title}
                </p>
              </div>

              {/* Time + arrow */}
              <div className="shrink-0 flex items-center gap-2 pt-0.5">
                <span className="text-t3 text-[11px] font-mono tabular-nums whitespace-nowrap">
                  {timeAgo(item.published_ts)}
                </span>
                <svg className="w-3 h-3 text-t3 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 border-t border-line bg-dim">
        <p className="text-t3 text-[10px]">
          Sources: Bloomberg · CNBC · MarketWatch · Yahoo Finance · FT Markets · Re-run scanner to refresh.
        </p>
      </div>
    </div>
  )
}
