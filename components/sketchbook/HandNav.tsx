import Link from "next/link";
import { FluteToggle } from "@/components/sketchbook/FluteToggle";
import { Logo } from "@/components/sketchbook/Logo";

const LINKS = {
  home: { href: "/ganesh-chaturthi", label: "the story" },
  story: { href: "/", label: "← back to the drawings" },
} as const;

/** The nav, written by hand at the top of the page. Not sticky. */
export function HandNav({ current = "home" }: { current?: keyof typeof LINKS }) {
  const link = LINKS[current];
  return (
    <nav className="sk-nav" aria-label="Site">
      <Link href="/" className="sk-nav-brand">
        <Logo />
        <span>Ganapati</span>
      </Link>
      <FluteToggle />
      <div className="sk-nav-links">
        <Link href={link.href}>{link.label}</Link>
      </div>
    </nav>
  );
}
