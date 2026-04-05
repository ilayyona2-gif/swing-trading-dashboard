import { useState, useEffect } from 'react'

// NYSE market hours: Mon–Fri 9:30–16:00 ET
function getMarketStatus() {
  const now = new Date()
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const day = et.getDay()  // 0=Sun, 6=Sat
  const h = et.getHours(), m = et.getMinutes()
  const mins = h * 60 + m
  const open = 9 * 60 + 30, close = 16 * 60

  if (day === 0 || day === 6) return { open: false, label: 'CLOSED', detail: 'Weekend' }
  if (mins < open)  return { open: false,  label: 'PRE-MKT', detail: `Opens in ${Math.floor((open  - mins) / 60)}h ${(open  - mins) % 60}m` }
  if (mins >= close) return { open: false, label: 'CLOSED',  detail: `Closed ${Math.floor((mins - close) / 60)}h ${(mins - close) % 60}m ago` }

  const rem = close - mins
  return { open: true, label: 'LIVE', detail: `Closes in ${Math.floor(rem / 60)}h ${rem % 60}m` }
}

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const et = new Date(time.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  return (
    <span className="font-mono text-t2 text-[11px] tabular-nums">
      {et.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
      <span className="text-t3 ml-1">ET</span>
    </span>
  )
}

export default function Header({ data }) {
  const mkt = getMarketStatus()

  return (
    <header className="border-b border-line">

      {/* ── Desktop layout (sm and above) — original, untouched ── */}
      <div className="hidden sm:flex items-center justify-between px-6 py-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-t1">
              20 Method
            </span>
          </div>
          <span className="text-t3 text-[11px]">/</span>
          <span className="text-t3 text-[11px]">Mean Reversion Scanner</span>
        </div>

        {/* Center — clock + market status */}
        <div className="flex items-center gap-4">
          <LiveClock />
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${mkt.open ? 'bg-up' : 'bg-t3'}`} />
            <span className={`text-[10px] font-bold tracking-wider ${mkt.open ? 'text-up' : 'text-t3'}`}>
              {mkt.label}
            </span>
            <span className="text-t3 text-[10px]">{mkt.detail}</span>
          </div>
        </div>

        {/* Right — scan meta */}
        <div className="flex items-center gap-5">
          {[
            { v: data.universe_scanned, l: 'Universe'    },
            { v: data.total_setups,     l: 'Setups',  hi: true },
            { v: data.date,             l: 'Scan Date'   },
          ].map(({ v, l, hi }, i) => (
            <div key={l} className="text-right stat-enter" style={{ animationDelay: `${i * 80}ms` }}>
              <div className={`font-mono text-sm font-semibold ${hi ? 'text-accent' : 'text-t1'}`}>{v}</div>
              <div className="text-2xs text-t3 uppercase tracking-wider">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile layout (below sm) ── */}
      <div className="sm:hidden px-4 py-3 space-y-2.5">
        {/* Row 1: brand + market status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-t1">20 Method</span>
            <span className="text-t3 text-[11px]">/</span>
            <span className="text-t3 text-[11px]">Scanner</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${mkt.open ? 'bg-up' : 'bg-t3'}`} />
            <span className={`text-[10px] font-bold tracking-wider ${mkt.open ? 'text-up' : 'text-t3'}`}>
              {mkt.label}
            </span>
            <span className="text-t3 text-[10px]">{mkt.detail}</span>
          </div>
        </div>

        {/* Row 2: stats + clock */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {[
              { v: data.universe_scanned, l: 'Universe'              },
              { v: data.total_setups,     l: 'Setups',   hi: true    },
              { v: data.date,             l: 'Scan Date'              },
            ].map(({ v, l, hi }, i) => (
              <div key={l} className="stat-enter" style={{ animationDelay: `${i * 80}ms` }}>
                <div className={`font-mono text-[12px] font-semibold ${hi ? 'text-accent' : 'text-t1'}`}>{v}</div>
                <div className="text-2xs text-t3 uppercase tracking-wider">{l}</div>
              </div>
            ))}
          </div>
          <LiveClock />
        </div>
      </div>

    </header>
  )
}
