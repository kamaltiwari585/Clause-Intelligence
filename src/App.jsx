import { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import RecentReviews from './components/RecentReviews';
import KeyIssues from './components/KeyIssues';
import ClauseReviewPanel from './components/ClauseReviewPanel';
import UploadModal from './components/UploadModal';
import { contracts as sampleContracts, keyIssues, clauses as sampleClauses } from './data/sampleData';
import { useAnalysis } from './hooks/useAnalysis';
import { computeSummary } from './utils/metrics';
import { createLogger } from './utils/logger';
import { NAV_ITEMS } from './config/constants';

const log = createLogger('App');

export default function App() {
  const [view, setView] = useState('dashboard');
  const [uploadOpen, setUploadOpen] = useState(false);
  const analysis = useAnalysis();
  const live = analysis.result;

  const contracts = live ? [live.contract, ...sampleContracts] : sampleContracts;
  const clauses = live ? live.clauses : sampleClauses;
  const summary = useMemo(() => computeSummary(contracts, clauses), [contracts, clauses]);

  useEffect(() => { log.info('Data source', { live: Boolean(live), clauses: clauses.length }); }, [live, clauses.length]);

  const navigate = (id) => { log.info('Navigate', { to: id }); setView(id); };
  const submit = async (file, perspective) => { if (await analysis.run(file, perspective)) setUploadOpen(false); };
  const viewLabel = NAV_ITEMS.find((n) => n.id === view)?.label;

  return (
    <div className="shell">
      <Sidebar active={view} onNavigate={navigate} />
      <div className="main">
        <Header onUpload={() => setUploadOpen(true)} />
        <main className="content">
          {view === 'dashboard' ? (
            <>
              <div className="intro">
                <h2 className="intro__title">Contract Review Dashboard</h2>
                <p>Identify potentially unfavourable, one-sided and incomplete provisions across your contracts, with the reasoning and a suggested revision for each.</p>
              </div>
              {live ? (
                <div className="notice banner">
                  <span>Showing AI analysis of <strong>{live.contract.name}</strong> (reviewed for the {live.meta.perspective}, using {live.meta.provider}). Earlier rows are sample data.
                    {live.warnings.length > 0 && ` ${live.warnings.length} unverified finding(s) were removed.`}</span>
                  <button type="button" className="btn" onClick={analysis.reset}>Back to sample data</button>
                </div>
              ) : (
                <div className="notice">Showing sample data. Upload a contract to see a live analysis.</div>
              )}
              <SummaryCards summary={summary} />
              <div className="grid-2">
                <RecentReviews contracts={contracts} />
                <KeyIssues issues={keyIssues} />
              </div>
              <ClauseReviewPanel key={live?.contract.id ?? 'sample'} clauses={clauses} />
            </>
          ) : (
            <p className="empty">{viewLabel} is not built yet. It will be added in a later version.</p>
          )}
        </main>
      </div>
      {uploadOpen && <UploadModal status={analysis.status} error={analysis.error} onSubmit={submit} onClose={() => setUploadOpen(false)} />}
    </div>
  );
}
