'use client'

import { useState, useEffect, useRef } from 'react'

interface ImageGalleryProps {
  images: { id: number; url: string; order: number; isCover?: boolean }[]
  title: string
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  // Sort images so cover image comes first
  const sortedImages = [...images].sort((a, b) => {
    if (a.isCover && !b.isCover) return -1
    if (!a.isCover && b.isCover) return 1
    return a.order - b.order
  })

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const thumbnailsRef = useRef<HTMLDivElement>(null)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSelectedIndex(i => (i - 1 + sortedImages.length) % sortedImages.length)
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex(i => (i + 1) % sortedImages.length)
      } else if (e.key === 'Escape' && lightboxOpen) {
        setLightboxOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sortedImages.length, lightboxOpen])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [lightboxOpen])

  // Scroll thumbnail into view when selected
  useEffect(() => {
    if (thumbnailsRef.current) {
      const thumb = thumbnailsRef.current.children[selectedIndex] as HTMLElement
      if (thumb) {
        thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [selectedIndex])

  if (sortedImages.length === 0) {
    return (
      <div className="gallery-main no-image">
        NO IMAGE
      </div>
    )
  }

  const goToPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSelectedIndex(i => (i - 1 + sortedImages.length) % sortedImages.length)
  }

  const goToNext = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSelectedIndex(i => (i + 1) % sortedImages.length)
  }

  const openLightbox = () => setLightboxOpen(true)
  const closeLightbox = () => setLightboxOpen(false)

  return (
    <div className="image-gallery">
      {/* Main Image */}
      <div className="gallery-main">
        <img
          src={sortedImages[selectedIndex].url}
          alt={`${title} - Image ${selectedIndex + 1}`}
          className="gallery-main-image"
        />

        {/* Fullscreen button */}
        <button className="gallery-fullscreen-btn" onClick={openLightbox} aria-label="View full size">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        </button>

        {sortedImages.length > 1 && (
          <>
            <button className="gallery-nav gallery-prev" onClick={goToPrev} aria-label="Previous image">
              ‹
            </button>
            <button className="gallery-nav gallery-next" onClick={goToNext} aria-label="Next image">
              ›
            </button>
            <div className="gallery-counter">
              {selectedIndex + 1} / {sortedImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {sortedImages.length > 1 && (
        <div className="gallery-thumbnails" ref={thumbnailsRef}>
          {sortedImages.map((img, index) => (
            <button
              key={img.id}
              className={`gallery-thumb ${index === selectedIndex ? 'active' : ''}`}
              onClick={() => setSelectedIndex(index)}
              aria-label={`View image ${index + 1}`}
            >
              <img src={img.url} alt={`${title} thumbnail ${index + 1}`} />
            </button>
          ))}
        </div>
      )}

      {sortedImages.length > 1 && (
        <p className="gallery-hint">Use arrow keys to navigate</p>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox} aria-label="Close lightbox">
            ×
          </button>

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={sortedImages[selectedIndex].url}
              alt={`${title} - Image ${selectedIndex + 1}`}
              className="lightbox-image"
            />
          </div>

          {sortedImages.length > 1 && (
            <>
              <button className="lightbox-nav lightbox-prev" onClick={goToPrev} aria-label="Previous image">
                ‹
              </button>
              <button className="lightbox-nav lightbox-next" onClick={goToNext} aria-label="Next image">
                ›
              </button>
              <div className="lightbox-counter">
                {selectedIndex + 1} / {sortedImages.length}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
