/**
 * Module-level state survives client-side navigation but resets on a full
 * document load (first visit or refresh), which is exactly when the intro plays.
 */
export const introState = { played: false };
