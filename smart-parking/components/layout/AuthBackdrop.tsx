'use client';

export function AuthBackdrop() {
  return (
    <>
      <div className="mesh-bg" aria-hidden>
        <div className="blob blob-amber" />
      </div>
      <div className="grain" aria-hidden />
    </>
  );
}
