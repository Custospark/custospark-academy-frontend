import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Award,
  BookOpen,
  Clock,
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
    color: 'text-custospark-blue',
    gradient: 'from-custospark-blue/20 to-transparent',
  },
  {
    icon: Video,
    title: 'Live with instructors',
    description:
      'Join scheduled live classes, ask questions and get feedback - not just pre-recorded videos.',
    color: 'text-academy-orange',
    gradient: 'from-academy-orange/20 to-transparent',
  },
  {
    icon: Award,
    title: 'Certificates that count',
    description:
      'Earn certificates on completion that demonstrate your skills to employers and clients.',
    color: 'text-academy-teal',
    gradient: 'from-academy-teal/20 to-transparent',
  },
  {
    icon: Zap,
    title: 'Launch fast',
    description:
      'From first lesson to first product - practical paths that get you building from week one.',
    color: 'text-academy-purple',
    gradient: 'from-academy-purple/20 to-transparent',
  },
] as const

const CATEGORIES = [
  { label: 'Software & Coding', color: 'bg-cat-software', border: 'border-cat-software/40' },
  { label: 'Design & UI/UX', color: 'bg-cat-design', border: 'border-cat-design/40' },
  { label: 'AI & Technology', color: 'bg-cat-ai', border: 'border-cat-ai/40' },
  { label: 'Business', color: 'bg-cat-business', border: 'border-cat-business/40' },
  { label: 'Mobile Development', color: 'bg-cat-mobile', border: 'border-cat-mobile/40' },
  { label: 'Entrepreneurship', color: 'bg-cat-entrepreneurship', border: 'border-cat-entrepreneurship/40' },
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
    <div className="bg-academy-navy">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 academy-gradient opacity-30" />
        <div className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-electric-blue/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 left-0 h-[400px] w-[400px] rounded-full bg-academy-orange/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-custospark-blue/40 bg-custospark-blue/10 px-4 py-1.5 text-xs font-medium text-custospark-blue">
              <Sparkles className="h-3.5 w-3.5" />
              Custospark Academy is open for enrollment
            </div>

            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Learn. Build.{' '}
              <span className="text-gradient-academy">Launch.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
              {PRODUCT_TAGLINE_LONG}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {HERO_PILLS.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-border-navy bg-deep-navy px-4 py-1.5 text-xs font-medium text-text-secondary"
                >
                  {pill}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to={ROUTES.REGISTER} className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-academy-orange hover:bg-bright-orange">
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
                className="rounded-xl border border-border-navy bg-deep-navy/60 p-6 text-center backdrop-blur"
              >
                <div className="font-display text-2xl font-bold text-white">{stat.value}</div>
                <div className="mt-1 text-sm text-text-muted">{stat.label}</div>
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
              className="group rounded-xl border border-border-navy bg-card-navy p-6 transition-colors hover:border-custospark-blue/50"
            >
              <div
                className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${benefit.gradient} ${benefit.color}`}
              >
                <benefit.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Categories */}
      <section className="border-y border-border-navy/60 bg-deep-navy/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Find your path
              </h2>
              <p className="mt-3 text-text-secondary">
                Courses across the skills that matter most - from code to commerce.
              </p>
            </motion.div>

            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((category) => (
                <motion.div
                  key={category.label}
                  variants={fadeUp}
                  className="flex items-center gap-3 rounded-xl border border-border-navy bg-card-navy p-5 transition-colors hover:border-custospark-blue/50"
                >
                  <span className={`h-3 w-3 rounded-full ${category.color}`} />
                  <span className="font-medium text-white">{category.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 cta-gradient opacity-15" />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl cta-gradient text-white shadow-lg shadow-electric-blue/30">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Your future self is ready to learn
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-text-secondary">
              Join Custospark Academy and turn your curiosity into capability - with real
              projects, live guidance and certificates that open doors.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to={ROUTES.REGISTER} className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-academy-orange hover:bg-bright-orange">
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
      <section className="border-t border-border-navy/60 bg-deep-navy">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:px-8">
          {[
            { icon: Users, text: 'Learn with a community' },
            { icon: Clock, text: 'Self-paced + live options' },
            { icon: Rocket, text: 'Launch projects, not just quizzes' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 text-sm text-text-secondary">
              <item.icon className="h-5 w-5 text-custospark-blue" />
              {item.text}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}