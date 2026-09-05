import { motion } from 'framer-motion'
import {
  Award,
  Database,
  Eye,
  FileText,
  Lock,
  MessageCircle,
  Shield,
  Users,
  type LucideIcon,
} from 'lucide-react'

interface InfoSection {
  title: string
  icon: LucideIcon
  items: readonly string[]
}

const PRIVACY_SECTIONS: readonly InfoSection[] = [
  {
    title: 'Data Protection & Encryption',
    icon: Shield,
    items: [
      'All account and learning data encrypted at rest using AES-256',
      'All data encrypted in transit using TLS',
      'Sensitive personal information stored with field-level protection',
    ],
  },
  {
    title: 'Access Control & Authentication',
    icon: Lock,
    items: [
      'Role-based access - learners see only their own data',
      'Secure authentication for all accounts',
      'Session management with automatic timeout on inactivity',
      'Each user has a unique identity with a full audit trail',
    ],
  },
  {
    title: 'Your Data, Your Control',
    icon: Eye,
    items: [
      'You can view and update your profile details at any time',
      'You can delete your account and personal data on request',
      'We never sell your personal information to third parties',
      'Marketing communication is opt-in and can be withdrawn anytime',
    ],
  },
  {
    title: 'What We Collect',
    icon: Database,
    items: [
      'Account details you provide when registering (name, email, phone)',
      'Course enrollments, progress and certificates linked to your account',
      'Payment records needed to process your enrollments',
      'Usage data to improve our learning experience',
    ],
  },
  {
    title: 'Communication & WhatsApp',
    icon: MessageCircle,
    items: [
      'We use your phone number for course updates and support',
      'WhatsApp may be used for important announcements when you choose it as your preferred channel',
      'You can manage your contact preferences at any time',
    ],
  },
  {
    title: 'Certificates & Achievements',
    icon: Award,
    items: [
      'Certificates are issued to the account that completed the course',
      'Certificate records remain attached to your account history',
      'You can request removal of your certificate from public verification',
    ],
  },
] as const

const TERMS_SECTIONS: readonly InfoSection[] = [
  {
    title: 'Acceptance of Terms',
    icon: FileText,
    items: [
      'By creating an account you agree to these Terms of Service',
      'These terms apply to all visitors and registered learners of Custospark Academy',
      'We may update these terms and will notify you of significant changes',
    ],
  },
  {
    title: 'Your Account',
    icon: Users,
    items: [
      'You must provide accurate information when registering',
      'You are responsible for keeping your credentials secure',
      'Each account is personal and should not be shared',
      'We may suspend accounts that violate these terms',
    ],
  },
  {
    title: 'Enrollment & Fees',
    icon: Award,
    items: [
      'Enrollment is subject to availability and fee payment',
      'Some courses may be sponsored or have fees waived',
      'Payments are processed securely and you will receive a record',
      'Refunds follow the policy communicated at the point of enrollment',
    ],
  },
  {
    title: 'Course Content & Conduct',
    icon: Lock,
    items: [
      'Course materials are for your personal learning use',
      'Do not redistribute or resell course content',
      'Be respectful to instructors and fellow learners',
      'Do not attempt to disrupt or misuse the platform',
    ],
  },
  {
    title: 'Certificates',
    icon: Eye,
    items: [
      'Certificates are issued upon successful completion',
      'Issuance follows the course requirements and fee status',
      'Certificate validity is subject to these terms',
    ],
  },
  {
    title: 'Limitation of Liability',
    icon: Shield,
    items: [
      'The Academy provides educational services on an as-is basis',
      'We are not liable for indirect or consequential damages',
      'Our liability is limited to the fees you paid to us',
    ],
  },
] as const

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

function renderSections(sections: readonly InfoSection[], stagger: number) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{ visible: { transition: { staggerChildren: stagger } } }}
      className="space-y-6"
    >
      {sections.map((section) => (
        <motion.div
          key={section.title}
          variants={fadeUp}
          className="rounded-2xl border border-border-subtle bg-surface-card p-6 sm:p-8"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
              <section.icon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">{section.title}</h2>
              <ul className="mt-3 space-y-2">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm leading-relaxed text-text-secondary"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default function PrivacyPage() {
  return (
    <div className="bg-surface-page">
      {/* Header */}
      <section className="relative overflow-hidden border-b border-border-subtle bg-surface-section">
        <div className="pointer-events-none absolute -top-32 right-0 h-80 w-80 rounded-full bg-blue-500/15 blur-[100px]" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mt-0 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300">
              <Shield className="h-3.5 w-3.5" />
              Privacy &amp; Terms
            </div>
            <h1 className="mx-auto max-w-2xl font-display text-4xl font-bold text-white sm:text-5xl">
              Privacy &amp; Terms of Service
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
              How Custospark Academy collects, protects and uses your data - and the terms that
              govern your use of the platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Privacy sections */}
      <section className="mx-auto max-w-4xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <Shield className="h-6 w-6 text-blue-400" />
          <h2 className="font-display text-2xl font-bold text-white">Privacy</h2>
        </div>
        {renderSections(PRIVACY_SECTIONS, 0.08)}
      </section>

      {/* Terms sections */}
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <FileText className="h-6 w-6 text-academy-orange" />
          <h2 className="font-display text-2xl font-bold text-white">Terms of Service</h2>
        </div>
        {renderSections(TERMS_SECTIONS, 0.08)}
      </section>

      {/* Contact */}
      <section className="border-t border-border-subtle bg-surface-section">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <Users className="mx-auto h-8 w-8 text-academy-orange" />
          <h2 className="mt-3 font-display text-lg font-bold text-white">
            Questions about your data or these terms?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            Contact our support team at{' '}
            <a href="mailto:info@custospark.com" className="font-medium text-blue-300 hover:underline">
              info@custospark.com
            </a>{' '}
            and we will be happy to help.
          </p>
        </div>
      </section>
    </div>
  )
}