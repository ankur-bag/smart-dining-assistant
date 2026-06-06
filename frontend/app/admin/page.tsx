'use client'

import { useState } from 'react'
import QRCode from 'qrcode'

export default function AdminPage() {
  const [tableCount, setTableCount] = useState(5)
  const [qrCodes, setQrCodes] = useState<Array<{ tableId: string; dataUrl: string }>>([])
  const [loading, setLoading] = useState(false)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const generateQRCodes = async () => {
    setLoading(true)
    const codes: Array<{ tableId: string; dataUrl: string }> = []
    for (let i = 1; i <= tableCount; i++) {
      const tableId = `T${i}`
      const url = `${appUrl}/table/${tableId}`
      const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 })
      codes.push({ tableId, dataUrl })
    }
    setQrCodes(codes)
    setLoading(false)
  }

  const downloadQR = (tableId: string, dataUrl: string) => {
    const link = document.createElement('a')
    link.download = `qr-${tableId}.png`
    link.href = dataUrl
    link.click()
  }

  return (
    <div className="min-h-screen bg-stone-100 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-2xl font-bold text-stone-900">QR Code Generator</h1>
        <p className="mb-6 text-stone-600">Generate table QR codes for your restaurant</p>

        <div className="mb-6 flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
          <label className="text-sm font-medium text-stone-700">Number of tables (1-20)</label>
          <input
            type="number"
            min={1}
            max={20}
            value={tableCount}
            onChange={(e) => setTableCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-20 rounded-lg border border-stone-200 px-3 py-2 min-h-[44px]"
          />
          <button
            onClick={generateQRCodes}
            disabled={loading}
            className="rounded-xl bg-amber-600 px-6 py-2 font-semibold text-white min-h-[44px] disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        {qrCodes.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {qrCodes.map(({ tableId, dataUrl }) => (
              <div
                key={tableId}
                className="flex flex-col items-center rounded-xl bg-white p-4 shadow-sm"
              >
                <img src={dataUrl} alt={`QR for ${tableId}`} className="mb-2" />
                <p className="mb-2 font-semibold text-stone-800">{tableId}</p>
                <button
                  onClick={() => downloadQR(tableId, dataUrl)}
                  className="text-sm text-amber-600 hover:underline min-h-[44px]"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
