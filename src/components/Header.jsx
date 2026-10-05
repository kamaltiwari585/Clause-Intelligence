export default function Header({ onUpload }) {
  return (
    <header className="topbar">
      <h1 className="topbar__title">Contract Clause Intelligence</h1>
      <button type="button" className="btn btn--primary" onClick={onUpload}>+ Upload Contract</button>
    </header>
  );
}
