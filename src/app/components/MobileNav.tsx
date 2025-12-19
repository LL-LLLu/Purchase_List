'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ThemeToggle from './ThemeToggle'

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsOpen(false)
      setSearchQuery('')
    }
  }

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <div className="mobile-nav">
      {!isOpen && (
        <button
          className="mobile-nav-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
        >
          <span className="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      )}

      <div className={`mobile-nav-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)} />

      <nav className={`mobile-nav-menu ${isOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <span className="mobile-nav-title">Menu</span>
          <button className="mobile-nav-close" onClick={() => setIsOpen(false)}>×</button>
        </div>

        <form onSubmit={handleSearch} className="mobile-search">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="mobile-search-input"
          />
          <button type="submit" className="btn">Go</button>
        </form>

        <div className="mobile-nav-section">
          <div className="mobile-nav-section-title">Navigation</div>
          <Link href="/" className="mobile-nav-link" onClick={handleLinkClick}>History</Link>
          <Link href="/?status=Returned" className="mobile-nav-link" onClick={handleLinkClick}>Returns</Link>
          <Link href="/?status=Pre-Order" className="mobile-nav-link" onClick={handleLinkClick}>Pre-Orders</Link>
          <Link href="/analytics" className="mobile-nav-link" onClick={handleLinkClick}>Analytics</Link>
          <Link href="/wishlist" className="mobile-nav-link" onClick={handleLinkClick}>Wishlist</Link>
          <Link href="/admin" className="mobile-nav-link" onClick={handleLinkClick}>Settings</Link>
        </div>

        <div className="mobile-nav-section">
          <div className="mobile-nav-section-title">Theme</div>
          <div className="mobile-theme-toggle">
            <ThemeToggle />
            <span>Toggle Theme</span>
          </div>
        </div>
      </nav>
    </div>
  )
}
