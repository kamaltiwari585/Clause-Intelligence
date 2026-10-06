import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EmptyState from './components/EmptyState';
import ContractHeader from './components/ContractHeader';
import RiskSummary from './components/RiskSummary';
import KeyFindings from './components/KeyFindings';
import ClauseReview from './components/ClauseReview';
import NegotiationPriorities from './components/NegotiationPriorities';
import UploadModal from './components/UploadModal';
import { useAnalysis } from './hooks/useAnalysis';
import { createLogger } from './utils/logger';
import { NAV_ITEMS } from './config/constants';

const log = createLogger('App');

export default function App() {
  const [view, setView] = useState('dashboard');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const analysis = useAnalysis();
  const review = analysis.result;

  const navigate = (id) => { log.info('Navigate', { to: id }); setView(id); };
  const submit = async (file, role) => { if (await analysis.run(file, role)) { setSelectedId(null); setUploadOpen(false); } };
  const viewClause = (id) => {
    setSelectedId(id);
    document.getElementById('clause-review')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const viewLabel = NAV_ITEMS.find((n) => n.id === view)?.label;
  const meta = review?.meta;

  return (
    <div className="shell">
      <Sidebar active={view} onNavigate={navigate} />
      <div className="main">
        <Header onUpload={() => setUploadOpen(true)} />
        <main className="content">
          {view !== 'dashboard' ? <p className="empty">{viewLabel} is not built yet. It will be added in a later version.</p>
            : !review ? <EmptyState onUpload={() => setUploadOpen(true)} />
            : (
              <>
                {meta.engine !== 'ai' && (
                  <div className="notice">{meta.fallbackReason ?? 'AI analysis was unavailable'}, so built-in rule-based checks were used{meta.engine === 'hybrid' ? ` for ${meta.fallbackChunks} of ${meta.totalChunks} sections` : ''}. They are less detailed: retry later for the full AI review.</div>
                )}
                {review.warnings.length > 0 && <div className="notice">{review.warnings.length} AI finding(s) were removed because their quoted text could not be verified in the contract.</div>}
                <ContractHeader review={review} />
                <RiskSummary summary={review.summary} />
                <KeyFindings findings={review.findings} onView={viewClause} />
                <ClauseReview key={`${review.contract.name}-${review.contract.reviewedOn}`} review={review} selectedId={selectedId} onSelect={setSelectedId} />
                <NegotiationPriorities priorities={review.priorities} onView={viewClause} />
              </>
            )}
        </main>
      </div>
      {uploadOpen && <UploadModal status={analysis.status} error={analysis.error} onSubmit={submit} onClose={() => setUploadOpen(false)} />}
    </div>
  );
}
