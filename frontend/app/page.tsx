import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-stone-100 p-6">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold text-stone-900">Smart Dining Assistant</h1>
        <p className="mt-2 text-stone-600">
          AI-first dining — Zara helps you order in plain language
        </p>
        <div className="mt-8 space-y-3">
          <Link
            href="/table/T1"
            className="block w-full rounded-xl bg-amber-600 py-3 font-semibold text-white min-h-[48px] leading-[48px]"
          >
            Demo Table T1
          </Link>
          <Link
            href="/admin"
            className="block w-full rounded-xl border border-amber-300 bg-white py-3 font-semibold text-amber-700 min-h-[48px] leading-[48px]"
          >
            Admin — QR Generator
          </Link>
        </div>
      </div>
    </div>
  )
}
