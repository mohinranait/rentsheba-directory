const GUEST_ADJECTIVES = [
  "Swift",
  "Brave",
  "Clever",
  "Sunny",
  "Happy",
  "Bright",
  "Calm",
  "Gentle",
  "Kind",
  "Lucky",
];

const GUEST_NOUNS = [
  "Panda",
  "Fox",
  "Tiger",
  "Eagle",
  "Lotus",
  "Mango",
  "Sparrow",
  "Dolphin",
  "Maple",
  "Comet",
];

// Client-side twin of src/utils/listing-review.ts#randomGuestName so the
// "Random" name button can generate the same friendly style without pulling
// the Prisma client into the browser bundle.
export function randomGuestName(): string {
  const adjective =
    GUEST_ADJECTIVES[Math.floor(Math.random() * GUEST_ADJECTIVES.length)];
  const noun = GUEST_NOUNS[Math.floor(Math.random() * GUEST_NOUNS.length)];
  const number = Math.floor(10 + Math.random() * 90);
  return `${adjective}${noun}${number}`;
}
