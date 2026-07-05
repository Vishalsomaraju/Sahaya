import { Activity, Heart, Mail } from "lucide-react";
import { motion } from "framer-motion";

const navLinks = [
  { label: "Patient", href: "/patient" },
  { label: "ASHA Worker", href: "/asha" },
  { label: "Doctor", href: "/doctor" },
];

const socialLinks = [
  { label: "GitHub", href: "#" },
  { label: "LinkedIn", href: "#" },
];

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative z-10 bg-[var(--color-text-primary)]"
    >
      <div className="h-1 w-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-warning)]" />

      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/10 rounded-lg text-white">
            <Activity size={16} strokeWidth={2.5} />
          </div>
          <span className="text-sm font-extrabold text-white tracking-tight">
            SAHAYA
          </span>
        </div>

        {/* Core nav */}
        <nav className="flex items-center gap-5">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-white/60 font-medium hover:text-white transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Copyright + contact */}
        <div className="flex items-center gap-4">
          <p className="text-xs text-white/50 font-medium">
            &copy; {new Date().getFullYear()} SAHAYA
          </p>
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs text-white/50 font-semibold hover:text-white transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#"
            aria-label="Contact"
            className="text-white/50 hover:text-white transition-colors duration-200"
          >
            <Mail size={14} />
          </a>
          <Heart
            size={12}
            className="text-[var(--color-warning)] fill-current hidden md:block"
          />
        </div>
      </div>
    </motion.footer>
  );
}
