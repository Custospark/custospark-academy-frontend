import { useCallback, useEffect, useRef, useState } from 'react'

const POPUP_WIDTH = 600
const POPUP_HEIGHT = 760
const POPUP_NAME = 'academy_payment_window'

export type PaymentEnvironment = 'mobile' | 'desktop'

function detectEnvironment(): PaymentEnvironment {
  if (typeof window === 'undefined') return 'desktop'
  if (window.matchMedia('(max-width: 768px)').matches) return 'mobile'
  return 'desktop'
}

/** Paint a lightweight loading page into the blank popup so it never shows an
 *  empty/white window while the initiate request is still in flight. Fully
 *  responsive so it renders cleanly in a mobile tab or a desktop popup. */
function paintLoading(win: Window): void {
  try {
    win.document.open()
    win.document.write(
      '<!doctype html><html><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1">' +
        '<title>Custospark Academy Payment</title>' +
        '<style>html,body{height:100%;margin:0;display:flex;align-items:center;justify-content:center;' +
        'background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#334155;}' +
        '.box{text-align:center;padding:24px;}.spin{width:clamp(44px,10vw,64px);height:clamp(44px,10vw,64px);' +
        'border:5px solid #c7d2fe;border-top-color:#2563eb;border-radius:50%;animation:s 0.8s linear infinite;' +
        'margin:0 auto clamp(16px,3vw,20px);}' +
        '@keyframes s{to{transform:rotate(360deg)}}p{font-size:clamp(16px,4.5vw,22px);font-weight:600;margin:0;' +
        'line-height:1.4;color:#1e293b}</style></head>' +
        '<body><div class="box"><div class="spin"></div><p>Connecting to secure payment…</p></div></body></html>',
    )
    win.document.close()
  } catch {
    // Some environments restrict writes to the popup document; the redirect
    // that follows will replace the page anyway.
  }
}

export interface PaymentPopup {
  environment: PaymentEnvironment
  /** True when the popup/tab could not be opened and a manual fallback is needed. */
  popupBlocked: boolean
  /** The gateway URL once initiation returns it (also set when popup blocked). */
  paymentUrl: string | null
  /** Opens a blank popup/tab synchronously inside the click gesture. */
  openPaymentPopup: () => boolean
  /** Redirects the already-open popup/tab to the gateway URL. */
  redirectPaymentWindow: (url: string) => boolean
  closePaymentPopup: () => void
  resetPaymentPopup: () => void
}

/**
 * Payment window handling (mirrors Custosell's usePaymentPopup).
 *
 * A plain `window.open()` inside an async callback (e.g. the onSuccess of a
 * payment-initiation request) is treated by browsers as a popup and silently
 * blocked, leaving the user on a polling screen with no payment page. To avoid
 * this we open a blank popup/tab SYNCHRONOUSLY inside the user's click gesture -
 * which browsers allow - and then redirect that same window to the gateway URL
 * once the API returns it.
 *
 * - Desktop web: a sized popup (~600px) opened synchronously, then redirected.
 *   A loading page is painted first so the window never looks broken while the
 *   request is in flight.
 * - Mobile: a blank tab is opened synchronously (mobile ignores popup window
 *   features), then redirected. If anything is still blocked, `popupBlocked`
 *   flips so the UI can show a manual "Open Payment Page" fallback.
 */
export function usePaymentPopup(): PaymentPopup {
  const popupRef = useRef<Window | null>(null)
  const [popupBlocked, setPopupBlocked] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
  const [environment] = useState<PaymentEnvironment>(detectEnvironment)

  const closePaymentPopupRef = useCallback(() => {
    const win = popupRef.current
    if (win && !win.closed) {
      try {
        win.close()
      } catch {
        // Cross-origin windows can throw on close; safe to ignore.
      }
    }
    popupRef.current = null
  }, [])

  // Close the popup/tab when the owning view unmounts so no orphan window lingers.
  useEffect(() => closePaymentPopupRef, [closePaymentPopupRef])

  const openPaymentPopup = useCallback((): boolean => {
    setPopupBlocked(false)
    setPaymentUrl(null)

    const left = Math.max(0, Math.round((window.screen.width - POPUP_WIDTH) / 2))
    const top = Math.max(0, Math.round((window.screen.height - POPUP_HEIGHT) / 3))

    if (environment === 'mobile') {
      // Mobile ignores popup window features; open a plain tab instead.
      const win = window.open('', '_blank')
      if (!win || win.closed || typeof win.closed === 'undefined') {
        setPopupBlocked(true)
        return false
      }
      popupRef.current = win
      paintLoading(win)
      return true
    }

    const win = window.open(
      '',
      POPUP_NAME,
      `popup=yes,width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top}`,
    )
    if (!win || win.closed || typeof win.closed === 'undefined') {
      setPopupBlocked(true)
      return false
    }
    popupRef.current = win
    paintLoading(win)
    return true
  }, [environment])

  const redirectPaymentWindow = useCallback((url: string): boolean => {
    setPaymentUrl(url)

    const win = popupRef.current
    if (!win || win.closed) {
      setPopupBlocked(true)
      return false
    }
    try {
      win.location.href = url
      return true
    } catch {
      setPopupBlocked(true)
      return false
    }
  }, [])

  const closePaymentPopup = useCallback(closePaymentPopupRef, [closePaymentPopupRef])

  const resetPaymentPopup = useCallback(() => {
    closePaymentPopupRef()
    setPopupBlocked(false)
    setPaymentUrl(null)
  }, [closePaymentPopupRef])

  return {
    environment,
    popupBlocked,
    paymentUrl,
    openPaymentPopup,
    redirectPaymentWindow,
    closePaymentPopup,
    resetPaymentPopup,
  }
}