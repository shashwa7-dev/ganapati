import Image from "next/image";
import Link from "next/link";
import { DoodleField } from "@/components/sketchbook/DoodleField";
import { door } from "@/data/notes";
import { photo } from "@/data/photographs";

/** The way out of the sketchbook and into the story. */
export function StoryDoor() {
  const raja = photo("lalbaugcha-raja");
  if (!raja) return null;

  return (
    <section className="sk-door sk-has-doodles" aria-label="The story">
      <DoodleField seed="door" count={3} />
      <div>
        <div className="sk-door-photo sk-frame">
          <span className="sk-tape" />
          <span className="sk-tape sk-tape--r" />
          <Image
            src={raja.src}
            alt={raja.alt}
            width={raja.width}
            height={raja.height}
            placeholder={raja.blurDataURL ? "blur" : "empty"}
            blurDataURL={raja.blurDataURL}
            sizes="(min-width: 768px) 380px, 92vw"
          />
        </div>
        <p className="sk-door-caption sk-hand-small">
          {door.photoCaption} · {raja.credit}
        </p>
      </div>
      <div>
        <h2 className="sk-door-heading sk-hand-heading">{door.heading}</h2>
        <p className="sk-door-body sk-serif-lead">{door.body}</p>
        <Link href="/ganesh-chaturthi" className="sk-door-link sk-hand-subhead">
          {door.storyLink}
        </Link>
      </div>
    </section>
  );
}
