import { motion } from "framer-motion";

/**
 * Dynamic hero illustration for the SAHAYA landing page.
 * Captures the reference's visual language — flat vector healthcare
 * illustration, organic blob backdrop, teal palette, floating icon
 * accents, soft doodle linework — as native web content rather than
 * a literal phone-mockup screenshot.
 */
export default function HeroIllustration({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`relative w-full max-w-[520px] mx-auto ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 520 460" className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="blobFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-primary-light, #E4F2F0)" />
            <stop offset="100%" stopColor="#CFEBE6" />
          </linearGradient>
          <linearGradient id="coatFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F1F6F5" />
          </linearGradient>
        </defs>

        {/* Organic blob backdrop */}
        <motion.path
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          d="M110 60 C220 -10 380 10 440 110 C500 210 470 340 370 400 C270 460 130 440 70 350 C10 260 0 130 110 60 Z"
          fill="url(#blobFill)"
        />

        {/* Soft doodle accent lines */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          d="M40 120 Q65 95 95 115 T150 105"
          stroke="var(--color-primary, #2E9188)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          d="M400 380 Q430 400 420 430"
          stroke="var(--color-warning, #F59E0B)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Doctor figure — flat vector, simplified */}
        <g transform="translate(150 130)">
          {/* head */}
          <circle cx="70" cy="30" r="34" fill="#3A4A52" opacity="0.9" />
          <circle cx="70" cy="26" r="26" fill="#F4C99B" />
          {/* hair */}
          <path
            d="M44 20 Q70 -8 96 20 Q96 4 70 0 Q44 4 44 20 Z"
            fill="#2B2B2B"
          />
          {/* coat body */}
          <path
            d="M20 190 C20 120 40 78 70 78 C100 78 120 120 120 190 Z"
            fill="url(#coatFill)"
            stroke="var(--color-primary, #2E9188)"
            strokeWidth="2"
          />
          {/* coat lapel */}
          <path
            d="M55 90 L70 130 L85 90"
            fill="none"
            stroke="var(--color-primary, #2E9188)"
            strokeWidth="2"
          />
          {/* stethoscope */}
          <path
            d="M55 100 Q50 140 70 150 Q90 140 85 100"
            fill="none"
            stroke="var(--color-primary, #2E9188)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="70" cy="152" r="6" fill="var(--color-primary, #2E9188)" />
        </g>

        {/* Patient figure — simplified, seated */}
        <g transform="translate(300 190)">
          <circle cx="40" cy="20" r="24" fill="#F4C99B" />
          <path
            d="M18 12 Q40 -6 62 12 Q62 0 40 -4 Q18 0 18 12 Z"
            fill="#5B4636"
          />
          <path
            d="M0 150 C0 95 16 62 40 62 C64 62 80 95 80 150 Z"
            fill="var(--color-warning, #F59E0B)"
            opacity="0.85"
          />
        </g>

        {/* Floating icon badges */}
        <motion.g
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <circle
            cx="440"
            cy="90"
            r="26"
            fill="white"
            stroke="#EDEDED"
            strokeWidth="1"
          />
          <path
            d="M430 90 h6 l4 -10 l6 20 l4 -10 h6"
            fill="none"
            stroke="var(--color-danger, #E4572E)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>

        <motion.g
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.75 }}
        >
          <circle
            cx="90"
            cy="330"
            r="24"
            fill="white"
            stroke="#EDEDED"
            strokeWidth="1"
          />
          <path
            d="M78 330 c0 -8 12 -8 12 0 c0 8 -12 8 -12 0"
            fill="var(--color-primary, #2E9188)"
          />
          <path
            d="M90 322 v-8 M86 318 h8"
            stroke="var(--color-primary, #2E9188)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </motion.g>

        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9, type: "spring" }}
        >
          <circle
            cx="440"
            cy="360"
            r="22"
            fill="var(--color-primary, #2E9188)"
          />
          <path
            d="M430 360 l7 7 l13 -13"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>
      </svg>
    </div>
  );
}
