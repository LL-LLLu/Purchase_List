'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface Props {
  currentPage: number
  totalPages: number
  totalItems: number
}

export default function Pagination({ currentPage, totalPages, totalItems }: Props) {
  const searchParams = useSearchParams()

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
    return `/?${params.toString()}`
  }

  if (totalPages <= 1) return null

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="pagination">
      <Link
        href={buildPageUrl(currentPage - 1)}
        className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
        aria-disabled={currentPage === 1}
        tabIndex={currentPage === 1 ? -1 : 0}
      >
        Previous
      </Link>

      <div className="pagination-pages">
        {getPageNumbers().map((page, index) =>
          typeof page === 'number' ? (
            <Link
              key={index}
              href={buildPageUrl(page)}
              className={`pagination-page ${currentPage === page ? 'active' : ''}`}
            >
              {page}
            </Link>
          ) : (
            <span key={index} className="pagination-ellipsis">
              {page}
            </span>
          )
        )}
      </div>

      <Link
        href={buildPageUrl(currentPage + 1)}
        className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
        aria-disabled={currentPage === totalPages}
        tabIndex={currentPage === totalPages ? -1 : 0}
      >
        Next
      </Link>
    </div>
  )
}
