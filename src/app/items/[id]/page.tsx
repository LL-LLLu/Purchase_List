import { prisma } from '@/lib/prisma'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import ImageGallery from '@/app/components/ImageGallery'
import Link from 'next/link'

export default async function ItemDetail({ params }: { params: { id: string } }) {
  const { id } = await params;
  const item = await prisma.item.findUnique({
    where: { id: Number(id) },
    include: { store: true, category: true, year: true, brand: true, images: { orderBy: { order: 'asc' } } }
  })

  if (!item) return <div>Item not found</div>

  return (
    <>
      <Header />
      <div className="main-container" style={{ display: 'block', padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
        <Link href="/" style={{ textDecoration: 'underline', fontSize: '12px', color: 'var(--color-secondary)' }}>&larr; Back to History</Link>

        <div style={{ marginTop: '30px', display: 'flex', gap: '40px' }} className="item-detail-layout">
            <div style={{ flex: '0 0 400px' }} className="item-detail-gallery">
              <ImageGallery images={item.images} title={item.title} />
            </div>

            <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '24px', textTransform: 'uppercase', marginBottom: '10px' }}>{item.title}</h1>
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>${Number(item.price).toFixed(2)}</div>

                <div style={{ marginBottom: '20px', fontSize: '13px', color: 'var(--color-secondary)' }}>
                    <p><strong>Status:</strong> {item.status}</p>
                    <p><strong>Purchased:</strong> {item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : 'N/A (Wishlist)'}</p>
                    {item.rating && <p><strong>Rating:</strong> {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</p>}
                    {item.brand && <p><strong>Brand:</strong> {item.brand.name}</p>}
                    <p><strong>Store:</strong> {item.store?.name}</p>
                    <p><strong>Category:</strong> {item.category?.name}</p>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                    <h3 style={{ textTransform: 'uppercase', fontSize: '14px', marginBottom: '10px' }}>User Experience / Review</h3>
                    <p style={{ lineHeight: '1.6', fontSize: '14px' }}>
                        {item.review || "No review added yet."}
                    </p>
                </div>
            </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
