import { prisma } from '@/lib/prisma'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

export const revalidate = 0

export default async function AnalyticsPage() {
  const items = await prisma.item.findMany({
    include: { category: true, year: true, store: true, brand: true },
    where: { status: { not: 'Wishlist' } } // Exclude wishlist from analytics
  })

  // 1. Total Spend
  const totalSpend = items.reduce((acc, item) => acc + Number(item.price), 0)
  const totalCount = items.length

  // 2. Spend by Category
  const categoryStats: Record<string, number> = {}
  items.forEach(item => {
    const name = item.category.name
    categoryStats[name] = (categoryStats[name] || 0) + Number(item.price)
  })
  const categoryData = Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value, percent: (value / totalSpend) * 100 }))

  // 3. Spend by Year
  const yearStats: Record<string, number> = {}
  items.forEach(item => {
    // Prefer the linked Year model value, or fallback to purchaseDate year
    const yearVal = item.year.value.toString()
    yearStats[yearVal] = (yearStats[yearVal] || 0) + Number(item.price)
  })
  const yearData = Object.entries(yearStats)
    .sort((a, b) => Number(b[0]) - Number(a[0])) // Newest years first
    .map(([name, value]) => ({ name, value, percent: (value / totalSpend) * 100 }))

  // 4. Spend by Store (Top 5)
  const storeStats: Record<string, number> = {}
  items.forEach(item => {
    const name = item.store.name
    storeStats[name] = (storeStats[name] || 0) + Number(item.price)
  })
  const storeData = Object.entries(storeStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value, percent: (value / totalSpend) * 100 }))

  // 5. Monthly Spend (Last 6 Months)
  const today = new Date()
  const last6Months: { key: string; start: Date; end: Date; value: number }[] = []
  for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const key = d.toLocaleString('default', { month: 'short', year: 'numeric' }) // e.g., "Jan 2025"
      // Store start and end dates for comparison
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
      last6Months.push({ key, start, end, value: 0 })
  }

  items.forEach(item => {
      if (!item.purchaseDate) return
      const pDate = new Date(item.purchaseDate)
      for (const m of last6Months) {
          if (pDate >= m.start && pDate <= m.end) {
              m.value += Number(item.price)
          }
      }
  })

  // Find max value for scaling graph
  const maxMonthValue = Math.max(...last6Months.map(m => m.value), 1) // Avoid div by 0

  // 6. Purchase Success Analysis (Rating Distribution)
  const ratedItems = items.filter(i => i.rating !== null)
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>
  let successfulCount = 0
  
  ratedItems.forEach(item => {
      const r = item.rating as number
      if (ratingCounts[r] !== undefined) ratingCounts[r]++
      if (r >= 4) successfulCount++
  })
  
  const successRate = ratedItems.length > 0 ? (successfulCount / ratedItems.length) * 100 : 0
  const maxRatingCount = Math.max(...Object.values(ratingCounts), 1)

  // 7. Rolling Success Score (Algorithm)
  // Sort rated items chronologically
  const sortedRatedItems = [...ratedItems].sort((a, b) => {
      const dateA = a.purchaseDate ? new Date(a.purchaseDate).getTime() : 0
      const dateB = b.purchaseDate ? new Date(b.purchaseDate).getTime() : 0
      return dateA - dateB
  })

  const trendData = sortedRatedItems.map((item, index) => {
      // Get past 20 items (including current)
      const start = Math.max(0, index - 19)
      const window = sortedRatedItems.slice(start, index + 1)
      
      // Calculate success score for this window: % of items with rating >= 4
      const successCount = window.filter(i => (i.rating || 0) >= 4).length
      const score = (successCount / window.length) * 100
      
      return {
          date: item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : 'N/A',
          score
      }
  })

  // SVG Graph Helper
  const graphHeight = 200
  const graphWidth = 800
  const padding = 20
  
  let svgPath = ""
  if (trendData.length > 1) {
      const xStep = (graphWidth - padding * 2) / (trendData.length - 1)
      const points = trendData.map((d, i) => {
          const x = padding + i * xStep
          const y = graphHeight - padding - (d.score / 100) * (graphHeight - padding * 2)
          return `${x},${y}`
      })
      svgPath = `M ${points.join(' L ')}`
  }

  return (
    <>
      <Header />
      <div className="main-container" style={{ flexDirection: 'column', padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 className="page-title" style={{ fontSize: '24px', marginBottom: '30px' }}>Spending Analytics</h1>

        {/* Overview Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
            <div style={{ padding: '20px', background: 'var(--color-card-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-secondary)', marginBottom: '10px' }}>Total Lifetime Spend</h3>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>${totalSpend.toFixed(2)}</div>
            </div>
            <div style={{ padding: '20px', background: 'var(--color-card-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-secondary)', marginBottom: '10px' }}>Total Items Purchased</h3>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{totalCount}</div>
            </div>
            <div style={{ padding: '20px', background: 'var(--color-card-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-secondary)', marginBottom: '10px' }}>Current Success Score</h3>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: (trendData[trendData.length - 1]?.score || 0) >= 75 ? '#2ecc71' : '#f39c12' }}>
                    {trendData.length > 0 ? Math.round(trendData[trendData.length - 1].score) : 0}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-secondary)', marginTop: '5px' }}>Based on last {Math.min(trendData.length, 20)} purchases</div>
            </div>
        </div>

        {/* Success Trend Graph */}
        <div style={{ marginBottom: '60px', background: 'var(--color-card-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h2 style={{ fontSize: '18px' }}>Purchase Success Trend</h2>
                <span style={{ fontSize: '12px', color: 'var(--color-secondary)' }}>Rolling 20-Purchase Average (% rated 4+)</span>
            </div>
            
            {trendData.length > 1 ? (
                <div style={{ width: '100%', overflowX: 'auto' }}>
                    <svg width="100%" height={graphHeight} viewBox={`0 0 ${graphWidth} ${graphHeight}`} style={{ overflow: 'visible' }}>
                        {/* Grid Lines */}
                        <line x1={padding} y1={padding} x2={graphWidth-padding} y2={padding} stroke="var(--color-border)" />
                        <line x1={padding} y1={graphHeight/2} x2={graphWidth-padding} y2={graphHeight/2} stroke="var(--color-border)" />
                        <line x1={padding} y1={graphHeight-padding} x2={graphWidth-padding} y2={graphHeight-padding} stroke="var(--color-border)" />
                        
                        {/* Text Labels */}
                        <text x={0} y={padding + 5} fontSize="10" fill="var(--color-secondary)">100%</text>
                        <text x={0} y={graphHeight/2 + 5} fontSize="10" fill="var(--color-secondary)">50%</text>
                        <text x={0} y={graphHeight - padding + 5} fontSize="10" fill="var(--color-secondary)">0%</text>

                        {/* The Line */}
                        <path d={svgPath} fill="none" stroke="#3498db" strokeWidth="2" />
                        
                        {/* Dots */}
                        {trendData.map((d, i) => {
                            const x = padding + i * ((graphWidth - padding * 2) / (trendData.length - 1))
                            const y = graphHeight - padding - (d.score / 100) * (graphHeight - padding * 2)
                            return (
                                <g key={i} className="graph-point">
                                    <circle cx={x} cy={y} r="3" fill="#3498db" />
                                    {/* Tooltip-ish label for last point or every 5th point */}
                                    {(i === trendData.length - 1 || i % 5 === 0) && (
                                        <text x={x} y={graphHeight} fontSize="10" textAnchor="middle" fill="var(--color-secondary)">{d.date}</text>
                                    )}
                                </g>
                            )
                        })}
                    </svg>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-secondary)', fontSize: '14px' }}>
                    Not enough data to generate trend graph. Rate at least 2 items.
                </div>
            )}
        </div>

        {/* Purchase Satisfaction Distribution (Minimal) */}
        <div style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Satisfaction Distribution</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '10px 15px', alignItems: 'center', fontSize: '13px', color: 'var(--color-secondary)' }}>
                {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} style={{ display: 'contents' }}>
                        <div style={{ fontWeight: '500' }}>{star} ★</div>
                        <div style={{ height: '6px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ 
                                width: `${ratedItems.length > 0 ? (ratingCounts[star] / ratedItems.length) * 100 : 0}%`, 
                                height: '100%', 
                                background: star >= 4 ? '#2ecc71' : star === 3 ? '#f1c40f' : '#e74c3c',
                                borderRadius: '3px'
                            }}></div>
                        </div>
                        <div>{ratingCounts[star]}</div>
                    </div>
                ))}
            </div>
        </div>

        {/* Monthly Spending Graph */}
        <div style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Monthly Spending (Last 6 Months)</h2>
            <div style={{ 
                display: 'flex', 
                alignItems: 'flex-end', 
                height: '250px', 
                gap: '20px', 
                background: 'var(--color-card-bg)', 
                borderBottom: '1px solid var(--color-border)', 
                paddingBottom: '10px'
            }}>
                {last6Months.map(m => {
                    const heightPercent = (m.value / maxMonthValue) * 100
                    return (
                        <div key={m.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                            <div style={{ 
                                marginBottom: '10px', 
                                fontSize: '12px', 
                                fontWeight: 'bold', 
                                color: 'var(--color-text)' 
                            }}>
                                ${m.value.toFixed(0)}
                            </div>
                            <div style={{ 
                                width: '100%', 
                                maxWidth: '60px',
                                height: `${heightPercent}%`, 
                                background: '#3498db', 
                                borderRadius: '4px 4px 0 0',
                                minHeight: '4px',
                                transition: 'height 0.3s ease'
                            }}></div>
                            <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--color-secondary)', textTransform: 'uppercase' }}>
                                {m.key.split(' ')[0]} {/* Show Month Only */}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px' }}>
            
            {/* By Category */}
            <section>
                <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Spend by Category</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {categoryData.map(d => (
                        <div key={d.name}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                                <span>{d.name}</span>
                                <span>${d.value.toFixed(2)} ({d.percent.toFixed(1)}%)</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${d.percent}%`, height: '100%', background: '#2c3e50' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

             {/* By Year */}
             <section>
                <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Spend by Year</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {yearData.map(d => (
                        <div key={d.name}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                                <span>{d.name}</span>
                                <span>${d.value.toFixed(2)}</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${d.percent}%`, height: '100%', background: '#e67e22' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

             {/* Top Stores */}
             <section>
                <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Top 5 Stores</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {storeData.map(d => (
                        <div key={d.name}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '5px' }}>
                                <span>{d.name}</span>
                                <span>${d.value.toFixed(2)}</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${d.percent}%`, height: '100%', background: '#27ae60' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
      </div>
      <Footer />
    </>
  )
}