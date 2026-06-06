'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { getOrder } from '@/lib/api'

export default function OrderConfirmationPage() {
  const params = useParams()
  const orderId = params.orderId as string

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-100 p-4">
        <p className="text-stone-600">Order not found</p>
        <Link href="/" className="mt-4 text-amber-600 underline">
          Go home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-100 p-4">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
            ✅
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Order Confirmed!</h1>
          <p className="mt-1 text-stone-500">Order #{order.id.slice(0, 8)}</p>
        </div>

        <div className="mb-4 rounded-xl bg-amber-50 p-4 text-center">
          <p className="text-sm text-amber-800">Estimated wait</p>
          <p className="text-xl font-bold text-amber-900">20-25 mins</p>
        </div>

        <div className="space-y-3 border-t border-stone-100 pt-4">
          <h2 className="font-semibold text-stone-800">Order Summary</h2>
          {order.items.map((item: { id: string; quantity: number; unitPrice: number; menuItem: { name: string } }) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.menuItem.name}
              </span>
              <span>₹{item.unitPrice * item.quantity}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-stone-100 pt-2 font-bold">
            <span>Total (incl. GST)</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-stone-500">
          Table {order.session?.tableId} · {order.customerName}
        </p>

        <Link
          href={`/table/${order.session?.tableId ?? 'T1'}`}
          className="mt-6 block w-full rounded-xl bg-amber-600 py-3 text-center font-semibold text-white min-h-[48px]"
        >
          Back to Menu
        </Link>
      </div>
    </div>
  )
}
