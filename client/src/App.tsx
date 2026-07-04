import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import Landing from "./pages/Landing";

// Patient
import PatientHome from "./pages/patient/PatientHome";
import PatientAssessment from "./pages/patient/PatientAssessment";
import PatientTriage from "./pages/patient/PatientTriage";
import PatientHistory from "./pages/patient/PatientHistory";
import PatientReminders from "./pages/patient/PatientReminders";
import PatientProfile from "./pages/patient/PatientProfile";

// ASHA
import AshaDashboard from "./pages/asha/AshaDashboard";
import AshaAssessment from "./pages/asha/AshaAssessment";
import AshaAssessments from "./pages/asha/AshaAssessments";
import AshaPatients from "./pages/asha/AshaPatients";

// Doctor
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorCaseReview from "./pages/doctor/DoctorCaseReview";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorConsultations from "./pages/doctor/DoctorConsultations";

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
    </BrowserRouter>
  );
}

export default App;
