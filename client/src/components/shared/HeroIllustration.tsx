import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RotateCw } from "lucide-react";

type ParticipantId = 'patient' | 'doctor' | 'asha';
type PositionSlot = 'left' | 'center' | 'right';

interface RoleDescription {
  id: ParticipantId;
  name: string;
  roleBadge: string;
  subtitle: string;
  summary: string;
  badgeStyle: string;
}

const ROLES_DATA: Record<ParticipantId, RoleDescription> = {
  patient: {
    id: 'patient',
    name: 'Arjun Kumar',
    roleBadge: 'Patient',
    subtitle: 'Central Care Recipient',
    summary: 'Shares symptoms and health observations to begin the care journey, receiving validated triage guidance and local care navigation without hospital travel.',
    badgeStyle: 'bg-teal-50 text-[var(--color-primary-dark)] border-teal-200'
  },
  doctor: {
    id: 'doctor',
    name: 'Dr. Priya Sharma',
    roleBadge: 'Medical Officer',
    subtitle: 'Primary Health Centre Physician',
    summary: 'Reviews prioritized community referral summaries, evaluates vital trends, and conducts tele-consultations or authorizes emergency transfers.',
    badgeStyle: 'bg-indigo-50 text-indigo-800 border-indigo-200'
  },
  asha: {
    id: 'asha',
    name: 'Rekha Devi',
    roleBadge: 'ASHA Field Worker',
    subtitle: 'Frontline Community Health Worker',
    summary: 'Conducts doorstep community screenings in Rampur Sector, collects vital signs, and initiates standardized triage escalations in the field.',
    badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200'
  }
};

export default function HeroIllustration({
  className = "",
}: {
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [activeRole, setActiveRole] = useState<ParticipantId>('patient');

  // Cycle sequence: Patient -> Doctor -> ASHA -> Patient
  const cycleNext = () => {
    setActiveRole(prev => {
      if (prev === 'patient') return 'doctor';
      if (prev === 'doctor') return 'asha';
      return 'patient';
    });
  };

  // Determine slot positions based on activeRole
  const getSlot = (id: ParticipantId): PositionSlot => {
    if (activeRole === 'patient') {
      if (id === 'patient') return 'center';
      if (id === 'asha') return 'left';
      return 'right';
    } else if (activeRole === 'doctor') {
      if (id === 'doctor') return 'center';
      if (id === 'patient') return 'left';
      return 'right';
    } else {
      // activeRole === 'asha'
      if (id === 'asha') return 'center';
      if (id === 'doctor') return 'left';
      return 'right';
    }
  };

  // Slot coordinates for SVG (viewBox: 0 0 680 380)
  const SLOT_COORDS: Record<PositionSlot, { x: number; y: number; scale: number; opacity: number; zIndex: number }> = {
    left: { x: 115, y: 175, scale: 0.88, opacity: 0.92, zIndex: 10 },
    center: { x: 340, y: 175, scale: 1.06, opacity: 1, zIndex: 30 },
    right: { x: 565, y: 175, scale: 0.88, opacity: 0.92, zIndex: 10 },
  };

  const activeData = ROLES_DATA[activeRole];

  return (
    <div
      className={`relative w-full max-w-[620px] mx-auto select-none flex flex-col items-center ${className}`}
      aria-label="Interactive SAHAYA Connected Care Journey Carousel"
      role="region"
    >
      {/* 1. Seamless SVG Canvas — No Outer Border, Blends into #F8FAFC */}
      <div className="relative w-full overflow-visible">
        
        {/* Soft, delicate ambient glow fading naturally into page */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(ellipse_at_50%_48%,rgba(204,251,241,0.5)_0%,rgba(240,253,250,0.3)_40%,transparent_70%)]" 
          aria-hidden="true" 
        />

        <svg
          viewBox="0 0 680 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto overflow-visible relative z-10"
        >
          <defs>
            {/* Soft, delicate card drop shadow */}
            <filter id="seamlessCardShadow" x="-20%" y="-20%" width="140%" height="145%" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#0F172A" floodOpacity="0.06" />
            </filter>

            {/* Prominent center card glow */}
            <filter id="centerActiveShadow" x="-25%" y="-25%" width="150%" height="155%" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0D9488" floodOpacity="0.12" />
            </filter>

            <linearGradient id="softTealLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0D9488" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#0D9488" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0D9488" stopOpacity="0.3" />
            </linearGradient>

            <linearGradient id="shieldGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0D9488" />
              <stop offset="100%" stopColor="#0F766E" />
            </linearGradient>
          </defs>

          {/* Delicate Circular Guide Orbit Rings */}
          <circle cx="340" cy="180" r="185" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 6" opacity="0.6" />
          <circle cx="340" cy="180" r="235" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="2 8" opacity="0.4" />

          {/* Delicate Connecting Care Arcs */}
          {/* Left to Center arc */}
          <path
            d="M 185 185 C 235 155, 245 155, 270 185"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M 185 185 C 235 155, 245 155, 270 185"
            stroke="url(#softTealLine)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="6 6"
            className={prefersReducedMotion ? "" : "animate-data-flow"}
          />

          {/* Center to Right arc */}
          <path
            d="M 410 185 C 435 155, 445 155, 495 185"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M 410 185 C 435 155, 445 155, 495 185"
            stroke="url(#softTealLine)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="6 6"
            className={prefersReducedMotion ? "" : "animate-data-flow"}
          />

          {/* Lower unifying arc connecting the entire cluster */}
          <path
            d="M 115 270 C 210 350, 470 350, 565 270"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            opacity="0.6"
            strokeLinecap="round"
          />

          {/* Animated data packet pulses */}
          {!prefersReducedMotion && (
            <>
              <motion.circle
                cx="225"
                cy="170"
                r="3.5"
                fill="#0D9488"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.25, 0.9] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              />
              <motion.circle
                cx="455"
                cy="170"
                r="3.5"
                fill="#0D9488"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.25, 0.9] }}
                transition={{ repeat: Infinity, duration: 2.2, delay: 1.1, ease: "easeInOut" }}
              />
            </>
          )}

          {/* =========================================================================
              CONTEXTUAL TELEMETRY CHIPS (Intelligently anchored to roles)
              ========================================================================= */}

          {/* When Patient is central: Show Vitals directly around Arjun */}
          {activeRole === 'patient' && (
            <>
              {/* Heart Rate Chip (Top-Left of Center) */}
              <g transform="translate(195, 40)" filter="url(#seamlessCardShadow)">
                <rect x="0" y="0" width="112" height="36" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
                <motion.circle
                  cx="16" cy="18" r="7" fill="#FEE2E2"
                  animate={prefersReducedMotion ? {} : { scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                />
                <path
                  d="M 12 18 L 14 18 L 15 14 L 17 21 L 18 18 L 20 18"
                  stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
                />
                <text x="30" y="15" fill="#64748B" fontSize="7.5" fontWeight="700" fontFamily="Inter, sans-serif">
                  HEART RATE
                </text>
                <text x="30" y="27" fill="#0F172A" fontSize="11.5" fontWeight="800" fontFamily="Inter, sans-serif">
                  74 <tspan fontSize="8" fontWeight="500" fill="#64748B">bpm</tspan>
                </text>
                <rect x="76" y="6" width="30" height="11" rx="3" fill="#F1F5F9" />
                <text x="91" y="14" textAnchor="middle" fill="#64748B" fontSize="6.5" fontWeight="700" fontFamily="Inter, sans-serif">
                  DEMO
                </text>
              </g>

              {/* SpO2 Chip (Top-Right of Center) */}
              <g transform="translate(375, 40)" filter="url(#seamlessCardShadow)">
                <rect x="0" y="0" width="112" height="36" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
                <circle cx="16" cy="18" r="7" fill="#E0F2FE" />
                <path d="M 16 13 L 13 19 L 19 19 Z" fill="#0284C7" />
                <text x="30" y="15" fill="#64748B" fontSize="7.5" fontWeight="700" fontFamily="Inter, sans-serif">
                  BLOOD O₂
                </text>
                <text x="30" y="27" fill="#0F172A" fontSize="11.5" fontWeight="800" fontFamily="Inter, sans-serif">
                  98 <tspan fontSize="8" fontWeight="500" fill="#64748B">%</tspan>
                </text>
                <rect x="76" y="6" width="30" height="11" rx="3" fill="#F1F5F9" />
                <text x="91" y="14" textAnchor="middle" fill="#64748B" fontSize="6.5" fontWeight="700" fontFamily="Inter, sans-serif">
                  DEMO
                </text>
              </g>
            </>
          )}

          {/* When Doctor is central: Vitals remain anchored to Arjun (on the left), and Clinical oversight floats around Doctor */}
          {activeRole === 'doctor' && (
            <>
              {/* Anchored to Arjun on Left */}
              <g transform="translate(50, 42)" filter="url(#seamlessCardShadow)">
                <rect x="0" y="0" width="130" height="34" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
                <circle cx="14" cy="17" r="6" fill="#FEE2E2" />
                <path d="M 11 17 L 13 17 L 14 14 L 16 20 L 17 17 L 19 17" stroke="#EF4444" strokeWidth="1.3" fill="none" />
                <text x="25" y="15" fill="#64748B" fontSize="7.5" fontWeight="700" fontFamily="Inter, sans-serif">
                  ARJUN&apos;S VITALS (DEMO)
                </text>
                <text x="25" y="26" fill="#0F172A" fontSize="10.5" fontWeight="800" fontFamily="Inter, sans-serif">
                  74 bpm • 98% SpO₂
                </text>
              </g>

              {/* Doctor Review Badge (Center Left) */}
              <g transform="translate(230, 42)" filter="url(#seamlessCardShadow)">
                <rect x="0" y="0" width="105" height="34" rx="8" fill="#FFFFFF" stroke="#C7D2FE" strokeWidth="1" />
                <circle cx="14" cy="17" r="6" fill="#EEF2FF" />
                <path d="M 11 17 L 14 20 L 18 14" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <text x="24" y="15" fill="#4338CA" fontSize="7.5" fontWeight="700" fontFamily="Inter, sans-serif">
                  QUEUE STATUS
                </text>
                <text x="24" y="26" fill="#0F172A" fontSize="10" fontWeight="800" fontFamily="Inter, sans-serif">
                  Active PHC Queue
                </text>
              </g>

              {/* Doctor Tele-Consult Ready (Center Right) */}
              <g transform="translate(355, 42)" filter="url(#seamlessCardShadow)">
                <rect x="0" y="0" width="115" height="34" rx="8" fill="#FFFFFF" stroke="#99F6E4" strokeWidth="1" />
                <circle cx="14" cy="17" r="6" fill="#F0FDFA" />
                <circle cx="14" cy="17" r="3" fill="#0D9488" />
                <text x="25" y="15" fill="#0F766E" fontSize="7.5" fontWeight="700" fontFamily="Inter, sans-serif">
                  TELE-TRIAGE
                </text>
                <text x="25" y="26" fill="#0F172A" fontSize="10" fontWeight="800" fontFamily="Inter, sans-serif">
                  Consultation Ready
                </text>
              </g>
            </>
          )}

          {/* When ASHA is central: Vitals remain anchored to Arjun (on the right), and Doorstep screening floats around ASHA */}
          {activeRole === 'asha' && (
            <>
              {/* Anchored to Arjun on Right */}
              <g transform="translate(500, 42)" filter="url(#seamlessCardShadow)">
                <rect x="0" y="0" width="130" height="34" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
                <circle cx="14" cy="17" r="6" fill="#FEE2E2" />
                <path d="M 11 17 L 13 17 L 14 14 L 16 20 L 17 17 L 19 17" stroke="#EF4444" strokeWidth="1.3" fill="none" />
                <text x="25" y="15" fill="#64748B" fontSize="7.5" fontWeight="700" fontFamily="Inter, sans-serif">
                  ARJUN&apos;S VITALS (DEMO)
                </text>
                <text x="25" y="26" fill="#0F172A" fontSize="10.5" fontWeight="800" fontFamily="Inter, sans-serif">
                  74 bpm • 98% SpO₂
                </text>
              </g>

              {/* ASHA Sector Badge (Center Left) */}
              <g transform="translate(230, 42)" filter="url(#seamlessCardShadow)">
                <rect x="0" y="0" width="110" height="34" rx="8" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="1" />
                <circle cx="14" cy="17" r="6" fill="#FFFBEB" />
                <circle cx="14" cy="17" r="3" fill="#F59E0B" />
                <text x="25" y="15" fill="#B45309" fontSize="7.5" fontWeight="700" fontFamily="Inter, sans-serif">
                  FIELD DESK
                </text>
                <text x="25" y="26" fill="#0F172A" fontSize="10" fontWeight="800" fontFamily="Inter, sans-serif">
                  Rampur Sector
                </text>
              </g>

              {/* ASHA Protocol Ready (Center Right) */}
              <g transform="translate(355, 42)" filter="url(#seamlessCardShadow)">
                <rect x="0" y="0" width="115" height="34" rx="8" fill="#FFFFFF" stroke="#99F6E4" strokeWidth="1" />
                <circle cx="14" cy="17" r="6" fill="#F0FDFA" />
                <circle cx="14" cy="17" r="3" fill="#0D9488" />
                <text x="25" y="15" fill="#0F766E" fontSize="7.5" fontWeight="700" fontFamily="Inter, sans-serif">
                  SCREENING
                </text>
                <text x="25" y="26" fill="#0F172A" fontSize="10" fontWeight="800" fontFamily="Inter, sans-serif">
                  Assisted Protocol
                </text>
              </g>
            </>
          )}

          {/* =========================================================================
              PARTICIPANT 1: ARJUN KUMAR (PATIENT)
              ========================================================================= */}
          {(() => {
            const slot = getSlot('patient');
            const pos = SLOT_COORDS[slot];
            const isCenter = slot === 'center';

            return (
              <motion.g
                key="patient-node"
                animate={prefersReducedMotion ? { x: pos.x - 70, y: pos.y - 85 } : {
                  x: pos.x - 70,
                  y: pos.y - 85,
                  scale: pos.scale,
                }}
                transition={{ type: "spring", stiffness: 220, damping: 24 }}
                onClick={() => setActiveRole('patient')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveRole('patient');
                  }
                }}
                className="cursor-pointer focus:outline-none"
                tabIndex={0}
                role="button"
                aria-label="Select Patient Arjun Kumar"
              >
                {/* Card Surface */}
                <rect
                  x="0"
                  y="0"
                  width="140"
                  height="170"
                  rx="15"
                  fill="#FFFFFF"
                  stroke={isCenter ? "#0D9488" : "#E2E8F0"}
                  strokeWidth={isCenter ? "2.5" : "1.2"}
                  filter={isCenter ? "url(#centerActiveShadow)" : "url(#seamlessCardShadow)"}
                />

                {/* Patient Role Tag */}
                <rect x="12" y="10" width="50" height="16" rx="4" fill="#F0FDFA" stroke="#CCFBF1" strokeWidth="1" />
                <text x="37" y="21.5" textAnchor="middle" fill="#0F766E" fontSize="8" fontWeight="800" fontFamily="Inter, sans-serif">
                  PATIENT
                </text>
                {isCenter && <circle cx="126" cy="18" r="3.5" fill="#10B981" />}

                {/* Human Portrait: Arjun Kumar */}
                <g transform="translate(70, 60)">
                  {/* Background Halo */}
                  <circle cx="0" cy="0" r={isCenter ? "31" : "28"} fill="#F0FDFA" stroke="#CCFBF1" strokeWidth="1.5" />

                  {/* Neck */}
                  <rect x="-6" y="15" width="12" height="15" rx="3" fill="#C5906C" />
                  <path d="M -6 15 Q 0 19 6 15" stroke="#AF7B58" strokeWidth="1.2" fill="none" />

                  {/* Shoulders & Casual Collared Shirt */}
                  <path
                    d="M -30 38 C -30 26, -16 21, 0 21 C 16 21, 30 26, 30 38 Z"
                    fill="#0F766E"
                  />
                  {/* Collar details */}
                  <path d="M -8 21 L -14 31 L -4 30 Z" fill="#115E59" />
                  <path d="M 8 21 L 14 31 L 4 30 Z" fill="#115E59" />
                  <line x1="0" y1="30" x2="0" y2="38" stroke="#CCFBF1" strokeWidth="1.5" />

                  {/* Ears with inner lobe details */}
                  <circle cx="-16.5" cy="-7" r="4.2" fill="#C5906C" />
                  <circle cx="16.5" cy="-7" r="4.2" fill="#C5906C" />
                  <path d="M -16 -8 Q -15 -6 -16 -4" stroke="#AF7B58" strokeWidth="1" fill="none" />
                  <path d="M 16 -8 Q 15 -6 16 -4" stroke="#AF7B58" strokeWidth="1" fill="none" />

                  {/* Face Contour with Shading */}
                  <path
                    d="M -15 -10 C -15 -17, -13 -23, 0 -23 C 13 -23, 15 -17, 15 -10 C 15 3, 11 13, 0 13 C -11 13, -15 3, -15 -10 Z"
                    fill="#DCA580"
                  />

                  {/* Modern Textured Haircut */}
                  <path
                    d="M -17 -13 C -18 -26, -12 -33, 0 -33 C 12 -33, 18 -26, 17 -13 C 16 -19, 12 -23, 9 -22 C 3 -25, -5 -25, -11 -22 C -14 -23, -18 -19, -17 -13 Z"
                    fill="#18181B"
                  />
                  <path d="M -10 -25 Q 0 -29 10 -26" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" fill="none" />

                  {/* Eyebrows */}
                  <path d="M -11 -13 Q -7 -15 -3 -13" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                  <path d="M 3 -13 Q 7 -15 11 -13" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" fill="none" />

                  {/* Detailed Eyes with pupils and highlights */}
                  <circle cx="-6.5" cy="-8" r="2.2" fill="#0F172A" />
                  <circle cx="-5.8" cy="-8.8" r="0.7" fill="#FFFFFF" />
                  <circle cx="6.5" cy="-8" r="2.2" fill="#0F172A" />
                  <circle cx="7.2" cy="-8.8" r="0.7" fill="#FFFFFF" />

                  {/* Defined Nose */}
                  <path d="M 0 -10 L -1 -2 Q 0 -0.5 1.5 -2" stroke="#B07B57" strokeWidth="1.2" strokeLinecap="round" fill="none" />

                  {/* Warm Smile */}
                  <path d="M -5.5 4.5 Q 0 9 5.5 4.5" stroke="#9A5949" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                </g>

                {/* Name & Subtitle */}
                <text x="70" y="118" textAnchor="middle" fill="#0F172A" fontSize={isCenter ? "12.5" : "11.5"} fontWeight="bold" fontFamily="Inter, sans-serif">
                  Arjun Kumar
                </text>
                <text x="70" y="132" textAnchor="middle" fill="#64748B" fontSize="9.5" fontWeight="500" fontFamily="Inter, sans-serif">
                  28 yrs • Rampur
                </text>

                {/* Role Pill */}
                <rect x="20" y="142" width="100" height="20" rx="5" fill="#F0FDFA" stroke="#99F6E4" strokeWidth="0.8" />
                <circle cx="30" cy="152" r="3" fill="#0D9488" />
                <text x="66" y="155.5" textAnchor="middle" fill="#0F766E" fontSize="8.5" fontWeight="700" fontFamily="Inter, sans-serif">
                  Triaged: Stable
                </text>

                {/* Transparent Hit Target */}
                <rect x="0" y="0" width="140" height="170" rx="15" fill="transparent" style={{ pointerEvents: 'all', cursor: 'pointer' }} />
              </motion.g>
            );
          })()}

          {/* =========================================================================
              PARTICIPANT 2: DR. PRIYA SHARMA (DOCTOR)
              ========================================================================= */}
          {(() => {
            const slot = getSlot('doctor');
            const pos = SLOT_COORDS[slot];
            const isCenter = slot === 'center';

            return (
              <motion.g
                key="doctor-node"
                animate={prefersReducedMotion ? { x: pos.x - 70, y: pos.y - 85 } : {
                  x: pos.x - 70,
                  y: pos.y - 85,
                  scale: pos.scale,
                }}
                transition={{ type: "spring", stiffness: 220, damping: 24 }}
                onClick={() => setActiveRole('doctor')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveRole('doctor');
                  }
                }}
                className="cursor-pointer focus:outline-none"
                tabIndex={0}
                role="button"
                aria-label="Select Doctor Dr. Priya Sharma"
              >
                {/* Card Surface */}
                <rect
                  x="0"
                  y="0"
                  width="140"
                  height="170"
                  rx="15"
                  fill="#FFFFFF"
                  stroke={isCenter ? "#6366F1" : "#E2E8F0"}
                  strokeWidth={isCenter ? "2.5" : "1.2"}
                  filter={isCenter ? "url(#centerActiveShadow)" : "url(#seamlessCardShadow)"}
                />

                {/* Doctor Role Tag */}
                <rect x="12" y="10" width="60" height="16" rx="4" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="1" />
                <text x="42" y="21.5" textAnchor="middle" fill="#3730A3" fontSize="8" fontWeight="800" fontFamily="Inter, sans-serif">
                  MD REVIEW
                </text>
                {isCenter && <circle cx="126" cy="18" r="3.5" fill="#6366F1" />}

                {/* Human Portrait: Dr. Priya Sharma */}
                <g transform="translate(70, 60)">
                  {/* Background Halo */}
                  <circle cx="0" cy="0" r={isCenter ? "31" : "28"} fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="1.5" />

                  {/* Slender Neck */}
                  <rect x="-5.5" y="15" width="11" height="14" rx="2.5" fill="#CF9B72" />

                  {/* Teal scrub collar */}
                  <path d="M -7 20 L 0 27 L 7 20 Z" fill="#0D9488" />

                  {/* White Physician Lab Coat & Lapels */}
                  <path
                    d="M -30 38 C -30 26, -16 20, 0 20 C 16 20, 30 26, 30 38 Z"
                    fill="#FFFFFF"
                    stroke="#CBD5E1"
                    strokeWidth="1"
                  />
                  <path d="M -8 20 L -12 36 L -4 36 Z" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.8" />
                  <path d="M 8 20 L 12 36 L 4 36 Z" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.8" />

                  {/* Stethoscope gracefully draped around neck */}
                  <path
                    d="M -11 19 Q -16 28 -8 33 Q 0 38 8 33 Q 16 28 11 19"
                    stroke="#334155" strokeWidth="2.2" strokeLinecap="round" fill="none"
                  />
                  <line x1="0" y1="36" x2="0" y2="40" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="0" cy="40" r="3.5" fill="#94A3B8" stroke="#475569" strokeWidth="1" />

                  {/* Hair silhouette: Professional Layered Lob */}
                  <path
                    d="M -17 -8 C -19 -20, -13 -30, 0 -30 C 13 -30, 19 -20, 17 -8 C 17 2, 15 10, 13 13 C 12 11, 13 1, 13 -5 C 12 -15, 7 -20, 0 -20 C -7 -20, -12 -15, -13 -5 C -13 1, -12 11, -13 13 C -15 10, -17 2, -17 -8 Z"
                    fill="#1A181E"
                  />
                  <path d="M -7 -25 Q 1 -27 8 -24" stroke="#3F3F46" strokeWidth="1.2" strokeLinecap="round" fill="none" />

                  {/* Feminine Face Shape */}
                  <path
                    d="M -14 -10 C -14 -17, -11 -23, 0 -23 C 11 -23, 14 -17, 14 -10 C 14 3, 10 12, 0 12 C -10 12, -14 3, -14 -10 Z"
                    fill="#E5B490"
                  />

                  {/* Ears */}
                  <circle cx="-15" cy="-7" r="3.8" fill="#CF9B72" />
                  <circle cx="15" cy="-7" r="3.8" fill="#CF9B72" />

                  {/* Arched Brows */}
                  <path d="M -10 -13 Q -6 -15 -2 -13" stroke="#1A181E" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                  <path d="M 2 -13 Q 6 -15 10 -13" stroke="#1A181E" strokeWidth="1.6" strokeLinecap="round" fill="none" />

                  {/* Attentive Eyes with catchlights */}
                  <circle cx="-5.5" cy="-8" r="2.1" fill="#0F172A" />
                  <circle cx="-4.8" cy="-8.8" r="0.6" fill="#FFFFFF" />
                  <circle cx="5.5" cy="-8" r="2.1" fill="#0F172A" />
                  <circle cx="6.2" cy="-8.8" r="0.6" fill="#FFFFFF" />

                  {/* Delicate Nose */}
                  <path d="M 0 -10 L -0.8 -2 Q 0 -0.5 1.2 -2" stroke="#B87D56" strokeWidth="1.2" strokeLinecap="round" fill="none" />

                  {/* Confident Reassuring Doctor Smile */}
                  <path d="M -5 4.5 Q 0 8.5 5 4.5" stroke="#C06252" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                </g>

                {/* Doctor Name & Subtitle */}
                <text x="70" y="118" textAnchor="middle" fill="#0F172A" fontSize={isCenter ? "12.5" : "11.5"} fontWeight="bold" fontFamily="Inter, sans-serif">
                  Dr. Priya Sharma
                </text>
                <text x="70" y="132" textAnchor="middle" fill="#64748B" fontSize="9.5" fontWeight="500" fontFamily="Inter, sans-serif">
                  PHC Tele-Triage
                </text>

                {/* Role Pill */}
                <rect x="20" y="142" width="100" height="20" rx="5" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="0.8" />
                <circle cx="30" cy="152" r="3" fill="#6366F1" />
                <text x="66" y="155.5" textAnchor="middle" fill="#4338CA" fontSize="8.5" fontWeight="700" fontFamily="Inter, sans-serif">
                  Clinical Review
                </text>

                {/* Transparent Hit Target */}
                <rect x="0" y="0" width="140" height="170" rx="15" fill="transparent" style={{ pointerEvents: 'all', cursor: 'pointer' }} />
              </motion.g>
            );
          })()}

          {/* =========================================================================
              PARTICIPANT 3: REKHA DEVI (ASHA WORKER)
              ========================================================================= */}
          {(() => {
            const slot = getSlot('asha');
            const pos = SLOT_COORDS[slot];
            const isCenter = slot === 'center';

            return (
              <motion.g
                key="asha-node"
                animate={prefersReducedMotion ? { x: pos.x - 70, y: pos.y - 85 } : {
                  x: pos.x - 70,
                  y: pos.y - 85,
                  scale: pos.scale,
                }}
                transition={{ type: "spring", stiffness: 220, damping: 24 }}
                onClick={() => setActiveRole('asha')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveRole('asha');
                  }
                }}
                className="cursor-pointer focus:outline-none"
                tabIndex={0}
                role="button"
                aria-label="Select ASHA Worker Rekha Devi"
              >
                {/* Card Surface */}
                <rect
                  x="0"
                  y="0"
                  width="140"
                  height="170"
                  rx="15"
                  fill="#FFFFFF"
                  stroke={isCenter ? "#F59E0B" : "#E2E8F0"}
                  strokeWidth={isCenter ? "2.5" : "1.2"}
                  filter={isCenter ? "url(#centerActiveShadow)" : "url(#seamlessCardShadow)"}
                />

                {/* ASHA Role Tag */}
                <rect x="12" y="10" width="60" height="16" rx="4" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="1" />
                <text x="42" y="21.5" textAnchor="middle" fill="#92400E" fontSize="8" fontWeight="800" fontFamily="Inter, sans-serif">
                  ASHA FIELD
                </text>
                {isCenter && <circle cx="126" cy="18" r="3.5" fill="#F59E0B" />}

                {/* Human Portrait: Rekha Devi */}
                <g transform="translate(70, 60)">
                  {/* Background Halo */}
                  <circle cx="0" cy="0" r={isCenter ? "31" : "28"} fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1.5" />

                  {/* Warm Neck */}
                  <rect x="-5.5" y="15" width="11" height="14" rx="2.5" fill="#B3784D" />

                  {/* Traditional Healthcare Kurti & Teal Border Saree Pallu */}
                  <path
                    d="M -30 38 C -30 26, -16 21, 0 21 C 16 21, 30 26, 30 38 Z"
                    fill="#F59E0B"
                  />
                  {/* Deep Teal draped pallu across left shoulder */}
                  <path
                    d="M -28 38 C -24 26, -12 21, 0 21 L 8 38 Z"
                    fill="#0D9488"
                  />
                  <path d="M -22 38 L 0 21" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Pinned Official ASHA Identification Badge */}
                  <path d="M -3 22 L 2 29" stroke="#0D9488" strokeWidth="1.4" />
                  <rect x="-2" y="27" width="14" height="10" rx="1.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
                  <rect x="-0.5" y="28.5" width="4.5" height="4.5" fill="#0D9488" />
                  <line x1="5.5" y1="29.5" x2="10" y2="29.5" stroke="#94A3B8" strokeWidth="0.8" />

                  {/* Traditional Hair Bun silhouette behind head */}
                  <circle cx="0" cy="-26" r="16" fill="#18181B" />

                  {/* Warm Golden-Brown Complexion Contour */}
                  <path
                    d="M -14 -10 C -14 -17, -11 -23, 0 -23 C 11 -23, 14 -17, 14 -10 C 14 3, 10 12, 0 12 C -10 12, -14 3, -14 -10 Z"
                    fill="#CD8F64"
                  />

                  {/* Ears with traditional gold studs */}
                  <circle cx="-15" cy="-7" r="3.8" fill="#B3784D" />
                  <circle cx="-15" cy="-5" r="1.3" fill="#F59E0B" />
                  <circle cx="15" cy="-7" r="3.8" fill="#B3784D" />
                  <circle cx="15" cy="-5" r="1.3" fill="#F59E0B" />

                  {/* Center-parted hair framing forehead */}
                  <path
                    d="M -16 -12 C -16 -24, -11 -29, 0 -29 C 11 -29, 16 -24, 16 -12 C 14 -18, 8 -22, 1 -21 C -7 -22, -14 -18, -16 -12 Z"
                    fill="#18181B"
                  />

                  {/* Traditional Maroon Bindi */}
                  <circle cx="0" cy="-15" r="1.6" fill="#881337" />

                  {/* Eyebrows */}
                  <path d="M -10 -13 Q -6 -15 -2 -13" stroke="#18181B" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                  <path d="M 2 -13 Q 6 -15 10 -13" stroke="#18181B" strokeWidth="1.6" strokeLinecap="round" fill="none" />

                  {/* Compassionate Eyes with catchlights */}
                  <circle cx="-5.5" cy="-8" r="2.1" fill="#0F172A" />
                  <circle cx="-4.8" cy="-8.8" r="0.6" fill="#FFFFFF" />
                  <circle cx="5.5" cy="-8" r="2.1" fill="#0F172A" />
                  <circle cx="6.2" cy="-8.8" r="0.6" fill="#FFFFFF" />

                  {/* Nose with subtle gold nose pin stud */}
                  <path d="M 0 -10 L -0.8 -2 Q 0 -0.5 1.2 -2" stroke="#A87046" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                  <circle cx="2" cy="-2.5" r="0.8" fill="#F59E0B" />

                  {/* Empathetic Approachable Smile */}
                  <path d="M -5 4.5 Q 0 8.5 5 4.5" stroke="#B55740" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                </g>

                {/* ASHA Name & Subtitle */}
                <text x="70" y="118" textAnchor="middle" fill="#0F172A" fontSize={isCenter ? "12.5" : "11.5"} fontWeight="bold" fontFamily="Inter, sans-serif">
                  Rekha Devi
                </text>
                <text x="70" y="132" textAnchor="middle" fill="#64748B" fontSize="9.5" fontWeight="500" fontFamily="Inter, sans-serif">
                  Doorstep Screening
                </text>

                {/* Role Pill */}
                <rect x="20" y="142" width="100" height="20" rx="5" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="0.8" />
                <circle cx="30" cy="152" r="3" fill="#D97706" />
                <text x="66" y="155.5" textAnchor="middle" fill="#92400E" fontSize="8.5" fontWeight="700" fontFamily="Inter, sans-serif">
                  Field Outreach
                </text>

                {/* Transparent Hit Target */}
                <rect x="0" y="0" width="140" height="170" rx="15" fill="transparent" style={{ pointerEvents: 'all', cursor: 'pointer' }} />
              </motion.g>
            );
          })()}

          {/* =========================================================================
              BOTTOM COMPONENT: PROTOCOL VERIFIED BADGE (Workflow-wide)
              ========================================================================= */}
          <g transform="translate(230, 315)" filter="url(#seamlessCardShadow)">
            <rect
              x="0"
              y="0"
              width="220"
              height="36"
              rx="18"
              fill="#FFFFFF"
              stroke="#99F6E4"
              strokeWidth="1.2"
            />
            {/* Shield Icon Badge */}
            <rect x="4" y="4" width="28" height="28" rx="14" fill="url(#shieldGrad2)" />
            <path
              d="M 13 18 L 17 22 L 23 14"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            <text
              x="42"
              y="17.5"
              fill="#0F172A"
              fontSize="10"
              fontWeight="bold"
              fontFamily="Inter, sans-serif"
            >
              Standard Protocol Verified
            </text>
            <text
              x="42"
              y="28"
              fill="#0D9488"
              fontSize="8"
              fontWeight="600"
              fontFamily="Inter, sans-serif"
            >
              Tele-Triage Care Navigation Engine
            </text>
          </g>

        </svg>

      </div>

      {/* 2. Integrated Role Information & Next-Step Control (Directly Blended, No Boxed Panel) */}
      <div className="w-full max-w-[560px] mt-2 flex flex-col items-center">
        
        {/* Minimal Participant Switcher Dots & Next Control */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between w-full px-2 py-1.5 border-t border-slate-200/60 text-xs gap-2">
          
          {/* Quick Participant Selector Tabs */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5" role="tablist" aria-label="Select active participant">
            {(['patient', 'doctor', 'asha'] as ParticipantId[]).map((id) => {
              const r = ROLES_DATA[id];
              const isActive = activeRole === id;
              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveRole(id)}
                  className={`px-2 sm:px-2.5 py-1 rounded-full text-[10.5px] sm:text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    id === 'patient' ? 'bg-teal-400' :
                    id === 'doctor' ? 'bg-indigo-400' : 'bg-amber-400'
                  }`} />
                  <span>{r.roleBadge}</span>
                </button>
              );
            })}
          </div>

          {/* Obvious Next-Step Control */}
          <button
            type="button"
            onClick={cycleNext}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-teal-50 text-[var(--color-primary-dark)] hover:bg-teal-100/80 border border-teal-200/80 transition-all cursor-pointer shadow-2xs shrink-0"
            title="Cycle to next role in the care journey"
          >
            <span>Explore Next Role</span>
            <RotateCw size={12} className={prefersReducedMotion ? "" : "group-hover:rotate-45 transition-transform"} />
          </button>

        </div>

        {/* Integrated Role Context Summary (Stable footprint, zero layout shifts) */}
        <div className="w-full px-3 py-2 text-left min-h-[58px]">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-slate-900 text-xs sm:text-sm">
              {activeData.name}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-[11px] font-semibold text-slate-500">
              {activeData.subtitle}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {activeData.summary}
          </p>
        </div>

      </div>

    </div>
  );
}
