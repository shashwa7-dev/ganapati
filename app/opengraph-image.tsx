import { ImageResponse } from "next/og";

// The shared social preview: the mark on clay paper with the title and chant.
export const alt =
  "Ganapati — one hundred and eight forms of Ganesha, drawn one at a time and hung in a sketchbook.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <g fill="none" stroke="#3b2a20" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 21 Q32 17 42 21"/>
    <path d="M22 21 L25 11 L29 17 L32 5 L35 17 L39 11 L42 21"/>
    <path d="M22 24 C 22 16, 42 16, 42 24 C 43 34, 39 40, 32 42 C 25 40, 21 34, 22 24 Z"/>
    <path d="M22 27 C 12 23, 8 33, 14 41 C 17 44, 21 42, 22 38"/>
    <path d="M42 27 C 52 23, 56 33, 50 41 C 47 44, 43 42, 42 38"/>
    <path d="M32 42 C 33 48, 31 55, 25 56 C 20 56, 19 50, 24 49"/>
  </g>
  <circle cx="32" cy="5" r="2.2" fill="#f0c75e" stroke="#3b2a20" stroke-width="1.4"/>
  <circle cx="28" cy="30" r="1.9" fill="#3b2a20"/>
  <circle cx="36" cy="30" r="1.9" fill="#3b2a20"/>
  <path d="M32 23 l 0 5" stroke="#c9453a" stroke-width="3.2" stroke-linecap="round"/>
</svg>`;
const MARK_URI = `data:image/svg+xml;utf8,${encodeURIComponent(MARK)}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f4ead8",
          color: "#3b2a20",
          padding: "72px",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "10px", backgroundColor: "#b8532f", display: "flex" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MARK_URI} width={168} height={168} alt="" style={{ marginBottom: "18px" }} />
        <div style={{ fontSize: "128px", fontWeight: 700, letterSpacing: "-2px", lineHeight: 1, display: "flex" }}>
          Ganapati
        </div>
        <div style={{ fontSize: "42px", color: "#5b5249", marginTop: "20px", display: "flex" }}>
          One hundred and eight forms of Ganesha
        </div>
        <div style={{ fontSize: "28px", color: "#8d857a", marginTop: "12px", display: "flex" }}>
          drawn one at a time, hung in a sketchbook
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "44px",
            left: "72px",
            right: "72px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "26px",
          }}
        >
          <div style={{ color: "#b8532f", display: "flex" }}>Ganpati Bappa Morya</div>
          <div style={{ color: "#8d857a", display: "flex" }}>shashwa7.in</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
