import { Fragment } from "react";

/** Renders **bold** and ==highlight== inside a copy string. Nothing else. */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|==[^=]+==)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4)
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("==") && part.endsWith("==") && part.length > 4)
          return (
            <span key={i} className="sk-hl">
              {part.slice(2, -2)}
            </span>
          );
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
