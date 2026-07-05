import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BrainCircuit,
  Cctv,
  Github,
  Linkedin,
  Mail,
  MapPinned,
  Menu,
  Play,
  Rocket,
  Send,
  ShieldCheck,
  Twitter,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Logo } from "@/components/common/Logo";
import { TrafficAnimation } from "@/components/landing/TrafficAnimation";
import { fadeInUp, staggerContainer } from "@/components/common/PageTransition";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Prediction Engine",
    desc: "Deep-learning models forecast congestion up to 60 minutes ahead with 94.7% accuracy.",
  },
  {
    icon: MapPinned,
    title: "Interactive Live Map",
    desc: "Real-time traffic, incidents, cameras and route colouring on an OpenStreetMap canvas.",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    desc: "Daily, weekly and monthly trends, peak hours, vehicle mix and prediction accuracy.",
  },
  {
    icon: Cctv,
    title: "Camera Monitoring",
    desc: "Grid of live camera feeds with automatic vehicle detection and density scoring.",
  },
  {
    icon: Bell,
    title: "Smart Alert Center",
    desc: "Prioritised accident, weather, construction and emergency alerts in real time.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Role-based",
    desc: "Enterprise authentication with admin, operator and viewer access controls.",
  },
];

const stats = [
  { value: "94.7%", label: "Prediction accuracy" },
  { value: "142", label: "Live cameras" },
  { value: "1.2M+", label: "Daily data points" },
  { value: "38%", label: "Avg. delay reduction" },
];

const steps = [
  {
    icon: Cctv,
    title: "Collect",
    desc: "Ingest live feeds from cameras, sensors and GPS probes across the city grid.",
  },
  {
    icon: BrainCircuit,
    title: "Predict",
    desc: "AI models analyse patterns, weather and events to forecast congestion.",
  },
  {
    icon: Zap,
    title: "Act",
    desc: "Operators reroute traffic, trigger alerts and optimise signals in real time.",
  },
];

const team = [
  { name: "Aarav Sharma", role: "Team Lead · ML", img: "https://i.pravatar.cc/150?img=12" },
  { name: "Priya Nair", role: "Frontend Engineer", img: "https://i.pravatar.cc/150?img=45" },
  { name: "Rohan Mehta", role: "Backend Engineer", img: "https://i.pravatar.cc/150?img=33" },
  { name: "Sara Khan", role: "UI/UX Designer", img: "https://i.pravatar.cc/150?img=48" },
];

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "About", href: "#about" },
  { label: "Team", href: "#team" },
  { label: "Contact", href: "#contact" },
];

const contactSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
type ContactValues = z.infer<typeof contactSchema>;

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({ resolver: zodResolver(contactSchema) });

  const onContact = async (values: ContactValues) => {
    await new Promise((r) => setTimeout(r, 900));
    toast.success("Message sent!", {
      description: `Thanks ${values.name}, we'll be in touch shortly.`,
    });
    reset();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Button asChild variant="ghost">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild variant="gradient">
              <Link to="/register">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <button
            className="md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="border-t border-white/10 md:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm hover:bg-secondary"
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-2 flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild variant="gradient" className="flex-1">
                  <Link to="/register">Get started</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32">
        <div className="grid-bg absolute inset-0 opacity-30" />
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-24 lg:grid-cols-2 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.span
              variants={fadeInUp}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-muted-foreground"
            >
              <Rocket className="h-3.5 w-3.5 text-primary" /> AI-Powered Smart
              City Mobility
            </motion.span>
            <motion.h1
              variants={fadeInUp}
              className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
            >
              Smart Traffic <br />
              <span className="gradient-text">Congestion Prediction</span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="mt-6 max-w-xl text-lg text-muted-foreground"
            >
              Forecast city congestion before it happens. TrafficAI blends deep
              learning, live cameras and real-time analytics into one beautiful
              command center.
            </motion.p>
            <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="gradient">
                <Link to="/app/dashboard">
                  Launch Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/app/map">
                  <Play className="h-4 w-4" /> View Live Map
                </Link>
              </Button>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4"
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold gradient-text">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <TrafficAnimation />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-24 lg:px-8">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to tame traffic"
          subtitle="A complete toolkit for prediction, monitoring and response — designed for modern smart-city operations."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ y: -6 }}
              className="glass-card group p-6"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-violet-500/20 text-primary transition-transform group-hover:scale-110">
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-white/5 bg-white/[0.02] py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeading
            eyebrow="How it works"
            title="From raw feeds to smart action"
            subtitle="Three stages power the platform's real-time intelligence loop."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative glass-card p-8 text-center"
              >
                <span className="absolute right-6 top-6 text-5xl font-black text-white/5">
                  0{i + 1}
                </span>
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-500 text-white shadow-lg shadow-primary/30">
                  <s.icon className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-7xl px-4 py-24 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              About the project
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Built to keep cities moving
            </h2>
            <p className="mt-4 text-muted-foreground">
              This final-year project reimagines urban mobility with an AI-first
              approach. By fusing computer-vision camera detection, historical
              traffic patterns, weather and event data, TrafficAI predicts
              congestion before it forms — helping operators cut delays,
              prioritise emergencies and plan smarter routes.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Real-time ingestion from 142+ camera feeds",
                "Congestion forecasting with confidence scoring",
                "Emergency green-corridor prioritisation",
                "Actionable analytics for city planners",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-4"
          >
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`glass-card p-6 ${i % 2 === 1 ? "mt-8" : ""}`}
              >
                <p className="text-3xl font-bold gradient-text">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="border-y border-white/5 bg-white/[0.02] py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeading
            eyebrow="Team"
            title="Meet the makers"
            subtitle="The engineers and designers behind TrafficAI."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className="glass-card group overflow-hidden p-6 text-center"
              >
                <div className="relative mx-auto h-24 w-24">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 blur-md opacity-60 transition-opacity group-hover:opacity-100" />
                  <img
                    src={m.img}
                    alt={m.name}
                    className="relative h-24 w-24 rounded-full border-2 border-white/10 object-cover"
                  />
                </div>
                <h3 className="mt-4 font-semibold">{m.name}</h3>
                <p className="text-sm text-muted-foreground">{m.role}</p>
                <div className="mt-4 flex justify-center gap-2 text-muted-foreground">
                  <a href="#" className="hover:text-primary" aria-label="Twitter">
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a href="#" className="hover:text-primary" aria-label="LinkedIn">
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a href="#" className="hover:text-primary" aria-label="GitHub">
                    <Github className="h-4 w-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-7xl px-4 py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Contact"
              title="Get in touch"
              subtitle="Questions, feedback or a demo request? Drop us a line."
            />
            <div className="mt-8 space-y-4">
              {[
                { icon: Mail, label: "Email", value: "hello@trafficai.io" },
                { icon: MapPinned, label: "Location", value: "Bengaluru, India" },
                { icon: Zap, label: "Support", value: "24/7 monitoring desk" },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                    <c.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">{c.label}</p>
                    <p className="font-medium">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onContact)}
            className="glass-card space-y-4 p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="c-name">Name</Label>
                <Input id="c-name" placeholder="Your name" {...register("name")} />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-email">Email</Label>
                <Input
                  id="c-email"
                  placeholder="you@email.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-message">Message</Label>
              <Textarea
                id="c-message"
                placeholder="How can we help?"
                rows={5}
                {...register("message")}
              />
              {errors.message && (
                <p className="text-xs text-destructive">
                  {errors.message.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Sending…" : "Send message"}
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Logo />
              <p className="mt-4 max-w-sm text-sm text-muted-foreground">
                AI-based smart traffic congestion prediction system for the
                cities of tomorrow.
              </p>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold">Product</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/app/dashboard" className="hover:text-foreground">Dashboard</Link></li>
                <li><Link to="/app/map" className="hover:text-foreground">Live Map</Link></li>
                <li><Link to="/app/prediction" className="hover:text-foreground">Prediction</Link></li>
                <li><Link to="/app/analytics" className="hover:text-foreground">Analytics</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold">Account</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/login" className="hover:text-foreground">Sign in</Link></li>
                <li><Link to="/register" className="hover:text-foreground">Register</Link></li>
                <li><a href="#contact" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} TrafficAI. Final year project.
            </p>
            <div className="flex gap-3 text-muted-foreground">
              <a href="#" className="hover:text-primary" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="hover:text-primary" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="hover:text-primary" aria-label="GitHub">
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl"}
    >
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 text-muted-foreground">{subtitle}</p>}
    </motion.div>
  );
}
