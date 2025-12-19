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
  const thumbnailsRef = useRef<HTMLDivElement>(null)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSelectedIndex(i => (i - 1 + sortedImages.length) % sortedImages.length)
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex(i => (i + 1) % sortedImages.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sortedImages.length])

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

  const goToPrev = () => setSelectedIndex(i => (i - 1 + sortedImages.length) % sortedImages.length)
  const goToNext = () => setSelectedIndex(i => (i + 1) % sortedImages.length)

  return (
    <div className="image-gallery">
      {/* Main Image */}
      <div className="gallery-main">
        <img
          src={sortedImages[selectedIndex].url}
          alt={`${title} - Image ${selectedIndex + 1}`}
          className="gallery-main-image"
        />

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
        <p className="gallery-hint">Use arrow keys or click thumbnails to navigate</p>
      )}
    </div>
  )
}
