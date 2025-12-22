import { prisma } from '@/lib/prisma'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ProductCard from './components/ProductCard'
import Footer from './components/Footer'
import MobileFilters from './components/MobileFilters'
import Pagination from './components/Pagination'
import { Suspense } from 'react'

const ITEMS_PER_PAGE = 6

export const revalidate = 0 // Disable cache for prototype simplicity

export default async function Home({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const sp = await searchParams;
  const categoryId = sp.categoryId ? Number(sp.categoryId) : undefined
  const yearId = sp.yearId ? Number(sp.yearId) : undefined
  const storeId = sp.storeId ? Number(sp.storeId) : undefined
  const brandId = sp.brandId ? Number(sp.brandId) : undefined
  const status = typeof sp.status === 'string' ? sp.status : undefined
  const searchQuery = typeof sp.q === 'string' ? sp.q.trim().toLowerCase() : undefined
  const currentPage = sp.page ? Math.max(1, Number(sp.page)) : 1

  const where: any = {}
  if (categoryId) where.categoryId = categoryId
  if (yearId) where.yearId = yearId
  if (storeId) where.storeId = storeId
  if (brandId) where.brandId = brandId

  if (status) {
    where.status = status
  } else {
    // Default: Exclude wishlist items from main history view
    where.status = { not: 'Wishlist' }
  }

  // Fuzzy search: search in title, review, and related fields
  // SQLite LIKE is case-insensitive by default for ASCII characters
  if (searchQuery) {
    where.OR = [
      { title: { contains: searchQuery } },
      { review: { contains: searchQuery } },
      { store: { name: { contains: searchQuery } } },
      { brand: { name: { contains: searchQuery } } },
      { category: { name: { contains: searchQuery } } },
    ]
  }

  // Get total count for pagination
  const totalItems = await prisma.item.count({ where })
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  const items = await prisma.item.findMany({
    where,
    include: { store: true, category: true, year: true, brand: true, images: { orderBy: { order: 'asc' } } },
    orderBy: { purchaseDate: 'desc' },
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE
  })

  const categories = await prisma.category.findMany()
  const years = await prisma.year.findMany({ orderBy: { value: 'desc' } })
  const stores = await prisma.store.findMany()
  const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } })

  return (
    <>
      <div className="announcement-bar">
        Total Items: {totalItems}
      </div>

      <Header />

      <div className="main-container">
        <Suspense fallback={<aside className="sidebar"><span className="page-title">Filter Log</span></aside>}>
          <Sidebar categories={categories} years={years} stores={stores} brands={brands} />
        </Suspense>

        <section className="product-grid-section">
          <div className="toolbar">
            <span>{totalItems} Items Tracked</span>
            <Suspense fallback={null}>
              <MobileFilters categories={categories} years={years} stores={stores} brands={brands} />
            </Suspense>
            <span className="toolbar-sort">Sort by: Date (Newest)</span>
          </div>

          <div className="product-grid">
            {items.length > 0 ? (
              items.map(item => (
                <ProductCard key={item.id} item={item} />
              ))
            ) : (
              <div className="no-results">
                No items found. Try adjusting your search or filters.
              </div>
            )}
          </div>

          <Suspense fallback={null}>
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} />
          </Suspense>
        </section>
      </div>

      <Footer />
    </>
  )
}
