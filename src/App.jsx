import { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import RecentReviews from './components/RecentReviews';
import KeyIssues from './components/KeyIssues';
import ClauseReviewPanel from './components/ClauseReviewPanel';
import { contracts, keyIssues, clauses } from './data/sampleData';
import { computeSummary } from './utils/metrics';
import { createLogger } from './utils/logger';
import { NAV_ITEMS } from './config/constants';

const log = createLogger('App');

export default function App() {
  const [view, setView] = useState('dashboard');
  const [notice, setNotice] = useState('');
  const summary = useMemo(() => computeSummary(contracts, clauses), []);

  useEffect(() => { log.info('App mounted', summary); }, [summary]);

  const navigate = (id) => { log.info('Navigate', { to: id }); setView(id); };
  const upload = () => {
    log.info('Upload clicked (not implemented in v0.1)');
    setNotice('Contract upload and AI analysis arrive in the next version. This screen shows sample data.');
  };

  const viewLabel = NAV_ITEMS.find((n) => n.id === view)?.label;

  return (
    <div className="shell">
      <Sidebar active={view} onNavigate={navigate} />
      <div className="main">
        <Header onUpload={upload} />
        <main className="content">
          {notice && <div className="notice" role="status">{notice}</div>}
          {view === 'dashboard' ? (
            <>
              <div className="intro">
                <h2 className="intro__title">Contract Review Dashboard</h2>
                <p>Identify potentially unfavourable, one-sided and incomplete provisions across your contracts, with the reasoning and a suggested revision for each.</p>
              </div>
              <SummaryCards summary={summary} />
              <div className="grid-2">
                <RecentReviews contracts={contracts} />
                <KeyIssues issues={keyIssues} />
              </div>
              <ClauseReviewPanel clauses={clauses} />
            </>
          ) : (
            <p className="empty">{viewLabel} is not built yet. It will be added in a later version.</p>
          )}
        </main>
      </div>
    </div>
  );
}
