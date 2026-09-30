'use client';

export function MeshBackdrop() {
  return (
    <>
      <div className="mesh-bg" aria-hidden>
        <div className="blob blob-amber" />
        <div className="blob blob-rose" />
      </div>
      <div className="grain" aria-hidden />
    </>
  );
}
