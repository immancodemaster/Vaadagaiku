'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
  className?: string
}

export default function LoadingSpinner({
  size = 'md',
  text,
  fullScreen = false,
  className = ''
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const spinner = (
    <div
      className={`${sizeMap[size]} border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin`}
      role="status"
    />
  )

  if (fullScreen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        {spinner}
        {text && <p className="text-gray-500 text-sm">{text}</p>}
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      {spinner}
      {text && <p className="text-gray-500 text-sm">{text}</p>}
    </div>
  )
}
