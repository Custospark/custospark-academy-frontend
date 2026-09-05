import { Wallet } from 'lucide-react'
import { ModulePlaceholder } from '../../shared/components/layout/ModulePlaceholder'
import { PageHeader } from '../../shared/components/layout/PageHeader'

export default function PaymentsPage() {
  return (
    <div>
      <PageHeader
        title="My Payments"
        description="Your payment history, receipts and enrollment fee status."
      />
      <ModulePlaceholder title="Payments" icon={Wallet} />
    </div>
  )
}
