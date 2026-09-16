import { signoff } from "@/data/notes";

export function SignOff() {
  return (
    <footer className="sk-signoff sk-hand-note">
      <span>{signoff.left}</span>
      <span>{signoff.right}</span>
    </footer>
  );
}
