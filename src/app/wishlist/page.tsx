import { prisma } from '@/lib/prisma'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import ProductCard from '@/app/components/ProductCard'

export const revalidate = 0

export default async function WishlistPage() {
  const items = await prisma.item.findMany({
    where: { status: 'Wishlist' },
    include: { store: true, category: true, year: true, images: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'desc' } // Order by creation since purchase date might be null
  })

  // Calculate total wishlist value
  const totalValue = items.reduce((acc, item) => acc + Number(item.price), 0)

  return (
    <>
      <div className="announcement-bar">
        Wishlist Value: ${totalValue.toFixed(2)}
      </div>

      <Header />

      <div className="main-container" style={{ flexDirection: 'column' }}>
        <section className="product-grid-section">
          <h1 className="page-title" style={{ fontSize: '24px', marginBottom: '10px' }}>My Wishlist</h1>
          <div className="toolbar">
            <span>{items.length} Items</span>
            <span>Sort by: Date Added (Newest)</span>
          </div>

          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
                <p>Your wishlist is empty.</p>
                <p>Go to Settings to add items.</p>
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
