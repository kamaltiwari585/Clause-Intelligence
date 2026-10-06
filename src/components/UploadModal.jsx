import { useState } from 'react';
import { ROLE_OPTIONS } from '../config/constants';

export default function UploadModal({ status, error, onSubmit, onClose }) {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState(null);
  const loading = status === 'loading';

  return (
    <div className="modal-backdrop" onClick={loading ? undefined : onClose}>
      <div className="modal card" role="dialog" aria-modal="true" aria-labelledby="upload-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="upload-title" className="section-title">Review a contract</h2>

        <fieldset className="step" disabled={loading}>
          <legend><span className="step__n">1</span> Upload contract <small>(PDF or DOCX, up to 10 MB)</small></legend>
          <input type="file" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </fieldset>

        <fieldset className="step" disabled={loading}>
          <legend><span className="step__n">2</span> Which side are you on?</legend>
          <div className="roles">
            {ROLE_OPTIONS.map((r) => (
              <label key={r.id} className={`role ${role === r.id ? 'is-active' : ''}`}>
                <input type="radio" name="role" value={r.id} checked={role === r.id} onChange={() => setRole(r.id)} />
                <span className="role__title">{r.title}</span>
                <span className="role__blurb">{r.blurb}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {loading && <p className="notice" role="status">Reviewing contract from the {role === 'buyer' ? 'Buyer' : 'Service Provider'} position. Long documents can take a minute.</p>}
        {error && <p className="alert" role="alert">{error}</p>}

        <div className="modal__actions">
          <button type="button" className="btn" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="button" className="btn btn--primary" disabled={!file || !role || loading} onClick={() => onSubmit(file, role)}>
            {loading ? 'Reviewing…' : 'Review Contract'}
          </button>
        </div>
        <p className="fineprint">AI-assisted analysis supports, but does not replace, review by a qualified lawyer.</p>
      </div>
    </div>
  );
}
