/** Copy shown during registration to keep users motivated and reassured. */

export type MotivationIconKey =
  | "sparkles"
  | "bell"
  | "shield"
  | "calendar"
  | "clipboard"
  | "graduation"
  | "wallet"
  | "badge-check";

export type MotivationBlock = {
  headline: string;
  body: string;
  icon: MotivationIconKey;
};

/** Shown on every step — rotates with step index. */
export const STEP_MOTIVATION: MotivationBlock[] = [
  {
    icon: "sparkles",
    headline: "Great start — you've got this",
    body: "Take your time. A complete profile helps us match you to jobs that fit your life.",
  },
  {
    icon: "bell",
    headline: "We'll keep you in the loop",
    body: "Your email and phone are only used for shifts, rosters, and job alerts — nothing spammy.",
  },
  {
    icon: "shield",
    headline: "Your info stays safe with us",
    body: "Don't worry about the paperwork. We use these details only to confirm you're ready to work legally.",
  },
  {
    icon: "calendar",
    headline: "You fill it — we fill the jobs",
    body: "Tell us when you're free; our team matches you to cleaning and gardening sites across Sydney.",
  },
  {
    icon: "clipboard",
    headline: "No stress if something's missing",
    body: "Add what you have today. You can update licences and checks later from your profile.",
  },
  {
    icon: "graduation",
    headline: "Your skills matter",
    body: "Training and experience help us place you on the right sites — not just any shift.",
  },
  {
    icon: "wallet",
    headline: "Almost there — stay patient",
    body: "Bank details are encrypted and used only for payroll. One more section after this.",
  },
  {
    icon: "badge-check",
    headline: "One more step to go!",
    body: "Review everything, hit submit, and relax — we'll review your profile and start matching jobs for you.",
  },
];

export function getProgressNudge(stepIndex: number, totalSteps: number): string | null {
  const remaining = totalSteps - stepIndex - 1;
  if (remaining === 0) return "Final step — you're nearly on the team.";
  if (remaining === 1) return "One more step after this — keep going!";
  if (stepIndex >= Math.floor(totalSteps / 2)) return "You're past halfway — well done.";
  if (stepIndex === 0) return "About 10 minutes total — grab a tea if you like.";
  return null;
}

export const REGISTER_TAGLINE =
  "You fill the form — we fill your calendar with the right jobs.";
