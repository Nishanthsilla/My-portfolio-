/**
 * The Wall's stickers: the emoji people use on their keyboards, drawn with the
 * visitor's own emoji font (Apple on iPhone/Mac, Google's Noto on Android,
 * Segoe on Windows) and given a white die-cut edge so they read as stickers.
 *
 * To extend the set, add an entry — an emoji, or an image file:
 *   { id: "rocket", label: "Rocket", group: "Fun", emoji: "🚀" }
 *   { id: "my-sticker", label: "My sticker", group: "Fun", src: "/images/wall/stickers/my-sticker.png" }
 * The toolbar, the wall, the composer and the server's allowed list all read from here.
 * (Only long-supported emoji are used, so every phone shows them.)
 */

export const ORANGE = "#FF4938";
const PAPER = ["#FFF6E8", "#FFE58A", "#FFD3DA", "#CFE3FF", "#D6F0C9", "#E3D9FF"];

export type Sticker = { id: string; label: string; group: "Faces" | "Hearts" | "Hands" | "Fun" | "GIFs"; emoji?: string; src?: string; animated?: boolean };

/**
 * Animated stickers ("GIFs"): Noto Animated Emoji by Google (CC BY 4.0),
 * resized and stored with the site (public/images/wall/gifs) — nothing is
 * fetched from a third party, and only these can be posted.
 */
const GIF = (id: string, label: string, file: string): Sticker => ({ id: `gif-${id}`, label, group: "GIFs", src: `/images/wall/gifs/${file}.webp`, animated: true });
export const GIFS: Sticker[] = [
  GIF("party", "Party popper (animated)", "1f389"),
  GIF("partying", "Partying face (animated)", "1f973"),
  GIF("heart-eyes", "Heart eyes (animated)", "1f60d"),
  GIF("hearts", "Smiling with hearts (animated)", "1f970"),
  GIF("rofl", "Rolling on the floor laughing (animated)", "1f923"),
  GIF("star-struck", "Star-struck (animated)", "1f929"),
  GIF("mind-blown", "Mind blown (animated)", "1f92f"),
  GIF("melting", "Melting face (animated)", "1fae0"),
  GIF("salute", "Salute (animated)", "1fae1"),
  GIF("cool", "Sunglasses (animated)", "1f60e"),
  GIF("eyes", "Eyes (animated)", "1f440"),
  GIF("wave", "Waving hand (animated)", "1f44b"),
  GIF("clap", "Clapping (animated)", "1f44f"),
  GIF("raised-hands", "Raised hands (animated)", "1f64c"),
  GIF("thumbs-up", "Thumbs up (animated)", "1f44d"),
  GIF("dancer", "Dancer (animated)", "1f483"),
  GIF("heart", "Beating heart (animated)", "2764_fe0f"),
  GIF("fire", "Fire (animated)", "1f525"),
  GIF("sparkles", "Sparkles (animated)", "2728"),
  GIF("hundred", "Hundred points (animated)", "1f4af"),
  GIF("rocket", "Rocket (animated)", "1f680"),
  GIF("rainbow", "Rainbow (animated)", "1f308"),
  GIF("bulb", "Light bulb (animated)", "1f4a1"),
  GIF("coffee", "Coffee (animated)", "2615"),
];

export const STICKERS: Sticker[] = [
  { id: "heart-eyes", label: "Heart eyes", group: "Faces", emoji: "😍" },
  { id: "smile", label: "Smiling face", group: "Faces", emoji: "😊" },
  { id: "grin", label: "Grinning face", group: "Faces", emoji: "😁" },
  { id: "star-struck", label: "Star-struck", group: "Faces", emoji: "🤩" },
  { id: "joy", label: "Tears of joy", group: "Faces", emoji: "😂" },
  { id: "cool", label: "Sunglasses", group: "Faces", emoji: "😎" },
  { id: "hearts-face", label: "Smiling with hearts", group: "Faces", emoji: "🥰" },
  { id: "hug", label: "Hug", group: "Faces", emoji: "🤗" },
  { id: "mind-blown", label: "Mind blown", group: "Faces", emoji: "🤯" },
  { id: "halo", label: "Halo", group: "Faces", emoji: "😇" },
  { id: "heart", label: "Red heart", group: "Hearts", emoji: "❤️" },
  { id: "orange-heart", label: "Orange heart", group: "Hearts", emoji: "🧡" },
  { id: "sparkling-heart", label: "Sparkling heart", group: "Hearts", emoji: "💖" },
  { id: "wave", label: "Waving hand", group: "Hands", emoji: "👋" },
  { id: "clap", label: "Clapping hands", group: "Hands", emoji: "👏" },
  { id: "raised-hands", label: "Raised hands", group: "Hands", emoji: "🙌" },
  { id: "thumbs-up", label: "Thumbs up", group: "Hands", emoji: "👍" },
  { id: "victory", label: "Victory hand", group: "Hands", emoji: "✌️" },
  { id: "star", label: "Star", group: "Fun", emoji: "⭐" },
  { id: "sparkles", label: "Sparkles", group: "Fun", emoji: "✨" },
  { id: "fire", label: "Fire", group: "Fun", emoji: "🔥" },
  { id: "party", label: "Party popper", group: "Fun", emoji: "🎉" },
  { id: "blossom", label: "Cherry blossom", group: "Fun", emoji: "🌸" },
  { id: "sunflower", label: "Sunflower", group: "Fun", emoji: "🌻" },
  { id: "rainbow", label: "Rainbow", group: "Fun", emoji: "🌈" },
  { id: "rocket", label: "Rocket", group: "Fun", emoji: "🚀" },
  { id: "bulb", label: "Light bulb", group: "Fun", emoji: "💡" },
  { id: "palette", label: "Artist palette", group: "Fun", emoji: "🎨" },
  { id: "camera", label: "Camera", group: "Fun", emoji: "📸" },
  { id: "coffee", label: "Coffee", group: "Fun", emoji: "☕" },
  { id: "pizza", label: "Pizza", group: "Fun", emoji: "🍕" },
  { id: "hundred", label: "Hundred points", group: "Fun", emoji: "💯" },
];

const ALL = [...STICKERS, ...GIFS];

/**
 * GIFs from GIPHY (searched through /api/wall/gifs when GIPHY_API_KEY is set).
 * Stored as "giphy:<id>"; drawn from GIPHY's own CDN as a small framed print.
 */
export const isGiphy = (id: string) => /^giphy:[A-Za-z0-9]{4,64}$/.test(id);
export const giphyUrl = (id: string) => `https://media.giphy.com/media/${id.slice(6)}/200w.webp`;
export const stickerById = (id: string) => ALL.find((s) => s.id === id);
export const STICKER_IDS = new Set(ALL.map((s) => s.id));

/** A paper colour for the note that goes with a sticker (stable per sticker). */
export function noteColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PAPER[h % PAPER.length];
}

const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Segoe UI Symbol", sans-serif';

/** Render a sticker at any size: the emoji with a white die-cut edge and a soft shadow. */
export function StickerArt({ id, size = 64, title }: { id: string; size?: number; title?: string }) {
  if (isGiphy(id))
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={giphyUrl(id)}
        alt={title ?? ""}
        width={size}
        height={size}
        draggable={false}
        loading="lazy"
        decoding="async"
        style={{ display: "block", width: size, height: size, objectFit: "cover", borderRadius: Math.max(6, size / 7), border: `${Math.max(2, size / 22)}px solid #fff`, boxShadow: "0 4px 12px rgba(34,34,34,.25)", background: "#eee" }}
      />
    );
  const st = stickerById(id);
  if (!st) return null;
  const edge = Math.max(1.5, size / 26);
  const cut = `drop-shadow(${edge}px 0 0 #fff) drop-shadow(-${edge}px 0 0 #fff) drop-shadow(0 ${edge}px 0 #fff) drop-shadow(0 -${edge}px 0 #fff) drop-shadow(0 ${(size / 22).toFixed(1)}px ${(size / 14).toFixed(1)}px rgba(34,34,34,.22))`;
  const box = { display: "grid", placeItems: "center", width: size, height: size, filter: cut } as const;
  if (st.src)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={st.src} alt={title ?? ""} width={size} height={size} draggable={false} loading="lazy" decoding="async" style={{ ...box, objectFit: "contain" }} />;
  return (
    <span role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} style={box}>
      <span style={{ fontFamily: EMOJI_FONT, fontSize: size * 0.8, lineHeight: 1, userSelect: "none" }}>{st.emoji}</span>
    </span>
  );
}
