'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface Props {
  categories: { id: number; name: string }[]
  years: { id: number; value: number }[]
  stores: { id: number; name: string }[]
  brands: { id: number; name: string }[]
}

export default function MobileFilters({ categories, years, stores, brands }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const searchParams = useSearchParams()

  const buildFilterUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
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

  const activeFilterCount = () => {
    let count = 0
    if (searchParams.get('categoryId')) count++
    if (searchParams.get('yearId')) count++
    if (searchParams.get('storeId')) count++
    if (searchParams.get('brandId')) count++
    if (searchParams.get('status')) count++
    if (searchParams.get('q')) count++
    return count
  }

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <div className="mobile-filters">
      <button className="mobile-filters-toggle btn" onClick={() => setIsOpen(true)}>
        Filters {activeFilterCount() > 0 && <span className="filter-badge">{activeFilterCount()}</span>}
      </button>

      <div className={`mobile-filters-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)} />

      <div className={`mobile-filters-panel ${isOpen ? 'open' : ''}`}>
        <div className="mobile-filters-header">
          <span className="mobile-filters-title">Filters</span>
          <button className="mobile-filters-close" onClick={() => setIsOpen(false)}>×</button>
        </div>

        <div className="mobile-filters-content">
          {hasAnyFilter() && (
            <div className="mobile-filter-group">
              <Link href="/" className="clear-filters" onClick={handleLinkClick}>Clear All Filters</Link>
            </div>
          )}

          <div className="mobile-filter-group">
            <div className="mobile-filter-title">Category</div>
            <div className="mobile-filter-options">
              {categories.map(c => (
                <Link
                  key={c.id}
                  href={buildFilterUrl('categoryId', c.id.toString())}
                  className={`mobile-filter-item ${isActive('categoryId', c.id.toString()) ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="mobile-filter-group">
            <div className="mobile-filter-title">Brand</div>
            <div className="mobile-filter-options">
              {brands.map(b => (
                <Link
                  key={b.id}
                  href={buildFilterUrl('brandId', b.id.toString())}
                  className={`mobile-filter-item ${isActive('brandId', b.id.toString()) ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  {b.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="mobile-filter-group">
            <div className="mobile-filter-title">Year</div>
            <div className="mobile-filter-options">
              {years.map(y => (
                <Link
                  key={y.id}
                  href={buildFilterUrl('yearId', y.id.toString())}
                  className={`mobile-filter-item ${isActive('yearId', y.id.toString()) ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  {y.value}
                </Link>
              ))}
            </div>
          </div>

          <div className="mobile-filter-group">
            <div className="mobile-filter-title">Store</div>
            <div className="mobile-filter-options">
              {stores.map(s => (
                <Link
                  key={s.id}
                  href={buildFilterUrl('storeId', s.id.toString())}
                  className={`mobile-filter-item ${isActive('storeId', s.id.toString()) ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  {s.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="mobile-filter-group">
            <div className="mobile-filter-title">Status</div>
            <div className="mobile-filter-options">
              {['Delivered', 'Pre-Order', 'Returned'].map(status => (
                <Link
                  key={status}
                  href={buildFilterUrl('status', status)}
                  className={`mobile-filter-item ${isActive('status', status) ? 'active' : ''}`}
                  onClick={handleLinkClick}
                >
                  {status}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
