import { useState, useEffect } from 'react'
import Header from './components/Header'
import TensionScore from './components/TensionScore'
import MacroGrid from './components/MacroGrid'
import TopPicks from './components/TopPicks'
import FearGreed from './components/FearGreed'
import NewsWidget from './components/NewsWidget'
import AICards from './components/AICards'
import RRRCalculator from './components/RRRCalculator'
import TradeJournal from './components/TradeJournal'

const TABS = [
  { id: 'scan',    label: 'Market Scan',   icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'journal', label: 'Trade Journal', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
]

export default function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('scan')

  useEffect(() => {
    fetch('/daily_results.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} — run scanner.py first to generate daily_results.json`)
        return r.json()
      })
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-base">
      <div className="flex items-center gap-3 text-t2">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm font-mono">Loading scan data...</span>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-base">
      <div className="bg-card border border-down/20 rounded-xl p-8 max-w-lg text-center">
        <div className="text-down text-3xl mb-4 font-mono">!</div>
        <div className="text-down font-bold mb-2 text-sm">Could not load scan data</div>
        <div className="text-t2 text-sm">{error}</div>
      </div>
    </div>
  )

  // Fallback: if top20 not in JSON (old scan), derive from tier arrays
  const top20 = data.top20 ?? [...(data.tier1 || []), ...(data.tier2 || []), ...(data.tier3 || [])]
    .map(s => ({ ...s, composite: s.pct_below * Math.max(s.vol_surge || 1, 1) }))
    .sort((a, b) => b.composite - a.composite)
    .slice(0, 20)

  // Always render 5 cards — use fallback if social_buzz timed out
  const SOCIAL_FALLBACK = {
    category: 'Social Buzz',
    icon: 'fire',
    title: 'Social Buzz Unavailable',
    summary: 'API timeout — trending data will be available on the next scheduled scan.',
    impact: 'Neutral',
    sentiment_score: null,
    hot_tickers: [],
  }
  const allCards = [
    ...(data.ai_cards || []),
    data.social_buzz ?? SOCIAL_FALLBACK,
  ]

  return (
    <div className="min-h-screen max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 pb-12">
      <div className="section-0"><Header data={data} /></div>

      {/* Tab bar */}
      <div className="mt-4 flex items-center gap-1 section-0 border-b border-line">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2.5 text-[12px] font-semibold transition-all relative"
            style={{
              color:        activeTab === tab.id ? '#dce9f8' : '#627b96',
              borderBottom: activeTab === tab.id ? '2px solid #2d7eff' : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'scan' && (
        <>
          {/* Tension + Macro row */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 section-1">
            <TensionScore data={data} />
            <MacroGrid macro={data.macro} />
          </div>

          {/* Fear & Greed */}
          {data.fear_greed && (
            <div className="mt-5 section-2">
              <FearGreed fg={data.fear_greed} />
            </div>
          )}

          {/* AI Cards + News */}
          {(allCards.length > 0 || (data.news && data.news.length > 0)) && (
            <div className="mt-5 space-y-4 section-3">
              {allCards.length > 0 && (
                <AICards cards={allCards} generatedAt={data.generated} />
              )}
              {data.news && data.news.length > 0 && (
                <NewsWidget news={data.news} />
              )}
            </div>
          )}

          {/* Top Picks — bottom of page */}
          <div className="mt-5 section-4">
            <TopPicks picks={top20} />
          </div>
        </>
      )}

      {activeTab === 'journal' && (
        <div className="mt-6">
          <TradeJournal />
        </div>
      )}

      <footer className="mt-8 text-center text-t3 text-[11px]">
        20 Method Dashboard · Data via Yahoo Finance · Scan: {data.date}
      </footer>

      <RRRCalculator />
    </div>
  )
}
