import { signoff } from "@/data/notes";

export function SignOff() {
  return (
    <footer className="sk-signoff sk-hand-note">
      <span>{signoff.left}</span>
      <span>{signoff.right}</span>
      <span className="sk-signoff-credit">
        {signoff.credit.text}{" "}
        <a href={signoff.credit.href} target="_blank" rel="noopener noreferrer">
          {signoff.credit.name}
        </a>
      </span>
    </footer>
  );
}
