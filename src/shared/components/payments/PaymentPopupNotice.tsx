import { useState } from 'react'
import { AlertCircle, ExternalLink } from 'lucide-react'
import type { PaymentEnvironment } from '../../hooks/usePaymentPopup'

interface PaymentPopupNoticeProps {
  popupBlocked: boolean
  paymentUrl: string | null
  environment?: PaymentEnvironment
}

/** Open a URL from a fresh user gesture (real browser tab/popup). */
function openPaymentPage(url: string): boolean {
  const win = window.open(url, '_blank', 'popup=yes,width=600,height=760')
  return !!(win && !win.closed)
}

/**
 * Rendered inside the payment waiting screen when the gateway popup/tab could
 * not be opened automatically (popup blocker, aggressive mobile browser).
 * Offers a manual "Open Payment Page" button so the user is never stuck on a
 * spinner, plus guidance when that is blocked too.
 */
export function PaymentPopupNotice({
  popupBlocked,
  paymentUrl,
  environment = 'desktop',
}: PaymentPopupNoticeProps) {
  const [manualOpenFailed, setManualOpenFailed] = useState(false)

  if (!popupBlocked) return null

  return (
    <div className="rounded-xl border border-academy-amber/40 bg-academy-amber/10 p-4 text-left text-sm text-academy-amber">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          {environment === 'mobile'
            ? "Your payment tab didn't open automatically."
            : "Your payment window didn't open automatically."}
        </span>
      </div>
      {paymentUrl ? (
        <button
          type="button"
          onClick={() => {
            setManualOpenFailed(false)
            if (!openPaymentPage(paymentUrl)) setManualOpenFailed(true)
          }}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-academy-amber px-3 py-1.5 text-xs font-semibold text-slate-900 transition-colors hover:bg-amber-400"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open Payment Page
        </button>
      ) : (
        <p className="mt-2 text-xs">Please allow pop-ups for this site and try again.</p>
      )}
      {manualOpenFailed && (
        <p className="mt-2 text-xs">
          Still blocked? Allow pop-ups for this site in your browser, then tap the button again.
        </p>
      )}
    </div>
  )
}