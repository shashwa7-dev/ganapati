import { DoodleField } from "@/components/sketchbook/DoodleField";
import { HandNav } from "@/components/sketchbook/HandNav";
import { Toran } from "@/components/sketchbook/Toran";
import { Chant } from "@/components/sketchbook/story/Chant";
import { FactsList } from "@/components/sketchbook/story/FactsList";
import { StoryChapter } from "@/components/sketchbook/story/StoryChapter";
import { StoryClosing } from "@/components/sketchbook/story/StoryClosing";
import { StoryArt } from "@/components/sketchbook/story/StoryArt";
import { StoryPhoto } from "@/components/sketchbook/story/StoryPhoto";
import { TimelineThread } from "@/components/sketchbook/story/TimelineThread";
import { NamesLedger } from "@/components/sketchbook/story/NamesLedger";
import { names } from "@/data/names";
import { artworkById } from "@/lib/collection";
import { story } from "@/data/story";

/** The story, as five short pages of the sketchbook. */
export function StoryPage() {
  const [one, two, three, four, five] = story.chapters;

  return (
    <div className="room-sketch">
      <Toran />
      <div className="sk-wall sk-wall--story">
        <HandNav current="story" />

        <header className="sk-story-title sk-has-doodles">
          <DoodleField seed="story-title" count={2} edges />
          <div className="sk-story-title-text">
          <p className="sk-story-kicker sk-hand-note">{story.kicker}</p>
          <h1 className="sk-hand-display">
            {story.title[0]}
            <br />
            {story.title[1].split(" ").slice(0, -1).join(" ")}{" "}
            <span className="who">{story.title[1].split(" ").slice(-1)}</span>
          </h1>
          <p className="sk-story-standfirst sk-serif-lead">{story.standfirst}</p>
          </div>
          <StoryArt artwork={artworkById(19)} />
        </header>

        <StoryChapter {...one} aside={<FactsList facts={story.facts} />} />

        <StoryChapter {...two}>
          <TimelineThread moments={story.moments} />
        </StoryChapter>

        <StoryChapter {...three} aside={<StoryPhoto slot="lalbaugcha-raja" note={story.photoNote} />} />

        <StoryChapter {...four} wide={<NamesLedger names={names} />} />

        <StoryChapter {...five}>
          <Chant lines={story.chant.lines} gloss={story.chant.gloss} />
        </StoryChapter>

        <StoryClosing lines={story.closing.lines} back={story.closing.back} />
      </div>
    </div>
  );
}
