import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2>דף לא נמצא</h2>
        <Link href="/he">
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  )
} 