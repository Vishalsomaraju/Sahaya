import { useNavigate } from "react-router-dom";
import { UserCircle, Stethoscope, HeartPulse, Activity } from "lucide-react";
import FloatingCard from "../components/shared/FloatingCard";
import HeroIllustration from "../components/shared/HeroIllustration";
import { motion } from "framer-motion";

export default function Landing() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-primary-light)] via-[var(--color-bg)] to-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-24">
        {/* Hero: headline + dynamic illustration side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] items-center gap-10 mb-20">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
              <div className="p-4 bg-white rounded-2xl shadow-sm text-[var(--color-primary)]">
                <Activity size={40} strokeWidth={2.5} />
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
                SAHAYA
              </h1>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4 max-w-xl mx-auto lg:mx-0 leading-tight">
              Helping the First Healthcare Worker Make the Right First Decision.
            </h2>
            <p className="text-xl text-[var(--color-text-muted)] max-w-md mx-auto lg:mx-0 font-medium">
              Healthcare Without Hospitals
            </p>
          </motion.div>

          <HeroIllustration className="lg:justify-self-end" />
        </div>

        {/* The three actual entry points into the app */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Patient Card */}
          <motion.div variants={itemVariants}>
            <FloatingCard
              hoverable
              onClick={() => navigate("/patient")}
              className="h-full flex flex-col items-center justify-center gap-6 p-10 group"
            >
              <div className="w-24 h-24 rounded-[24px] bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <UserCircle size={48} strokeWidth={1.5} />
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
              className="h-full flex flex-col items-center justify-center gap-6 p-10 group border-t-4 border-t-[var(--color-warning)] md:border-t-[var(--color-border)]/50 md:hover:border-t-[var(--color-warning)] transition-colors"
            >
              <div className="w-24 h-24 rounded-[24px] bg-amber-50 text-[var(--color-warning)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <HeartPulse size={48} strokeWidth={1.5} />
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
              className="h-full flex flex-col items-center justify-center gap-6 p-10 group border-t-4 border-t-[var(--color-accent)] md:border-t-[var(--color-border)]/50 md:hover:border-t-[var(--color-accent)] transition-colors"
            >
              <div className="w-24 h-24 rounded-[24px] bg-indigo-50 text-[var(--color-accent)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Stethoscope size={48} strokeWidth={1.5} />
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-20 text-sm text-[var(--color-text-muted)] font-medium text-center"
        >
          &copy; {new Date().getFullYear()} SAHAYA Platform
        </motion.div>
      </div>
    </div>
  );
}
