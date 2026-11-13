/** The Wall — shared types and limits (client + server). */

export const LIMITS = { message: 140, name: 32, minMessage: 2 } as const;

export type NoteStatus = "pending" | "approved" | "rejected";

/** A note as stored. Positions are normalised to the wall (0–1), so they work at any screen size. */
export type WallNote = {
  id: string;
  message: string;
  name: string;
  sticker: string;
  /** the handwriting picked for the note (lib/wall/fonts.ts) */
  font: string;
  x: number;
  y: number;
  rotation: number;
  createdAt: string;
  status: NoteStatus;
  reports?: number;
};

/** What the public wall receives: approved notes only, no moderation data. */
export type PublicNote = Pick<WallNote, "id" | "message" | "name" | "sticker" | "font" | "x" | "y" | "rotation" | "createdAt">;

export type Submission = {
  message: string;
  name: string;
  sticker: string;
  font?: string;
  x: number;
  y: number;
  rotation: number;
  /** spam traps: a hidden field that must stay empty, and when the composer opened */
  website?: string;
  startedAt?: number;
  /** Cloudflare Turnstile token, when Turnstile is configured */
  captcha?: string;
};
