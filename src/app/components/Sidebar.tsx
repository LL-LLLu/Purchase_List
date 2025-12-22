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

export default function Sidebar({ categories, years, stores, brands }: Props) {
  const searchParams = useSearchParams()

  // Track which filter groups are expanded
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    category: false,
    brand: false,
    year: false,
    store: false,
    status: false
  })

  const toggleExpanded = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const buildFilterUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    // Toggle: if already selected, remove it
    if (params.get(key) === value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    // Reset to page 1 when filters change
    params.delete('page')

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

  const getActiveFilterName = (key: string, items: { id: number; name?: string; value?: number }[]) => {
    const activeId = searchParams.get(key)
    if (!activeId) return null
    const item = items.find(i => i.id.toString() === activeId)
    return item ? (item.name || item.value?.toString()) : null
  }

  const getActiveStatus = () => {
    return searchParams.get('status')
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
        <div className="filter-title" onClick={() => toggleExpanded('category')}>
          <span>Category</span>
          <span className="filter-toggle-indicator">
            {getActiveFilterName('categoryId', categories) && (
              <span className="filter-active-badge">{getActiveFilterName('categoryId', categories)}</span>
            )}
            <span className={`filter-arrow ${expanded.category ? 'expanded' : ''}`}>▼</span>
          </span>
        </div>
        <div className={`filter-options-dropdown ${expanded.category ? 'expanded' : ''}`}>
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
        <div className="filter-title" onClick={() => toggleExpanded('brand')}>
          <span>Brand</span>
          <span className="filter-toggle-indicator">
            {getActiveFilterName('brandId', brands) && (
              <span className="filter-active-badge">{getActiveFilterName('brandId', brands)}</span>
            )}
            <span className={`filter-arrow ${expanded.brand ? 'expanded' : ''}`}>▼</span>
          </span>
        </div>
        <div className={`filter-options-dropdown ${expanded.brand ? 'expanded' : ''}`}>
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
        <div className="filter-title" onClick={() => toggleExpanded('year')}>
          <span>Year</span>
          <span className="filter-toggle-indicator">
            {getActiveFilterName('yearId', years) && (
              <span className="filter-active-badge">{getActiveFilterName('yearId', years)}</span>
            )}
            <span className={`filter-arrow ${expanded.year ? 'expanded' : ''}`}>▼</span>
          </span>
        </div>
        <div className={`filter-options-dropdown ${expanded.year ? 'expanded' : ''}`}>
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
        <div className="filter-title" onClick={() => toggleExpanded('store')}>
          <span>Store</span>
          <span className="filter-toggle-indicator">
            {getActiveFilterName('storeId', stores) && (
              <span className="filter-active-badge">{getActiveFilterName('storeId', stores)}</span>
            )}
            <span className={`filter-arrow ${expanded.store ? 'expanded' : ''}`}>▼</span>
          </span>
        </div>
        <div className={`filter-options-dropdown ${expanded.store ? 'expanded' : ''}`}>
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
        <div className="filter-title" onClick={() => toggleExpanded('status')}>
          <span>Status</span>
          <span className="filter-toggle-indicator">
            {getActiveStatus() && (
              <span className="filter-active-badge">{getActiveStatus()}</span>
            )}
            <span className={`filter-arrow ${expanded.status ? 'expanded' : ''}`}>▼</span>
          </span>
        </div>
        <div className={`filter-options-dropdown ${expanded.status ? 'expanded' : ''}`}>
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
