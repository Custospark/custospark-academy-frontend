import { useEffect, useRef, useState } from 'react'
import { ChevronDown, MessageCircle, Phone } from 'lucide-react'
import { countryCodes, type CountryCode } from '../../utils/countryCodes'
import { getDefaultCountryCode, getPhonePlaceholder } from '../../utils/phoneNumber'
import { cn } from '../../utils/cn'

interface PhoneNumberFieldProps {
  value: string
  onChange: (phone: string) => void
  onCountryChange?: (country: CountryCode) => void
  error?: string
  required?: boolean
  showWhatsAppPreference?: boolean
}

/**
 * Academy phone field with country dial-code picker. Builds the full
 * international number (+256...) and optionally signals WhatsApp preference.
 */
export function PhoneNumberField({
  value,
  onChange,
  onCountryChange,
  error,
  required = false,
  showWhatsAppPreference = false,
}: PhoneNumberFieldProps) {
  const [country, setCountry] = useState<CountryCode>(getDefaultCountryCode())
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filtered = countryCodes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial_code.includes(search) ||
      c.code.toLowerCase().includes(search),
  )

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function selectCountry(c: CountryCode) {
    setCountry(c)
    setDropdownOpen(false)
    setSearch('')
    onCountryChange?.(c)
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="block text-sm font-medium text-text-secondary">
          Phone
          {required && <span className="ml-0.5 text-semantic-error">*</span>}
        </label>
        {showWhatsAppPreference && (
          <span className="inline-flex items-center gap-1 text-xs text-academy-teal">
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp preferred
          </span>
        )}
      </div>

      <div className="flex gap-2">
        {/* Country dial-code picker */}
        <div ref={dropdownRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setDropdownOpen((open) => !open)}
            className="flex h-[46px] items-center gap-1.5 rounded-lg border border-border-default bg-surface-input px-3 text-text-primary transition-colors hover:border-border-strong"
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
          >
            <span className="text-lg leading-none">{country.flag}</span>
            <span className="text-sm font-medium">{country.dial_code}</span>
            <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 max-h-60 min-w-72 overflow-y-auto rounded-lg border border-border-default bg-surface-elevated shadow-2xl">
              <div className="sticky top-0 border-b border-border-subtle bg-surface-elevated p-2">
                <input
                  type="text"
                  placeholder="Search country..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="w-full rounded-md border border-border-default bg-surface-input px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-border-focus"
                />
              </div>
              {filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => selectCountry(c)}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                    c.code === country.code
                      ? 'bg-blue-500/15 font-medium text-white'
                      : 'text-text-secondary hover:bg-surface-card-hover'
                  }`}
                >
                  <span className="text-lg leading-none">{c.flag}</span>
                  <span className="text-text-primary">{c.name}</span>
                  <span className="ml-auto text-text-muted">{c.dial_code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Local number */}
        <div className="relative flex-1">
          <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="tel"
            placeholder={getPhonePlaceholder(country)}
            value={value}
            onChange={(e) => onChange(e.target.value.replace(/[^\d\s\-()]/g, ''))}
            required={required}
            className={cn(
              'h-[46px] w-full rounded-lg border bg-surface-input pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2',
              error
                ? 'border-semantic-error focus:ring-semantic-error/40'
                : 'border-border-default focus:border-border-focus focus:ring-border-focus/30',
            )}
          />
        </div>
      </div>

      {error && <p className="mt-1.5 text-xs text-semantic-error">{error}</p>}
    </div>
  )
}