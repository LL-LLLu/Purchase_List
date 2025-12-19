import { prisma } from '@/lib/prisma'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import ProductCard from '@/app/components/ProductCard'

export const revalidate = 0

export default async function SubscriptionsPage() {
  const items = await prisma.item.findMany({
    where: {
      isSubscription: true,
      status: { not: 'Returned' } // Only show active subscriptions
    },
    include: { store: true, category: true, year: true, images: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'desc' }
  })

  // Calculate monthly subscription cost
  const monthlyTotal = items.reduce((acc, item) => acc + Number(item.price), 0)

  return (
    <>
      <div className="announcement-bar">
        Monthly Subscriptions: ${monthlyTotal.toFixed(2)}/mo
      </div>

      <Header />

      <div className="main-container" style={{ flexDirection: 'column' }}>
        <section className="product-grid-section">
          <h1 className="page-title" style={{ fontSize: '24px', marginBottom: '10px' }}>My Subscriptions</h1>
          <div className="toolbar">
            <span>{items.length} Active Subscriptions</span>
            <span>Yearly Cost: ${(monthlyTotal * 12).toFixed(2)}</span>
          </div>

          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
                <p>No active subscriptions.</p>
                <p>Go to Settings to add subscription items.</p>
            </div>
          ) : (
            <div className="product-grid">
                {items.map(item => (
                <ProductCard key={item.id} item={item} />
                ))}
            </div>
          )}
        </section>
      </div>

      <Footer />
    </>
  )
}
