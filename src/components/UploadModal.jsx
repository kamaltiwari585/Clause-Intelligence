import { useState } from 'react';

const ACCEPT = '.pdf,.docx,.txt';

export default function UploadModal({ status, error, onSubmit, onClose }) {
  const [file, setFile] = useState(null);
  const [perspective, setPerspective] = useState('Customer');
  const loading = status === 'loading';

  return (
    <div className="modal-backdrop" onClick={loading ? undefined : onClose}>
      <div className="modal card" role="dialog" aria-modal="true" aria-labelledby="upload-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="upload-title" className="section-title">Upload contract</h2>

        <label className="field">
          <span>Contract file (PDF, DOCX or TXT, up to 10 MB)</span>
          <input type="file" accept={ACCEPT} disabled={loading} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>

        <label className="field">
          <span>Review on behalf of</span>
          <select value={perspective} disabled={loading} onChange={(e) => setPerspective(e.target.value)}>
            <option value="Customer">Customer (buyer / client)</option>
            <option value="Provider">Provider (supplier / vendor)</option>
          </select>
        </label>

        {loading && <p className="notice" role="status">Analysing contract. Long documents can take a minute.</p>}
        {error && <p className="alert" role="alert">{error}</p>}

        <div className="modal__actions">
          <button type="button" className="btn" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="button" className="btn btn--primary" disabled={!file || loading} onClick={() => onSubmit(file, perspective)}>
            {loading ? 'Analysing…' : 'Analyse contract'}
          </button>
        </div>
        <p className="fineprint">AI-assisted analysis supports, but does not replace, review by a qualified lawyer.</p>
      </div>
    </div>
  );
}
