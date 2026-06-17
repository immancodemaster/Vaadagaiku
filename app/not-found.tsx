import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6 bg-white">
      <div className="text-6xl font-bold text-orange-500 mb-3">404</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Page not found</h2>
      <p className="text-gray-500 mb-8 text-sm">The page you are looking for does not exist.</p>
      <Link
        href="/"
        className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
