/**
 * Everything written on the story page, in one place. Handwritten lines are
 * lower-case; prose is plain and factual. Inline markup: **bold** and
 * ==highlighted== (rendered by components/sketchbook/story/inline.tsx).
 */

export type Fact = [key: string, value: string];
export type Moment = { when: string; title: string; line: string };
export type StoryChapterCopy = {
  numeral: string;
  title: string;
  tagline: string;
  paragraphs: string[];
};

export const story = {
  kicker: "the story, in five short pages",
  title: ["Why we bring", "him home"] as [string, string],
  standfirst:
    "Once a year, for a few days, the god who removes obstacles comes to stay. This is why, and how it came to be that way.",

  chapters: [
    {
      numeral: "I",
      title: "A guest in the house",
      tagline: "once a year, for a day and a half, or five, or ten",
      paragraphs: [
        "Every year, in the month of Bhadrapada, Lord Ganesha comes home. Ganesh Chaturthi celebrates his birth. It falls on the fourth day of the waxing moon, somewhere between late August and the middle of September.",
        "For the days that follow he is not a distant figure in a temple. He is a ==guest in the house==. Families bring a murti home and give him the best place in it. Some keep him for a day and a half, some for five days, some for the full ten. The length is rarely chosen. It is simply what your family has always done.",
        "He is **Vighnaharta**, the remover of obstacles, and his is the first name spoken at every beginning. He is easy to love: fond of sweets, fond of his small companion the mouse, fond of the people who come to him.",
      ],
    },
    {
      numeral: "II",
      title: "How it travelled",
      tagline: "from home and temple, to the street, to a whole city",
      paragraphs: [
        "Nobody invented Ganesh Chaturthi. The worship is ancient, and even the public celebration is older than the familiar story suggests. What changed, across these years, is how many people it gathered and how far it reached.",
      ],
    },
    {
      numeral: "III",
      title: "Lalbaugcha Raja",
      tagline: "navsacha ganpati, the ganpati of the vow",
      paragraphs: [
        "In the early 1930s, Lalbaug was a working neighbourhood in the truest sense: mill hands, Koli fishermen, hawkers and small traders. In **1932** the market at Peru Chawl was closed, and the people who sold there lost the one thing their living depended on, which was simply a place to stand.",
        "As the community tells it, they turned to Ganesha and made a **navas**, a solemn vow: a permanent place for their market, and an idol in return. The market was built. On **12 September 1934**, in gratitude, they installed him. From **1935** the Kambli family took up the making of the idol, and has shaped him ever since.",
        "Two lines form for his darshan. The **Navsachi** line, for those who come to make a vow or to complete one. And the **Mukh Darshan** line, for those who come simply to see his face. Many wait through the night. They do not call it waiting.",
      ],
    },
    {
      numeral: "IV",
      title: "The hundred and eight names",
      tagline: "why that number, and what we call him",
      paragraphs: [
        "A japa mala has 108 beads, so a prayer said once on each bead is said 108 times. Tradition counts 108 Upanishads, 27 nakshatras with four padas each, and twelve rashis crossed by nine grahas: every road to the number ends at the same place. It is the count of completeness, the number you reach when you have gone all the way round.",
        "So when his names are gathered into a hymn, an **ashtottara shatanamavali**, there are 108 of them, and there are 108 drawings in this book. These are the names, in the order they are usually recited, each with what it means.",
      ],
    },
    {
      numeral: "V",
      title: "We bring him home, and we let him go",
      tagline: "clay becomes form, form becomes presence, then returns to the water",
      paragraphs: [
        "The murti is carried home through the traffic, held steady on somebody's lap. Then comes **pranapratishtha**, the invocation: from that moment he is not an image in the room, he is a guest in the house. He is bathed, dressed and garlanded, and offered modak, durva grass and red hibiscus. There is arti in the morning and arti again in the evening. Children tell him things they have not told anyone else.",
        "On the final day there is **uttarpuja**, a last worship. Then the same hands that carried him in carry him out again, to the water. The clay softens and dissolves and becomes the river once more. Nothing is truly lost.",
      ],
    },
  ] as [StoryChapterCopy, StoryChapterCopy, StoryChapterCopy, StoryChapterCopy, StoryChapterCopy],

  facts: [
    ["also called", "Vinayaka Chaturthi"],
    ["falls on", "Shukla Chaturthi in Bhadrapada, late August to mid September"],
    ["kept for", "a day and a half, or five, seven or ten days"],
    ["ends with", "visarjan; Anant Chaturdashi for the full ten"],
    ["he brings", "buddhi, siddhi, riddhi"],
  ] as Fact[],

  moments: [
    { when: "long before", title: "An old and deep devotion", line: "Loved and worshipped across India for centuries, in temples and in the daily habit of speaking his name first; celebrated in public in Shivaji's Pune and under the Peshwas long before the modern festival." },
    { when: "1892", title: "The first sarvajanik Ganeshotsav, in Pune", line: "Bhau Rangari installs the first public Ganesha idol, at his wada in Shalukar Bol." },
    { when: "1893", title: "Lokmanya Tilak takes up the idea", line: "And gives it a purpose: a gathering the whole city could share." },
    { when: "early 1900s", title: "The festival arrives in Bombay's mill neighbourhoods", line: "Girangaon, the village of mills: Lalbaug, Parel, Worli and Byculla. The neighbourhood Ganpati gave newcomers a way to belong." },
    { when: "12 september 1934", title: "Lalbaugcha Raja is installed", line: "The story on the next page." },
    { when: "today", title: "Carried forward with care", line: "Shadu clay returning in place of plaster, gentler colours, and a growing tenderness towards the water he returns to." },
  ] as Moment[],

  photoNote: "the prayer that began it was for a place to work",

  chant: {
    lines: ["Ganpati Bappa Morya,", "pudhchya varshi lavkar ya"] as [string, string],
    gloss: "o beloved Bappa, come again soon, next year. sung out loud by thousands, feet already in the water.",
  },

  closing: {
    lines: ["Every year, we bring him home.", "Every year, we learn to let him go."] as [string, string],
    back: "← back to the drawings",
  },
};
