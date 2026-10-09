import { MARK, MARK_PATH, MARK_VIEWBOX } from "@/lib/mark";

export function Mark({ className = "", title }: { className?: string; title?: string }) {
  return (
    <svg viewBox={MARK_VIEWBOX} className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <path d={MARK_PATH} fillRule="evenodd" fill="currentColor" />
      <circle cx={MARK.core.x} cy={0} r={MARK.core.r} fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`}>
      <Mark className="wordmark__mark" />
      <span>
        DarkOS<span className="wordmark__ai"> AI</span>
      </span>
    </span>
  );
}

// Shown until the WebGL scene paints, and kept if WebGL is unavailable: the same
// split, drawn flat. Outline on the demo side, solid on the production side.
export function MarkPoster({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <div className="poster__layer poster__layer--prod">
        <svg viewBox={MARK_VIEWBOX}>
          <path d={MARK_PATH} fillRule="evenodd" fill="currentColor" />
          <circle cx={MARK.core.x} cy={0} r={MARK.core.r} fill="currentColor" />
        </svg>
      </div>
      <div className="poster__layer poster__layer--demo">
        <svg viewBox={MARK_VIEWBOX}>
          <path d={MARK_PATH} fillRule="evenodd" fill="none" stroke="currentColor" strokeWidth="0.018" />
          <circle cx={MARK.core.x} cy={0} r={MARK.core.r} fill="none" stroke="currentColor" strokeWidth="0.018" />
        </svg>
      </div>
    </div>
  );
}
