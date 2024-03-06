// `@notExported` is added to members here just to include this global in docs
//   generated by `typedoc` with help of `@zamiell/typedoc-plugin-not-exported`.

declare global {
  /**
   * Note: the generated documentation marks this variable as "Not Exported".
   *   This is *not* true.
   *
   * @notExported
   */
  const BEETPX__IS_PROD: boolean;

  /**
   * Note: the generated documentation marks this variable as "Not Exported".
   *   This is *not* true.
   *
   * @notExported
   */
  const BEETPX__VERSION: string;
}

// @ts-ignore
window.BEETPX__IS_PROD = __BEETPX__IS_PROD__;
// @ts-ignore
window.BEETPX__VERSION = __BEETPX__VERSION__;

export { BpxUtils } from "./Utils";
export {
  type BpxImageAsset,
  type BpxImageUrl,
  type BpxJsonAsset,
  type BpxJsonUrl,
  type BpxSoundAsset,
  type BpxSoundUrl,
} from "./assets/Assets";
export { type BpxAudioPlaybackId } from "./audio/AudioPlayback";
export {
  type BpxSoundSequence,
  type BpxSoundSequenceEntry,
} from "./audio/SoundSequence";
export { type BpxBrowserType } from "./browser/BrowserTypeDetector";
export { BpxCanvasSnapshotColorMapping } from "./color/CanvasSnapshotColorMapping";
export { type BpxColorMapper } from "./color/ColorMapper";
export { BpxPatternColors } from "./color/PatternColors";
export { BpxRgbColor, type BpxRgbCssHex } from "./color/RgbColor";
export { BpxSpriteColorMapping } from "./color/SpriteColorMapping";
export { BpxDrawingPattern } from "./draw_api/DrawingPattern";
export { BpxPixels } from "./draw_api/Pixels";
export { BpxFont, type BpxArrangedGlyph, type BpxGlyph } from "./font/Font";
export { BpxFontPico8 } from "./font/FontPico8";
export { BpxFontSaint11Minimal4 } from "./font/FontSaint11Minimal4";
export { BpxFontSaint11Minimal5 } from "./font/FontSaint11Minimal5";
export { type BpxGameInputEvent } from "./game_input/GameInput";
export { type BpxGamepadType } from "./game_input/GameInputGamepad";
export { BpxGamepadTypeDetector } from "./game_input/GamepadTypeDetector";
export { type BpxGameButtonName } from "./game_input/buttons/GameButtons";
export { BpxEasing, type BpxEasingFn } from "./misc/Easing";
export { BpxVector2d } from "./misc/Vector2d";
export { BpxAnimatedSprite } from "./sprite/AnimatedSprite";
export { BpxSprite } from "./sprite/Sprite";
export { BpxTimer } from "./timer/Timer";

export { BeetPx } from "./BeetPx";

// TODO: move to shorthands.ts
export { b_ } from "./BeetPx";
export { u_ } from "./Utils";
export { rgb_p8_ } from "./color/PalettePico8";
export {
  rgb_,
  rgb_black_,
  rgb_blue_,
  rgb_cyan_,
  rgb_green_,
  rgb_magenta_,
  rgb_red_,
  rgb_white_,
  rgb_yellow_,
} from "./color/RgbColor";
export { font_saint11Minimal4_ } from "./font/FontSaint11Minimal4";
export { font_saint11Minimal5_ } from "./font/FontSaint11Minimal5";
export { aspr_ } from "./sprite/AnimatedSprite";
export { spr_ } from "./sprite/Sprite";

export * from "./shorthands";
