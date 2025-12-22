'use client'

import { useSearchParams, useRouter } from 'next/navigation'

const sortOptions = [
  { value: 'date-desc', label: 'Date (Newest)' },
  { value: 'date-asc', label: 'Date (Oldest)' },
  { value: 'price-desc', label: 'Price (High to Low)' },
  { value: 'price-asc', label: 'Price (Low to High)' },
  { value: 'title-asc', label: 'Title (A-Z)' },
  { value: 'title-desc', label: 'Title (Z-A)' },
  { value: 'category-asc', label: 'Category (A-Z)' },
  { value: 'brand-asc', label: 'Brand (A-Z)' },
  { value: 'store-asc', label: 'Store (A-Z)' },
]

export default function SortDropdown() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentSort = searchParams.get('sort') || 'date-desc'

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    const newSort = e.target.value

    if (newSort === 'date-desc') {
      params.delete('sort')
    } else {
      params.set('sort', newSort)
    }

    // Reset to page 1 when sort changes
    params.delete('page')

    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="sort-dropdown">
      <label htmlFor="sort-select">Sort by:</label>
      <select
        id="sort-select"
        value={currentSort}
        onChange={handleSortChange}
        className="sort-select"
      >
        {sortOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
