export default function Logo({ compact = false }) {
  return (
    <div className="brand">
      <span className="brand-mark" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4L12 20L20 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 4L12 13L16 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
        </svg>
      </span>
      <span>
        <strong>Vermex AI</strong>
        {compact ? null : <small>vermex.ai</small>}
      </span>
    </div>
  );
}
