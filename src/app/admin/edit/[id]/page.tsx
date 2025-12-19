import { prisma } from '@/lib/prisma'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import MultiImageUpload from '@/app/components/MultiImageUpload'
import { updateItem, deleteItemImage, setImageAsCover } from '@/app/actions'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function EditItemPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const item = await prisma.item.findUnique({
    where: { id: Number(id) },
    include: { images: { orderBy: { order: 'asc' } } }
  })
  const categories = await prisma.category.findMany()
  const stores = await prisma.store.findMany()
  const years = await prisma.year.findMany({ orderBy: { value: 'desc' } })
  const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } })

  if (!item) return <div>Item not found</div>

  const updateAction = updateItem.bind(null, item.id)

  return (
    <>
      <Header />
      <div className="main-container" style={{ flexDirection: 'column', padding: '40px', maxWidth: '600px', margin: '0 auto', gap: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="page-title" style={{ fontSize: '24px', marginBottom: 0 }}>Edit Purchase</h1>
            <Link href="/admin" className="btn">Cancel</Link>
        </div>

        {/* Current Images Section - Outside main form */}
        {item.images.length > 0 && (
          <div className="admin-form">
            <label>Current Images</label>
            <div className="image-grid">
              {item.images.map((img) => (
                <div key={img.id} className={`image-grid-item ${img.isCover ? 'is-cover' : ''}`}>
                  {img.isCover && <span className="cover-badge">Cover</span>}
                  <Image
                    src={img.url}
                    alt="Item image"
                    width={100}
                    height={100}
                    style={{ objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <div className="image-actions">
                    {!img.isCover && (
                      <form action={setImageAsCover.bind(null, img.id)}>
                        <button type="submit" className="btn btn-sm">Set Cover</button>
                      </form>
                    )}
                    <form action={deleteItemImage.bind(null, img.id)}>
                      <button type="submit" className="btn btn-sm btn-danger">×</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Update Form */}
        <form action={updateAction} className="admin-form">
            <label>Title</label>
            <input name="title" defaultValue={item.title} required />

            <label>Price</label>
            <input name="price" type="number" step="0.01" defaultValue={Number(item.price)} required />

            <label>Date (Optional for Wishlist)</label>
            <input name="purchaseDate" type="date" defaultValue={item.purchaseDate ? new Date(item.purchaseDate).toISOString().split('T')[0] : ''} />

            <label>Status</label>
            <select name="status" defaultValue={item.status}>
                <option value="Delivered">Delivered</option>
                <option value="Returned">Returned</option>
                <option value="Pre-Order">Pre-Order</option>
                <option value="Wishlist">Wishlist</option>
            </select>

            <label className="checkbox-label">
                <input type="checkbox" name="isSubscription" value="true" defaultChecked={item.isSubscription} />
                <span>This is a subscription (monthly recurring)</span>
            </label>

            <label>Store</label>
            <select name="storeId" defaultValue={item.storeId}>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <label>Brand (Optional)</label>
            <select name="brandId" defaultValue={item.brandId || ''}>
                <option value="">-- Select Brand --</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>

            <label>Category</label>
            <select name="categoryId" defaultValue={item.categoryId}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <label>Year</label>
            <select name="yearId" defaultValue={item.yearId}>
                {years.map(y => <option key={y.id} value={y.id}>{y.value}</option>)}
            </select>

            <label>Add More Images</label>
            <MultiImageUpload />

            <label>Or Add Image URLs (comma-separated)</label>
            <input name="imageUrls" placeholder="https://..., https://..." />

            <label>Rating (1-5)</label>
            <select name="rating" defaultValue={item.rating || ''}>
                <option value="">-- No Rating --</option>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Terrible</option>
            </select>

            <label>Review / Notes</label>
            <textarea name="review" rows={4} defaultValue={item.review || ''}></textarea>

            <button type="submit">Update Purchase</button>
        </form>
      </div>
      <Footer />
    </>
  )
}
