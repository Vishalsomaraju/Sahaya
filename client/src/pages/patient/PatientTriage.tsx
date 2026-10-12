import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import TriageResult from '../../components/shared/TriageResult';
import PatientSummaryReport from '../../components/shared/PatientSummaryReport';
import { mockFacilities, mockCurrentPatient } from '../../data/mockData';
import { ArrowLeft, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import Button from '../../components/shared/Button';
import { motion } from 'framer-motion';
import { fadeUp } from '../../lib/animations';
import { 
  getAssessmentById, 
  getTriageResultById, 
  getLastAssessmentId, 
  type AssessmentRecord, 
  type TriageResultData 
} from '../../lib/api';

export default function PatientTriage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const state = location.state as {
    assessmentId?: string;
    assessment?: AssessmentRecord;
    triage?: TriageResultData;
  } | null;

  const queryId = searchParams.get('id');
  const effectiveId = queryId || state?.assessmentId || getLastAssessmentId();

  const [assessment, setAssessment] = useState<AssessmentRecord | null>(state?.assessment || null);
  const [triage, setTriage] = useState<TriageResultData | null>(state?.triage || null);
  const [isLoading, setIsLoading] = useState<boolean>(!state?.assessment || !state?.triage);
  const [error, setError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Case 1: State already provided from a fresh assessment submission
    if (state?.assessment && state?.triage) {
      setAssessment(state.assessment);
      setTriage(state.triage);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Case 2: Direct URL access, refresh, or missing state -> fetch from backend API
    if (effectiveId) {
      setIsLoading(true);
      setError(null);

      Promise.all([
        getAssessmentById(effectiveId),
        getTriageResultById(effectiveId)
      ])
        .then(([fetchedAssessment, fetchedTriage]) => {
          if (!isMounted) return;
          setAssessment(fetchedAssessment);
          setTriage(fetchedTriage);
          setIsLoading(false);
        })
        .catch((err: any) => {
          if (!isMounted) return;
          console.error('[PatientTriage] Error fetching assessment from backend:', err);
          setError(err.message || 'Unable to retrieve persisted clinical triage evaluation.');
          setIsLoading(false);
        });
      return;
    }

    // Case 3: No assessment reference found anywhere
    setIsLoading(false);
    setError('No active assessment record was found. Please complete an assessment first.');
  }, [state, effectiveId]);

  const handleRetry = () => {
    if (!effectiveId) {
      navigate('/patient/assessment');
      return;
    }
    setIsLoading(true);
    setError(null);
    Promise.all([
      getAssessmentById(effectiveId),
      getTriageResultById(effectiveId)
    ])
      .then(([fetchedAssessment, fetchedTriage]) => {
        setAssessment(fetchedAssessment);
        setTriage(fetchedTriage);
        setIsLoading(false);
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to reload assessment.');
        setIsLoading(false);
      });
  };

  return (
    <div className="flex flex-col min-h-[75vh] max-w-4xl mx-auto px-4 sm:px-0 pb-12 pt-4">
      
      {/* 1. Loading State */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 size={36} className="animate-spin text-[var(--color-primary)]" />
          <p className="text-sm font-semibold text-slate-700">Loading clinical triage record...</p>
          <p className="text-xs text-slate-400">Retrieving persisted decision from clinical server</p>
        </div>
      ) : error ? (
        /* 2. Error / Missing State */
        <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-xl border border-red-200 shadow-clinical text-center animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Assessment Unavailable</h3>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            {error}
          </p>
          <div className="flex items-center justify-center gap-3">
            {effectiveId && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="text-xs gap-1.5"
              >
                <RefreshCw size={13} />
                <span>Retry</span>
              </Button>
            )}
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => navigate('/patient/assessment')}
              className="text-xs"
            >
              Start New Assessment
            </Button>
          </div>
        </div>
      ) : triage && assessment ? (
        /* 3. API-Driven Persisted Result */
        <motion.div 
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex-1 flex flex-col gap-6"
        >
          <TriageResult 
            level={triage.triageLevel}
            title={triage.recommendedAction}
            risk={
              triage.priority === 'CRITICAL' ? 'Critical' :
              triage.priority === 'HIGH' ? 'Moderate' :
              triage.priority === 'MEDIUM' ? 'Low-Moderate' : 'Low'
            }
            nextAction={triage.recommendedAction}
            explanation={triage.reasoning}
            nextSteps={triage.nextSteps}
            limitations={triage.limitations}
            escalationGuidance={triage.escalationGuidance}
            disclaimer={triage.disclaimer}
            facilities={mockFacilities}
            symptoms={assessment.symptoms}
            assessmentId={assessment.id}
            onDownloadSummary={() => setShowSummary(true)}
          />
          
          <div className="flex justify-center pt-2">
            <Button 
              variant="outline" 
              size="md"
              onClick={() => navigate('/patient')}
              className="gap-2 text-xs sm:text-sm"
            >
              <ArrowLeft size={16} />
              <span>Return to Health Dashboard</span>
            </Button>
          </div>
        </motion.div>
      ) : null}

      {/* 4. Corrected Patient Summary Modal */}
      {showSummary && assessment && triage && (
        <PatientSummaryReport 
          summary={{
            patientName: assessment.submittedBy?.name || mockCurrentPatient.name,
            age: mockCurrentPatient.age,
            symptoms: assessment.symptoms,
            severity: assessment.severity || undefined,
            duration: assessment.duration || undefined,
            triageLevel: triage.triageLevel,
            priority: triage.priority,
            vitals: assessment.vitals, // Real vitals without fake default fallback
            recommendation: triage.recommendedAction,
            assessmentId: assessment.id,
            generatedAt: new Date(assessment.createdAt).toLocaleString()
          }}
          onClose={() => setShowSummary(false)}
        />
      )}

    </div>
  );
}
