import { useNavigate } from "react-router-dom";
import { UserCircle, Stethoscope, HeartPulse, Activity } from "lucide-react";
import FloatingCard from "../components/shared/FloatingCard";
import HeroIllustration from "../components/shared/HeroIllustration";
import Footer from "../components/shared/Footer";
import { motion, useScroll, useTransform } from "framer-motion";

const BG_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260424_064411_9e9d7f84-9277-41f4-ab10-59172d89e6be.mp4";

export default function Landing() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const heroParallaxY = useTransform(scrollY, [0, 300], [0, 20]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.6 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 200, damping: 20 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-primary-light)] via-[var(--color-bg)] to-white">
      {/* Video is scoped to this wrapper only — it never bleeds into the footer below */}
      <div className="relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 z-0 pointer-events-none"
          aria-hidden="true"
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-[0.5]"
          >
            <source src={BG_VIDEO_URL} type="video/mp4" />
          </video>
          {/* Light wash only near the top, behind the headline, so the video reads clearly further down */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/15 to-transparent" />
        </motion.div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-8 pb-10">
          {/* Hero: headline + dynamic illustration side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] items-center gap-6 mb-12">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    duration: 0.6,
                  }}
                  className="p-4 bg-white rounded-2xl shadow-sm text-[var(--color-primary)]"
                >
                  <Activity size={40} strokeWidth={2.5} />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
                  className="text-5xl md:text-6xl font-extrabold text-[var(--color-text-primary)] tracking-tight"
                >
                  SAHAYA
                </motion.h1>
              </div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-2 max-w-xl mx-auto lg:mx-0 leading-tight"
              >
                Helping the First Healthcare Worker Make the Right First
                Decision.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                className="text-xl text-[var(--color-text-muted)] max-w-md mx-auto lg:mx-0 font-medium"
              >
                Healthcare Without Hospitals
              </motion.p>
            </div>

            <motion.div
              style={{ y: heroParallaxY }}
              className="lg:justify-self-end w-full"
            >
              <HeroIllustration />
            </motion.div>
          </div>

          {/* The three actual entry points into the app */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Patient Card */}
            <motion.div variants={itemVariants}>
              <FloatingCard
                hoverable
                onClick={() => navigate("/patient")}
                className="h-full flex flex-col items-center justify-center gap-4 p-8 group hover:shadow-xl transition-shadow duration-300 bg-white/40 backdrop-blur-md border-white/50"
              >
                <div className="w-20 h-20 rounded-[20px] bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <UserCircle size={40} strokeWidth={1.5} />
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">
                    Patient
                  </h3>
                  <p className="text-[var(--color-text-muted)] font-medium">
                    Assess your health
                  </p>
                </div>
              </FloatingCard>
            </motion.div>

            {/* ASHA Worker Card */}
            <motion.div variants={itemVariants}>
              <FloatingCard
                hoverable
                onClick={() => navigate("/asha")}
                className="h-full flex flex-col items-center justify-center gap-4 p-8 group border-t-4 border-t-[var(--color-warning)] md:border-t-[var(--color-border)]/50 md:hover:border-t-[var(--color-warning)] hover:shadow-xl transition-all duration-300 bg-white/40 backdrop-blur-md border-white/50"
              >
                <div className="w-20 h-20 rounded-[20px] bg-amber-50 text-[var(--color-warning)] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <HeartPulse size={40} strokeWidth={1.5} />
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">
                    ASHA Worker
                  </h3>
                  <p className="text-[var(--color-text-muted)] font-medium">
                    Assess & support patients
                  </p>
                </div>
              </FloatingCard>
            </motion.div>

            {/* Doctor Card */}
            <motion.div variants={itemVariants}>
              <FloatingCard
                hoverable
                onClick={() => navigate("/doctor")}
                className="h-full flex flex-col items-center justify-center gap-4 p-8 group border-t-4 border-t-[var(--color-accent)] md:border-t-[var(--color-border)]/50 md:hover:border-t-[var(--color-accent)] hover:shadow-xl transition-all duration-300 bg-white/40 backdrop-blur-md border-white/50"
              >
                <div className="w-20 h-20 rounded-[20px] bg-indigo-50 text-[var(--color-accent)] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Stethoscope size={40} strokeWidth={1.5} />
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">
                    Doctor
                  </h3>
                  <p className="text-[var(--color-text-muted)] font-medium">
                    View & manage cases
                  </p>
                </div>
              </FloatingCard>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
