import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Activity, 
  UserCircle, 
  Stethoscope, 
  HeartPulse, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Menu, 
  X,
  Radio,
  FileText
} from "lucide-react";
import FloatingCard from "../components/shared/FloatingCard";
import Button from "../components/shared/Button";
import HeroIllustration from "../components/shared/HeroIllustration";
import Footer from "../components/shared/Footer";
import { motion, useReducedMotion } from "framer-motion";

export default function Landing() {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const heroVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* 1. Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Product Wordmark */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            <div className="flex items-center justify-center bg-[var(--color-primary)] text-white w-8 h-8 rounded-lg shadow-xs">
              <Activity size={18} strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">SAHAYA</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-teal-50 text-[var(--color-primary-dark)] border border-teal-200 rounded-md hidden sm:inline-block">
                Community Health Tele-Triage
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-[var(--color-primary-dark)] transition-colors">
              How It Works
            </a>
            <a href="#roles" className="hover:text-[var(--color-primary-dark)] transition-colors">
              Role Workspaces
            </a>
            <a href="#connected-care" className="hover:text-[var(--color-primary-dark)] transition-colors">
              Connected Care
            </a>
          </nav>

          {/* Desktop Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/patient/assessment')}
              className="text-xs font-semibold border-slate-200"
            >
              Start Triage
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/asha')}
              className="text-xs font-semibold gap-1.5"
            >
              <span>ASHA Desk</span>
              <ArrowRight size={14} />
            </Button>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-3 animate-fade-in text-sm font-medium">
            <div className="flex flex-col gap-2 pb-3 border-b border-slate-100">
              <a 
                href="#how-it-works" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-slate-700 hover:text-[var(--color-primary)]"
              >
                How It Works
              </a>
              <a 
                href="#roles" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-slate-700 hover:text-[var(--color-primary)]"
              >
                Role Workspaces
              </a>
              <a 
                href="#connected-care" 
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-slate-700 hover:text-[var(--color-primary)]"
              >
                Connected Care Direction
              </a>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setMobileMenuOpen(false); navigate('/patient'); }}
                className="text-xs"
              >
                Patient Portal
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => { setMobileMenuOpen(false); navigate('/asha'); }}
                className="text-xs"
              >
                ASHA Desk
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* 2. Main Hero Section */}
      <section className="relative overflow-hidden pt-10 sm:pt-14 pb-16 md:pb-20 border-b border-slate-200/80 bg-gradient-to-b from-white via-[#F8FAFC] to-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] items-center gap-10 lg:gap-12">
            
            <motion.div 
              variants={heroVariants}
              initial={prefersReducedMotion ? false : "initial"}
              animate="animate"
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col text-left"
            >
              
              {/* Product Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-200 rounded-full text-xs font-bold text-[var(--color-primary-dark)] self-start mb-5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse"></span>
                <span>Standardized Community Tele-Triage System</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] mb-4">
                Accessible Community Care, From Field Triage to Clinical Consultation
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mb-8 font-normal">
                SAHAYA connects rural patients, frontline ASHA workers, and Primary Health Centre physicians through validated symptom screening, baseline vitals tracking, and rapid care navigation.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/patient/assessment')}
                  className="font-bold text-sm sm:text-base px-6 h-12 shadow-sm gap-2"
                >
                  <span>Start Patient Triage</span>
                  <ArrowRight size={18} />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/asha')}
                  className="font-semibold text-sm sm:text-base px-6 h-12 border-slate-300 hover:border-slate-400 bg-white"
                >
                  ASHA Field Desk
                </Button>

                <button
                  onClick={() => navigate('/doctor')}
                  className="text-xs font-bold text-slate-600 hover:text-[var(--color-primary-dark)] px-3 py-2 cursor-pointer transition-colors"
                >
                  Doctor Workspace →
                </button>
              </div>

              {/* Feature Verification Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-200/90 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[var(--color-primary)] shrink-0" />
                  <span>Standardized triage logic</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[var(--color-primary)] shrink-0" />
                  <span>Doorstep ASHA screening</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[var(--color-primary)] shrink-0" />
                  <span>Direct PHC referral links</span>
                </div>
              </div>

            </motion.div>

            {/* Right Column: Original Connected-Care Hero Illustration */}
            <motion.div 
              variants={heroVariants}
              initial={prefersReducedMotion ? false : "initial"}
              animate="animate"
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="w-full flex items-center justify-center lg:justify-end"
            >
              <HeroIllustration className="w-full" />
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3. Role Selection Section */}
      <section id="roles" className="py-16 md:py-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-dark)] bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md">
              Targeted Workspaces
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3 mb-2">
              Select Your Role Workspace
            </h2>
            <p className="text-sm text-slate-600">
              Each portal is calibrated for the specific workflows of patients, frontline community workers, and medical officers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Patient Card */}
            <FloatingCard className="p-6 md:p-7 flex flex-col justify-between border-slate-200 hover:border-teal-300 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-[var(--color-primary-dark)] flex items-center justify-center mb-5 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                  <UserCircle size={28} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                  Community Member
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2">
                  Patient Portal
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Conduct direct symptom self-checks, review actionable care recommendations, review health reminders, and find nearby primary health centres.
                </p>
              </div>

              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/patient')}
                className="w-full justify-between text-xs font-bold border-slate-200 group-hover:border-[var(--color-primary)] group-hover:text-[var(--color-primary-dark)]"
              >
                <span>Enter Patient Portal</span>
                <ArrowRight size={15} />
              </Button>
            </FloatingCard>

            {/* ASHA Field Worker Card */}
            <FloatingCard className="p-6 md:p-7 flex flex-col justify-between border-slate-200 hover:border-amber-300 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-5 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <HeartPulse size={28} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                  Frontline Worker
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2">
                  ASHA Health Desk
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Perform assisted screenings in village households, collect vital telemetry, triage acute symptoms, and track village patient follow-ups.
                </p>
              </div>

              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/asha')}
                className="w-full justify-between text-xs font-bold border-slate-200 group-hover:border-amber-500 group-hover:text-amber-800"
              >
                <span>Enter ASHA Desk</span>
                <ArrowRight size={15} />
              </Button>
            </FloatingCard>

            {/* Doctor Card */}
            <FloatingCard className="p-6 md:p-7 flex flex-col justify-between border-slate-200 hover:border-indigo-300 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Stethoscope size={28} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                  Primary Care Physician
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2">
                  Doctor Workspace
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Review incoming community triage queues, evaluate algorithmic risk tiers, inspect vital histories, and conduct tele-consultations.
                </p>
              </div>

              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/doctor')}
                className="w-full justify-between text-xs font-bold border-slate-200 group-hover:border-indigo-500 group-hover:text-indigo-800"
              >
                <span>Enter Doctor Workspace</span>
                <ArrowRight size={15} />
              </Button>
            </FloatingCard>

          </div>

        </div>
      </section>

      {/* 4. How SAHAYA Works */}
      <section id="how-it-works" className="py-16 md:py-20 border-b border-slate-200 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-dark)] bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md">
              Clinical Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3 mb-2">
              How the Tele-Triage System Operates
            </h2>
            <p className="text-sm text-slate-600">
              A clear, verified sequence transforming subjective complaints into standardized clinical action.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs relative">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-[var(--color-primary-dark)] flex items-center justify-center font-bold text-sm mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Symptom & Vitals Capture
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Patients or field workers input reported symptoms (e.g. fever, chest pain, breathlessness) alongside duration, severity, and physiological vitals.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
                <FileText size={14} className="text-slate-400" />
                <span>Multi-symptom structured entry</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs relative">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-[var(--color-primary-dark)] flex items-center justify-center font-bold text-sm mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Standardized Clinical Triage
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The protocol evaluates inputs against standardized clinical indicators, stratifying urgency into Emergency (108), Visit PHC, Video Consult, or Home Self-Care.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
                <Clock size={14} className="text-slate-400" />
                <span>Immediate deterministic output</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs relative">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-[var(--color-primary-dark)] flex items-center justify-center font-bold text-sm mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Care Routing & Medical Review
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cases requiring attention appear in the doctor queue with actionable clinical summaries, while self-care cases receive home recovery guidelines.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
                <MapPin size={14} className="text-slate-400" />
                <span>PHC & CHC facility mapping</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. Connected Care & Telemetry Direction */}
      <section id="connected-care" className="py-16 md:py-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-teal-50/70 via-slate-50 to-white border border-teal-100 rounded-2xl p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
              
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-100/80 text-[var(--color-primary-dark)] text-xs font-bold uppercase tracking-wider mb-3">
                  <Radio size={13} className="text-[var(--color-primary)]" />
                  <span>Telemetry Ecosystem Roadmap</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                  Connected Care & Physiological Telemetry
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                  SAHAYA incorporates real-time vital readings into primary care triage. We distinguish between current prototype capabilities and production device integration:
                </p>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-2 font-bold text-slate-900 mb-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Field Demonstration Mode (Currently Active)</span>
                    </div>
                    <p className="text-slate-500 leading-normal">
                      The current web application supports synthetic telemetry polling and manual vitals override (Heart Rate, SpO₂, Temperature, Blood Pressure) for field screening validation.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-2 font-bold text-slate-900 mb-0.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      <span>Hardware BLE & Wearables Integration (In Development)</span>
                    </div>
                    <p className="text-slate-500 leading-normal">
                      Native Bluetooth pulse oximeter ingestion and ABDM electronic health record linkage are under active technical development. Consumer smartwatch integrations will follow standard health APIs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Telemetry Visual Box */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                  <span className="font-bold text-slate-900">Sample Stream Telemetry</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active Channel
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Pulse Rate</span>
                    <span className="text-lg font-bold text-slate-900">74 <span className="text-xs font-normal text-slate-400">bpm</span></span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">SpO₂</span>
                    <span className="text-lg font-bold text-slate-900">98 <span className="text-xs font-normal text-slate-400">%</span></span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Temp</span>
                    <span className="text-lg font-bold text-slate-900">98.6 <span className="text-xs font-normal text-slate-400">°F</span></span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Blood Pressure</span>
                    <span className="text-lg font-bold text-slate-900">120/80</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/asha/assessment')}
                  className="w-full text-xs font-semibold"
                >
                  Test Assisted Assessment With Vitals
                </Button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <Footer />

    </div>
  );
}
