import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AnalysisProgress from '../../components/shared/AnalysisProgress';
import TriageResult from '../../components/shared/TriageResult';
import PatientSummaryReport from '../../components/shared/PatientSummaryReport';
import { mockTriage, generatePatientSummary, mockCurrentPatient } from '../../data/mockData';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/shared/Button';
import { motion } from 'framer-motion';

export default function PatientTriage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { symptoms: string[], severity: string, duration: string } | null;
  
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [triageResult, setTriageResult] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);

  useEffect(() => {
    if (!state) {
      navigate('/patient/assessment', { replace: true });
      return;
    }
    
    // Compute triage result
    const result = mockTriage(state.symptoms, state.severity, state.duration);
    setTriageResult(result);
    
    // Pre-generate summary data
    const summary = generatePatientSummary(mockCurrentPatient, state.symptoms, null, result);
    setSummaryData(summary);
  }, [state, navigate]);

  if (!state) return null;

  return (
    <div className="flex flex-col min-h-[80vh] max-w-4xl mx-auto px-4 md:px-0 pb-16 pt-6">
      
      {isAnalyzing ? (
        <div className="flex-1 flex items-center justify-center">
          <AnalysisProgress onComplete={() => setIsAnalyzing(false)} />
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col gap-10"
        >
          <TriageResult 
            level={triageResult.level}
            title={triageResult.title}
            risk={triageResult.risk}
            nextAction={triageResult.nextAction}
            explanation={triageResult.explanation}
            facilities={triageResult.facilities}
            onDownloadSummary={() => setShowSummary(true)}
          />
          
          <Button 
            variant="ghost"
            onClick={() => navigate('/patient')}
            className="self-center mt-4 h-14 px-8 text-lg font-bold"
          >
            <ArrowLeft size={24} className="mr-3" />
            Back to Home
          </Button>
        </motion.div>
      )}

      {showSummary && summaryData && (
        <PatientSummaryReport 
          summary={summaryData}
          onClose={() => setShowSummary(false)}
        />
      )}

    </div>
  );
}
