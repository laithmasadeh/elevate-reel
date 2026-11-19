import { loadFont } from "@remotion/google-fonts/NotoSansArabic";

// Noto Sans Arabic covers the Arabic subset for captions/headlines and the
// Latin subset for the @handle on the end card, so the whole reel stays on
// one typeface. Weight 900 is used for headlines/figures, 700 for captions.
export const { fontFamily: arabicFontFamily } = loadFont("normal", {
  weights: ["700", "900"],
  subsets: ["arabic", "latin"],
});
