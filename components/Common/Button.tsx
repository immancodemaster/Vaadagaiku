'use client'

import React from 'react'
import Link from 'next/link'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
  icon?: React.ReactNode
  href?: string
  children: React.ReactNode
  className?: string
}

const variantStyles = {
  primary:
    'bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800 disabled:bg-gray-300',
  secondary:
    'border-2 border-orange-600 text-orange-600 hover:bg-orange-50 active:bg-orange-100 disabled:border-gray-300 disabled:text-gray-300',
  tertiary:
    'text-orange-600 hover:bg-orange-50 active:bg-orange-100 disabled:text-gray-300',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-gray-300'
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-6 py-3 text-base min-h-[48px]',
  lg: 'px-8 py-4 text-lg min-h-[56px]'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      icon,
      href,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      rounded-md font-semibold transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600
      ${fullWidth ? 'w-full' : ''}
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${className}
    `

    const content = (
      <>
        {loading && (
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {icon && !loading && icon}
        {children}
      </>
    )

    if (href) {
      return (
        <Link href={href} className={baseStyles}>
          {content}
        </Link>
      )
    }

    return (
      <button
        ref={ref}
        className={baseStyles}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </button>
    )
  }
)

Button.displayName = 'Button'
