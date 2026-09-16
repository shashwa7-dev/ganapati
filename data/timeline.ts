export type Moment = {
  when: string;
  title: string;
  body: string;
  href?: string;
  /** A photograph slot, shown small beside the entry. */
  portrait?: string;
};

/**
 * The historical spine of the story page.
 *
 * Sourced from the documented history of the festival. Anything that belongs
 * to devotional tradition rather than to the record is introduced as such in
 * the copy itself, so the two are never confused.
 *
 * The story page's six short moments live in `data/story.ts`; this file is
 * the fuller reference.
 */
export const timeline: Moment[] = [
  {
    when: "Long before",
    title: "An old and deep devotion",
    body: "Ganesha has been loved and worshipped across India for many centuries, in temple sculpture, in scripture, and in the simple daily habit of speaking his name first. Ganesh Chaturthi as a religious observance is ancient, kept faithfully in homes and temples long before anyone raised a pandal on a street.",
  },
  {
    when: "1630 to 1680",
    title: "Celebrated in public in Shivaji's Pune",
    body: "The festival was already being celebrated publicly in Pune during the era of Chhatrapati Shivaji Maharaj, the founder of the Maratha empire. The idea of Ganeshotsav as something a whole city shares is far older than we often assume.",
  },
  {
    when: "18th century",
    title: "The Peshwas make it a celebration of the city",
    body: "The Peshwas were devotees of Ganesha, and in their capital at Pune they held the festival as a grand public celebration with the support of the state. For generations it was woven into the life of the city itself.",
  },
  {
    when: "Under British rule",
    title: "Bappa returns to the family home",
    body: "When that state patronage came to an end, the public celebration quietly folded back into private life. For many years Ganesh Chaturthi in Maharashtra was mainly a family occasion, kept lovingly at home, waiting for its moment to return to the street.",
  },
  {
    when: "1892",
    title: "The first sarvajanik Ganeshotsav, in Pune",
    body: "Krishnajipant Khasgiwale came back from Gwalior having seen the festival celebrated in public there, and he told his friends what he had seen. Bhausaheb Laxman Javale, known to everyone as Bhau Rangari, installed the first sarvajanik, or public, Ganesha idol at his wada in the Shalukar Bol area of Pune.",
  },
  {
    when: "1893",
    portrait: "tilak",
    title: "Lokmanya Tilak takes up the idea",
    body: "Bal Gangadhar Tilak praised the public celebration in his newspaper Kesari and devoted himself to growing it into a large, well organised public event. Under colonial rule, gatherings of more than twenty people for social or political purposes were restricted, while religious gatherings were left alone. In Ganesha, Tilak saw a god who belonged to everybody, one who could bring Brahmins and non Brahmins to stand together in the same courtyard. The pandals filled with music, theatre, poetry and conversation, and a festival became a place where people could gather and recognise one another.",
  },
  {
    when: "Early 1900s",
    title: "The festival arrives in Bombay's mill neighbourhoods",
    body: "Girangaon, the village of mills, spread across Lalbaug, Parel, Worli and Byculla. It was filled with people who had come from somewhere else: mill workers, dockhands, Koli fishermen, hawkers and small traders, living close together in chawls. The neighbourhood Ganpati gave them a place to gather, and a way to belong to a new city.",
  },
  {
    when: "1932",
    title: "The market at Peru Chawl closes",
    body: "The fishermen and vendors who had sold their goods in the open there were left without a place to trade, and without the ground their families depended on.",
  },
  {
    when: "12 September 1934",
    title: "Lalbaugcha Raja is installed",
    body: "After a vow made to Lord Ganesha, and a plot of land dedicated for a new market, the community installed an idol in gratitude and founded the mandal that has cared for him ever since.",
    href: "#lalbaugcha-raja",
  },
  {
    when: "1935 onward",
    title: "The Kambli family begins sculpting",
    body: "Ratnakar Kambli took up the making of the idol, and the Kambli family has shaped Lalbaugcha Raja ever since, for more than eight decades, passing the work down from father to son. The face that Mumbai waits all year to see comes from the same family's hands.",
  },
  {
    when: "Today",
    title: "Carried forward with care",
    body: "Ganeshotsav is celebrated across India and wherever Indian families have made a home, and it is being carried forward thoughtfully, with natural clay, gentler colours, and a growing tenderness towards the water he returns to.",
    href: "#today",
  },
];
