'use client'

import { useState } from 'react'

interface DeleteButtonProps {
  id: number
  deleteAction: (id: number) => Promise<{ error?: string; success?: boolean }>
  label?: string
}

export default function DeleteButton({ id, deleteAction, label = '×' }: DeleteButtonProps) {
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setError(null)
    setIsDeleting(true)

    const result = await deleteAction(id)

    if (result?.error) {
      setError(result.error)
      setIsDeleting(false)
    }
  }

  return (
    <div className="delete-button-wrapper">
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="btn btn-sm btn-danger"
        title="Delete"
      >
        {isDeleting ? '...' : label}
      </button>
      {error && (
        <div className="delete-error">{error}</div>
      )}
    </div>
  )
}
