import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig } from "framer-motion";
import AppShell from "./components/layout/AppShell";
import Landing from "./pages/Landing";

// Lazy-loaded Patient Routes
const PatientHome = lazy(() => import("./pages/patient/PatientHome"));
const PatientAssessment = lazy(() => import("./pages/patient/PatientAssessment"));
const PatientTriage = lazy(() => import("./pages/patient/PatientTriage"));
const PatientHistory = lazy(() => import("./pages/patient/PatientHistory"));
const PatientReminders = lazy(() => import("./pages/patient/PatientReminders"));
const PatientProfile = lazy(() => import("./pages/patient/PatientProfile"));

// Lazy-loaded ASHA Routes
const AshaDashboard = lazy(() => import("./pages/asha/AshaDashboard"));
const AshaAssessment = lazy(() => import("./pages/asha/AshaAssessment"));
const AshaAssessments = lazy(() => import("./pages/asha/AshaAssessments"));
const AshaPatients = lazy(() => import("./pages/asha/AshaPatients"));

// Lazy-loaded Doctor Routes
const DoctorDashboard = lazy(() => import("./pages/doctor/DoctorDashboard"));
const DoctorCaseReview = lazy(() => import("./pages/doctor/DoctorCaseReview"));
const DoctorPatients = lazy(() => import("./pages/doctor/DoctorPatients"));
const DoctorConsultations = lazy(() => import("./pages/doctor/DoctorConsultations"));

function RouteLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-slate-500 animate-pulse">
      <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
      <span className="text-xs font-semibold tracking-wide text-slate-600">Loading Clinical View...</span>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />

          <Route element={<AppShell />}>
            {/* Patient Routes */}
            <Route path="/patient" element={<PatientHome />} />
            <Route path="/patient/assessment" element={<PatientAssessment />} />
            <Route path="/patient/triage" element={<PatientTriage />} />
            <Route path="/patient/history" element={<PatientHistory />} />
            <Route path="/patient/reminders" element={<PatientReminders />} />
            <Route path="/patient/profile" element={<PatientProfile />} />

            {/* ASHA Routes */}
            <Route path="/asha" element={<AshaDashboard />} />
            <Route path="/asha/assessment" element={<AshaAssessment />} />
            <Route path="/asha/assessments" element={<AshaAssessments />} />
            <Route path="/asha/patients" element={<AshaPatients />} />

            {/* Doctor Routes */}
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/case/:id" element={<DoctorCaseReview />} />
            <Route path="/doctor/patients" element={<DoctorPatients />} />
            <Route path="/doctor/consultations" element={<DoctorConsultations />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </MotionConfig>
  );
}

export default App;
