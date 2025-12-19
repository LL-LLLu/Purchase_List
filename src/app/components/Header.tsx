import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import HeaderSearch from './HeaderSearch'
import MobileNav from './MobileNav'
import { prisma } from '@/lib/prisma'

export default async function Header() {
  // Calculate YTD spending (current year, excluding Wishlist and Returned items)
  const currentYear = new Date().getFullYear()
  const startOfYear = new Date(currentYear, 0, 1)
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59)

  const ytdSpending = await prisma.item.aggregate({
    _sum: { price: true },
    where: {
      purchaseDate: {
        gte: startOfYear,
        lte: endOfYear,
      },
      status: {
        notIn: ['Wishlist', 'Returned']
      }
    }
  })

  const ytdTotal = Number(ytdSpending._sum.price || 0)

  return (
    <header>
      <div className="logo"><Link href="/">My Purchases</Link></div>

      <ul className="nav-links">
        <li className="nav-item">
          <Link href="/" className="nav-link">History</Link>
          {/* Dropdown Menu */}
          <div className="dropdown-menu">
            <Link href="/?filter=all" className="dropdown-item">All Purchases</Link>
            <Link href="/?status=Returned" className="dropdown-item">Returns</Link>
            <Link href="/?status=Pre-Order" className="dropdown-item">Pre-Orders</Link>
            <Link href="/subscriptions" className="dropdown-item">Subscriptions</Link>
          </div>
        </li>
        <li className="nav-item"><Link href="/analytics" className="nav-link">Analytics</Link></li>
        <li className="nav-item"><Link href="/wishlist" className="nav-link">Wishlist</Link></li>
        <li className="nav-item"><Link href="/admin" className="nav-link">Settings</Link></li>
      </ul>

      <div className="header-icons">
        <HeaderSearch />
        <Link href="/analytics">YTD Spend: ${ytdTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Link>
        <ThemeToggle />
      </div>

      <MobileNav />
    </header>
  )
}
