import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
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

const HERO_BG_IMAGES = [
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1920&q=80',
] as const

const HERO_SLIDE_INTERVAL_MS = 3000

const BENEFITS = [
  {
    icon: BookOpen,
    title: 'Learn by doing',
    description:
      'Every course is built around real projects, so you leave with work that proves what you can do.',
    color: 'bg-blue-500/15 text-blue-300',
  },
  {
    icon: Video,
    title: 'Live with instructors',
    description:
      'Join scheduled live classes, ask questions and get feedback - not just pre-recorded videos.',
    color: 'bg-orange-500/15 text-orange-400',
  },
  {
    icon: Award,
    title: 'Certificates that count',
    description:
      'Earn certificates on completion that demonstrate your skills to employers and clients.',
    color: 'bg-semantic-success/15 text-semantic-success',
  },
  {
    icon: Zap,
    title: 'Launch fast',
    description:
      'From first lesson to first product - practical paths that get you building from week one.',
    color: 'bg-academy-purple/15 text-academy-purple',
  },
] as const

const CATEGORIES = [
  { label: 'Software & Coding', dot: 'bg-cat-software' },
  { label: 'Design & UI/UX', dot: 'bg-cat-design' },
  { label: 'AI & Technology', dot: 'bg-cat-ai' },
  { label: 'Business', dot: 'bg-cat-business' },
  { label: 'Mobile Development', dot: 'bg-cat-mobile' },
  { label: 'Entrepreneurship', dot: 'bg-cat-entrepreneurship' },
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
  const [slide, setSlide] = useState(0)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((current) => (current + 1) % HERO_BG_IMAGES.length)
    }, HERO_SLIDE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  function handleImageLoad(index: number) {
    setLoadedImages((current) => {
      const next = new Set(current)
      next.add(index)
      return next
    })
  }

  return (
    <div className="bg-surface-page">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Rotating background images (fallback: navy gradient if they fail to load) */}
        {HERO_BG_IMAGES.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ${slide === index && loadedImages.has(index) ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              src={src}
              alt=""
              loading={index === 0 ? 'eager' : 'lazy'}
              onLoad={() => handleImageLoad(index)}
              onError={() => handleImageLoad(index)}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-surface-page/80 via-surface-page/70 to-surface-page" />
          </div>
        ))}

        <div className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-blue-500/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 left-0 h-[400px] w-[400px] rounded-full bg-orange-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300">
              <Sparkles className="h-3.5 w-3.5" />
              Custospark Academy is open for enrollment
            </div>

            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Learn. Build.{' '}
              <span className="text-gradient-academy">Launch.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">{PRODUCT_TAGLINE_LONG}</p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {HERO_PILLS.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-border-default bg-surface-card px-4 py-1.5 text-xs font-medium text-text-secondary"
                >
                  {pill}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to={ROUTES.REGISTER} className="w-full sm:w-auto">
                <Button size="lg" className="w-full">
                  Start learning
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
                className="rounded-2xl border border-border-subtle bg-surface-card p-6 text-center"
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
              className="group rounded-2xl border border-border-subtle bg-surface-card p-6 transition-all hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-card-hover"
            >
              <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg ${benefit.color}`}>
                <benefit.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Categories */}
      <section className="bg-surface-section">
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
                  className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface-card p-5 transition-colors hover:border-border-strong"
                >
                  <span className={`h-3 w-3 rounded-full ${category.dot}`} />
                  <span className="font-semibold text-text-secondary">{category.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/10 via-orange-500/10 to-blue-500/5" />
        <div className="pointer-events-none absolute -right-32 top-0 h-72 w-72 rounded-full bg-orange-500/10 blur-[100px]" />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <img
              src="/custospark_academy_logo.png"
              alt="Custospark Academy"
              className="mx-auto mb-6 h-16 w-16 rounded-2xl object-contain shadow-lg shadow-blue-500/20"
            />
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Your future self is ready to learn
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-text-secondary">
              Join Custospark Academy and turn your curiosity into capability - with real projects,
              live guidance and certificates that open doors.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to={ROUTES.REGISTER} className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full">
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
      <section className="bg-surface-section">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:px-8">
          {[
            { icon: Users, text: 'Learn with a community' },
            { icon: CheckCircle2, text: 'Self-paced + live options' },
            { icon: Rocket, text: 'Launch projects, not just quizzes' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3 text-sm font-medium text-text-secondary">
              <item.icon className="h-5 w-5 text-blue-400" />
              {item.text}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}