import { memo } from "react";
import katex from "katex";

// Renders text with LaTeX math in \( … \), \[ … \] or $ … $ using KaTeX.
// Plain text (Bengali or English) is rendered as-is; malformed math falls back to text.
const MATH_RX = /(\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\]|\$[^$\n]+\$)/g;

function renderMath(src, display) {
  try {
    return katex.renderToString(src, { displayMode: display, throwOnError: false, strict: "ignore", output: "html" });
  } catch {
    return null;
  }
}

// Some imported questions store HTML entities ("&lt;=") as literal text. Decode the
// common ones for display only; the result is still rendered as plain text.
const ENTITIES = { "&lt;": "<", "&gt;": ">", "&amp;": "&", "&quot;": '"', "&#39;": "'", "&apos;": "'", "&nbsp;": " " };
const decodeEntities = (s) => s.replace(/&(lt|gt|amp|quot|apos|nbsp|#39);/g, (m) => ENTITIES[m] || m);

function MathText({ text, className = "" }) {
  if (text === null || text === undefined || text === "") return null;
  const str = decodeEntities(String(text));
  const parts = str.split(MATH_RX);
  return (
    <span className={`whitespace-pre-line leading-relaxed ${className}`}>
      {parts.map((part, i) => {
        if (!part) return null;
        let src = null;
        let display = false;
        if (part.startsWith("\\(") && part.endsWith("\\)")) src = part.slice(2, -2);
        else if (part.startsWith("\\[") && part.endsWith("\\]")) {
          src = part.slice(2, -2);
          display = true;
        } else if (part.length > 2 && part.startsWith("$") && part.endsWith("$")) src = part.slice(1, -1);
        if (src !== null) {
          const html = renderMath(src, display);
          if (html) return <span key={i} className="katex-inline" dangerouslySetInnerHTML={{ __html: html }} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export default memo(MathText);
