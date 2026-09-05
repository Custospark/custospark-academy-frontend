import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Rocket,
  Sparkles,
  Users,
  Video,
  Zap,
} from 'lucide-react'
import { Button } from '../../shared/components/buttons/Button'
import { ROUTES } from '../../app/routes/constants/shared.paths'
import { PRODUCT_TAGLINE_LONG } from '../../shared/brand/academyBrand'

const HERO_PILLS = ['Hands-on projects', 'Live sessions', 'Recognised certificates']

const BENEFITS = [
  {
    icon: BookOpen,
    title: 'Learn by doing',
    description:
      'Every course is built around real projects, so you leave with work that proves what you can do.',
    color: 'bg-blue-50 text-electric-blue',
  },
  {
    icon: Video,
    title: 'Live with instructors',
    description:
      'Join scheduled live classes, ask questions and get feedback - not just pre-recorded videos.',
    color: 'bg-orange-50 text-academy-orange',
  },
  {
    icon: Award,
    title: 'Certificates that count',
    description:
      'Earn certificates on completion that demonstrate your skills to employers and clients.',
    color: 'bg-teal-50 text-academy-teal',
  },
  {
    icon: Zap,
    title: 'Launch fast',
    description:
      'From first lesson to first product - practical paths that get you building from week one.',
    color: 'bg-violet-50 text-academy-purple',
  },
] as const

const CATEGORIES = [
  { label: 'Software & Coding', dot: 'bg-cat-software', text: 'text-cat-software' },
  { label: 'Design & UI/UX', dot: 'bg-cat-design', text: 'text-cat-design' },
  { label: 'AI & Technology', dot: 'bg-cat-ai', text: 'text-cat-ai' },
  { label: 'Business', dot: 'bg-cat-business', text: 'text-cat-business' },
  { label: 'Mobile Development', dot: 'bg-cat-mobile', text: 'text-cat-mobile' },
  { label: 'Entrepreneurship', dot: 'bg-cat-entrepreneurship', text: 'text-cat-entrepreneurship' },
] as const

const STATS = [
  { value: 'Practical', label: 'Project-based curriculum' },
  { value: 'Live', label: 'Instructor-led sessions' },
  { value: 'Certified', label: 'Recognised completion' },
] as const

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-electric-blue/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 left-0 h-[400px] w-[400px] rounded-full bg-academy-orange/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-electric-blue/30 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-electric-blue">
              <Sparkles className="h-3.5 w-3.5" />
              Custospark Academy is open for enrollment
            </div>

            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Learn. Build.{' '}
              <span className="bg-gradient-to-r from-electric-blue to-blue-hover bg-clip-text text-transparent">
                Launch.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">{PRODUCT_TAGLINE_LONG}</p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {HERO_PILLS.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-600 shadow-sm"
                >
                  {pill}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to={ROUTES.REGISTER} className="w-full sm:w-auto">
                <Button size="lg" className="w-full">
                  Start learning free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to={ROUTES.COURSES} className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full">
                  Explore courses
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {STATS.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
              >
                <div className="font-display text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {BENEFITS.map((benefit) => (
            <motion.div
              key={benefit.title}
              variants={fadeUp}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-electric-blue/40 hover:shadow-md"
            >
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg ${benefit.color}`}>
                <benefit.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-gray-900">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Categories */}
      <section className="border-y border-slate-200/60 bg-blue-50/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold text-gray-900 sm:text-4xl">
                Find your path
              </h2>
              <p className="mt-3 text-gray-600">
                Courses across the skills that matter most - from code to commerce.
              </p>
            </motion.div>

            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((category) => (
                <motion.div
                  key={category.label}
                  variants={fadeUp}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-electric-blue/40"
                >
                  <span className={`h-3 w-3 rounded-full ${category.dot}`} />
                  <span className={`font-semibold ${category.text}`}>{category.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-electric-blue to-academy-orange opacity-10" />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl cta-gradient text-white shadow-lg shadow-electric-blue/30">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h2 className="font-display text-3xl font-bold text-gray-900 sm:text-4xl">
              Your future self is ready to learn
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-600">
              Join Custospark Academy and turn your curiosity into capability - with real projects,
              live guidance and certificates that open doors.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to={ROUTES.REGISTER} className="w-full sm:w-auto">
                <Button size="lg" className="w-full">
                  Create your account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to={ROUTES.LOGIN} className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full">
                  Sign in
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-t border-slate-200/60 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:px-8">
          {[
            { icon: Users, text: 'Learn with a community' },
            { icon: CheckCircle2, text: 'Self-paced + live options' },
            { icon: Rocket, text: 'Launch projects, not just quizzes' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <item.icon className="h-5 w-5 text-electric-blue" />
              {item.text}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}