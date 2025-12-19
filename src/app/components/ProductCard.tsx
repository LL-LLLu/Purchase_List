import Link from 'next/link'

export default function ProductCard({ item }: { item: any }) {
  const dateStr = item.purchaseDate
    ? new Date(item.purchaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Not purchased'

  let statusClass = 'status-delivered'
  if (item.status === 'Returned') statusClass = 'status-returned'
  if (item.status === 'Wishlist') statusClass = 'status-wishlist'

  // Get cover image or first image from images array
  const coverImage = item.images?.find((img: any) => img.isCover)
  const displayImage = coverImage?.url || (item.images && item.images.length > 0 ? item.images[0].url : null)
  const imageCount = item.images ? item.images.length : 0

  return (
    <Link href={`/items/${item.id}`} className="product-card">
      <div className="product-image-wrapper">
        {displayImage ? (
          <>
            <img src={displayImage} alt={item.title} className="product-image" />
            {imageCount > 1 && (
              <span className="image-count">{imageCount}</span>
            )}
          </>
        ) : (
          <div className="product-image">NO IMAGE</div>
        )}
      </div>
      <div className="product-info">
        <div className="product-title">{item.title}</div>
        <div className="product-meta">{item.purchaseDate ? `Purchased ${dateStr}` : 'Wishlist Item'} • {item.store?.name}</div>
        <div className="product-details">
          <span><span className={`status-pill ${statusClass}`}></span> {item.status}</span>
        </div>
        <div className="product-price">${Number(item.price).toFixed(2)}</div>
      </div>
    </Link>
  )
}
