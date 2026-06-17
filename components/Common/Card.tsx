'use client'

import React from 'react'

interface CardProps {
  className?: string
  children: React.ReactNode
  onClick?: () => void
  hoverable?: boolean
  featured?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { className = '', children, onClick, hoverable = false, featured = false },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          bg-white rounded-lg border border-gray-200 shadow-sm
          ${hoverable ? 'hover:shadow-md hover:scale-105 cursor-pointer transition-all' : ''}
          ${featured ? 'ring-2 ring-amber-400' : ''}
          ${onClick ? 'cursor-pointer' : ''}
          ${className}
        `}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onClick()
                }
              }
            : undefined
        }
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
