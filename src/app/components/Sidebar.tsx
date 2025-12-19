'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface Props {
  categories: { id: number; name: string }[]
  years: { id: number; value: number }[]
  stores: { id: number; name: string }[]
  brands: { id: number; name: string }[]
}

export default function Sidebar({ categories, years, stores, brands }: Props) {
  const searchParams = useSearchParams()

  const buildFilterUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    // Toggle: if already selected, remove it
    if (params.get(key) === value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    return `/?${params.toString()}`
  }

  const isActive = (key: string, value: string) => {
    return searchParams.get(key) === value
  }

  const hasAnyFilter = () => {
    return searchParams.get('categoryId') ||
           searchParams.get('yearId') ||
           searchParams.get('storeId') ||
           searchParams.get('brandId') ||
           searchParams.get('q') ||
           searchParams.get('status')
  }

  return (
    <aside className="sidebar">
      <span className="page-title">Filter Log</span>

      {hasAnyFilter() && (
        <div className="filter-group">
          <Link href="/" className="clear-filters">Clear All Filters</Link>
        </div>
      )}

      <div className="filter-group">
        <div className="filter-title">Category</div>
        <div className="filter-options">
          {categories.map(c => (
            <Link
              key={c.id}
              href={buildFilterUrl('categoryId', c.id.toString())}
              className={`filter-item ${isActive('categoryId', c.id.toString()) ? 'filter-active' : ''}`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-title">Brand</div>
        <div className="filter-options">
          {brands.map(b => (
            <Link
              key={b.id}
              href={buildFilterUrl('brandId', b.id.toString())}
              className={`filter-item ${isActive('brandId', b.id.toString()) ? 'filter-active' : ''}`}
            >
              {b.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-title">Year</div>
        <div className="filter-options">
          {years.map(y => (
             <Link
               key={y.id}
               href={buildFilterUrl('yearId', y.id.toString())}
               className={`filter-item ${isActive('yearId', y.id.toString()) ? 'filter-active' : ''}`}
             >
               {y.value}
             </Link>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-title">Store</div>
        <div className="filter-options">
          {stores.map(s => (
             <Link
               key={s.id}
               href={buildFilterUrl('storeId', s.id.toString())}
               className={`filter-item ${isActive('storeId', s.id.toString()) ? 'filter-active' : ''}`}
             >
               {s.name}
             </Link>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-title">Status</div>
        <div className="filter-options">
          <Link
            href={buildFilterUrl('status', 'Delivered')}
            className={`filter-item ${isActive('status', 'Delivered') ? 'filter-active' : ''}`}
          >
            Delivered
          </Link>
          <Link
            href={buildFilterUrl('status', 'Pre-Order')}
            className={`filter-item ${isActive('status', 'Pre-Order') ? 'filter-active' : ''}`}
          >
            Pre-Order
          </Link>
          <Link
            href={buildFilterUrl('status', 'Returned')}
            className={`filter-item ${isActive('status', 'Returned') ? 'filter-active' : ''}`}
          >
            Returned
          </Link>
        </div>
      </div>
    </aside>
  )
}
