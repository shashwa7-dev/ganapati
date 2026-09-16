import { ImageResponse } from "next/og";
import { ART_1, ART_2, ART_3 } from "./og-assets/art";

// The shared social preview: three drawings from the catalogue, taped up beside
// the title on clay paper.
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

// A drawing, framed and taped up like a page pinned to the wall.
function Card({ src, left, top, rotate, z }: { src: string; left: number; top: number; rotate: number; z: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        zIndex: z,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "12px",
        paddingBottom: "16px",
        background: "#fbf7ef",
        boxShadow: "0 14px 34px rgba(59,42,32,0.28)",
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-14px",
          width: "84px",
          height: "26px",
          background: "rgba(240,199,94,0.72)",
          transform: "rotate(-3deg)",
          display: "flex",
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} width={224} height={278} alt="" style={{ objectFit: "cover" }} />
    </div>
  );
}

export default function OpengraphImage() {
  const [art1, art2, art3] = [ART_1, ART_2, ART_3];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          backgroundColor: "#f4ead8",
          color: "#3b2a20",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "10px", backgroundColor: "#b8532f", display: "flex" }} />

        {/* left: the title */}
        <div
          style={{
            width: "486px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "72px 24px 72px 76px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MARK_URI} width={92} height={92} alt="" style={{ marginBottom: "18px" }} />
          <div style={{ fontSize: "92px", fontWeight: 700, letterSpacing: "-2px", lineHeight: 1, display: "flex" }}>
            Ganapati
          </div>
          <div style={{ fontSize: "34px", color: "#5b5249", marginTop: "18px", lineHeight: 1.15, display: "flex" }}>
            One hundred and eight forms of Ganesha
          </div>
          <div style={{ fontSize: "24px", color: "#8d857a", marginTop: "14px", display: "flex" }}>
            drawn one at a time, hung in a sketchbook
          </div>
          <div style={{ display: "flex", marginTop: "40px", fontSize: "24px" }}>
            <span style={{ color: "#b8532f", display: "flex" }}>Ganpati Bappa Morya</span>
            <span style={{ color: "#8d857a", display: "flex", marginLeft: "22px" }}>· shashwa7.in</span>
          </div>
        </div>

        {/* right: three drawings taped up */}
        <div style={{ flex: 1, position: "relative", display: "flex" }}>
          <Card src={art1} left={20} top={168} rotate={-7} z={1} />
          <Card src={art3} left={378} top={172} rotate={8} z={2} />
          <Card src={art2} left={196} top={128} rotate={1} z={3} />
        </div>
      </div>
    ),
    { ...size },
  );
}
