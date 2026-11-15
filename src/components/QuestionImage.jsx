import { useEffect, useState } from "react";
import { imageUrl } from "../teacher/api";

// Question figure: keeps aspect ratio, lazy-loads, opens a zoom view on click,
// and shows an honest placeholder when the file cannot be loaded.
export function questionImages(q) {
  const list = [];
  if (q?.image) list.push(q.image);
  if (q?.imageUrl) list.push(q.imageUrl);
  if (Array.isArray(q?.images)) list.push(...q.images);
  return [...new Set(list.filter((x) => typeof x === "string" && x.trim()))];
}

function One({ src, alt }) {
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(false);
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e) => e.key === "Escape" && setZoom(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

  if (failed) {
    return (
      <div className="flex h-28 w-full max-w-sm items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 text-center text-xs text-examino-muted">
        Figure could not be loaded (ছবি লোড হয়নি)
      </div>
    );
  }
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setZoom(true);
        }}
        className="group relative block max-w-full rounded-lg border border-examino-border bg-white p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-examino-blue"
        aria-label="Enlarge figure"
      >
        <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className="max-h-64 w-auto max-w-full rounded object-contain" />
        <span className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">Zoom</span>
      </button>
      {zoom ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Figure preview"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
          onClick={(e) => {
            e.stopPropagation();
            setZoom(false);
          }}
        >
          <img src={src} alt={alt} className="max-h-[90vh] max-w-[95vw] rounded-lg bg-white object-contain p-2" />
          <button type="button" className="absolute right-4 top-4 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-semibold text-examino-text" onClick={() => setZoom(false)}>
            Close
          </button>
        </div>
      ) : null}
    </>
  );
}

export default function QuestionImage({ q, className = "" }) {
  const imgs = questionImages(q);
  if (!imgs.length) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {imgs.map((src, i) => (
        <One key={src} src={imageUrl(src)} alt={`Question figure ${i + 1}`} />
      ))}
    </div>
  );
}
