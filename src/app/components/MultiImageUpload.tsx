'use client'

import { useState, useRef } from 'react'

export default function MultiImageUpload() {
  const [previews, setPreviews] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) {
      setPreviews([])
      return
    }

    // Create preview URLs
    const previewUrls: string[] = []
    Array.from(files).forEach(file => {
      previewUrls.push(URL.createObjectURL(file))
    })
    setPreviews(previewUrls)
  }

  const clearFiles = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    setPreviews([])
  }

  return (
    <div className="multi-image-upload">
      <input
        ref={inputRef}
        type="file"
        name="imageFiles"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="upload-input-visible"
      />
      <p className="upload-hint-text">
        Hold Ctrl (Windows) or Cmd (Mac) to select multiple images
      </p>

      {previews.length > 0 && (
        <>
          <div className="upload-status">
            <span>{previews.length} image{previews.length > 1 ? 's' : ''} selected</span>
            <button type="button" className="btn btn-sm" onClick={clearFiles}>Clear</button>
          </div>
          <div className="upload-previews">
            {previews.map((preview, index) => (
              <div key={index} className="upload-preview-item">
                <img src={preview} alt={`Preview ${index + 1}`} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
