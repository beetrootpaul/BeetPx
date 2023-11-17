import { beforeEach, describe, jest, test } from "@jest/globals";
import { BeetPx } from "../../BeetPx";
import { BpxImageUrl } from "../../assets/Assets";
import { BpxRgbColor } from "../../color/RgbColor";
import { BpxCharSprite, BpxFont, BpxFontId } from "../../font/Font";
import { BpxVector2d, v_, v_0_0_ } from "../../misc/Vector2d";
import { DrawingTestSetup, drawingTestSetup } from "../DrawingTestSetup";
import { BpxPattern } from "../Pattern";
import { spr_ } from "../Sprite";
import { TestImage } from "../TestImage";

describe("DrawText", () => {
  const c0 = BpxRgbColor.fromCssHex("#010203");
  const c1 = BpxRgbColor.fromCssHex("#111213");
  const c2 = BpxRgbColor.fromCssHex("#212223");
  const c3 = BpxRgbColor.fromCssHex("#313233");
  const cFontBg = BpxRgbColor.fromCssHex("#818283");
  const cFontFg = BpxRgbColor.fromCssHex("#919293");

  const fontImage = new TestImage({
    withMapping: { _: cFontBg, X: cFontFg },
    image: `
        X X _ _ _ _ _ _ _ _ X X X
        X _ X _ X X _ X _ X X X X
        X X X _ X _ X X _ X X X X
        X _ _ X X X _ _ X _ X X X
        X _ _ X X _ _ X _ X X X X
        X X X _ X _ _ X _ X _ _ _
      `,
  });
  const spriteB = spr_(fontImage.uniqueUrl)(0, 0, 4, 6);
  const spriteP = spr_(fontImage.uniqueUrl)(4, 0, 3, 6);
  const spriteX = spr_(fontImage.uniqueUrl)(7, 0, 3, 6);
  const spriteUnknown = spr_(fontImage.uniqueUrl)(10, 0, 3, 5);

  class TestFont implements BpxFont {
    readonly id: BpxFontId = "test-font";
    readonly imageUrl: BpxImageUrl = fontImage.uniqueUrl;

    gapBetweenChars: BpxVector2d = v_0_0_;

    spritesFor(text: string): BpxCharSprite[] {
      const charSprites: BpxCharSprite[] = [];
      let positionInText = v_0_0_;
      for (let i = 0; i < text.length; i += 1) {
        const char = text[i]!;
        const sprite =
          char === "B"
            ? spriteB
            : char === "P"
            ? spriteP
            : char === "X"
            ? spriteX
            : spriteUnknown;
        charSprites.push({ positionInText, sprite, char });
        positionInText = positionInText
          .add(sprite.size().x, 0)
          .add(this.gapBetweenChars);
      }
      return charSprites;
    }
  }

  const fontProps = {
    font: new TestFont(),
    imageBgColor: cFontBg,
    imageTextColor: cFontFg,
  };

  let dts: DrawingTestSetup;

  jest
    .spyOn(BeetPx, "getFont")
    .mockImplementation(() => dts.assets.getFontAsset(fontProps.font.id).font);

  beforeEach(() => {
    fontProps.font.gapBetweenChars = v_(1, 0);
  });

  test("simple printing", () => {
    dts = drawingTestSetup(14, 8, c0);
    dts.assets.addImageAsset(fontImage.uniqueUrl, fontImage.asset);
    dts.assets.addFontAsset(fontProps.font.id, fontProps);

    dts.drawApi.setFont("test-font");
    dts.drawApi.print("BPX", v_(1, 1), c1);

    dts.canvas.expectToEqual({
      withMapping: { "-": c0, "#": c1 },
      expectedImageAsAscii: `
        - - - - - - - - - - - - - -
        - # # - - - - - - - - - - -
        - # - # - - # # - - # - # -
        - # # # - - # - # - # - # -
        - # - - # - # # - - - # - -
        - # - - # - # - - - # - # -
        - # # # - - # - - - # - # -
        - - - - - - - - - - - - - -
      `,
    });
  });

  test("a gap between characters", () => {
    dts = drawingTestSetup(16, 8, c0);
    dts.assets.addImageAsset(fontImage.uniqueUrl, fontImage.asset);
    dts.assets.addFontAsset(fontProps.font.id, fontProps);

    dts.drawApi.setFont("test-font");
    fontProps.font.gapBetweenChars = v_(0, 0);
    dts.drawApi.print("BPX", v_(1, 1), c1);

    dts.canvas.expectToEqual({
      withMapping: { "-": c0, "#": c1 },
      expectedImageAsAscii: `
        - - - - - - - - - - - - - - - -
        - # # - - - - - - - - - - - - -
        - # - # - # # - # - # - - - - -
        - # # # - # - # # - # - - - - -
        - # - - # # # - - # - - - - - -
        - # - - # # - - # - # - - - - -
        - # # # - # - - # - # - - - - -
        - - - - - - - - - - - - - - - -
      `,
    });

    dts.drawApi.clearCanvas(c0);
    fontProps.font.gapBetweenChars = v_(2, -1);
    dts.drawApi.print("BPX", v_(1, 1), c1);

    dts.canvas.expectToEqual({
      withMapping: { "-": c0, "#": c1 },
      expectedImageAsAscii: `
        - - - - - - - - - - - - # - # -
        - # # - - - - # # - - - # - # -
        - # - # - - - # - # - - - # - -
        - # # # - - - # # - - - # - # -
        - # - - # - - # - - - - # - # -
        - # - - # - - # - - - - - - - -
        - # # # - - - - - - - - - - - -
        - - - - - - - - - - - - - - - -
      `,
    });
  });

  test("color as a function of a char", () => {
    dts = drawingTestSetup(14, 8, c0);
    dts.assets.addImageAsset(fontImage.uniqueUrl, fontImage.asset);
    dts.assets.addFontAsset(fontProps.font.id, fontProps);

    dts.drawApi.setFont("test-font");
    dts.drawApi.print("BPX", v_(1, 1), (charSprite) => {
      return charSprite.char === "B" ? c2 : charSprite.char === "X" ? c3 : c1;
    });

    dts.canvas.expectToEqual({
      withMapping: { "-": c0, "#": c1, "%": c2, "*": c3 },
      expectedImageAsAscii: `
        - - - - - - - - - - - - - -
        - % % - - - - - - - - - - -
        - % - % - - # # - - * - * -
        - % % % - - # - # - * - * -
        - % - - % - # # - - - * - -
        - % - - % - # - - - * - * -
        - % % % - - # - - - * - * -
        - - - - - - - - - - - - - -
      `,
    });
  });

  describe("centering", () => {
    test("no centering", () => {
      dts = drawingTestSetup(20, 11, c0);
      dts.assets.addImageAsset(fontImage.uniqueUrl, fontImage.asset);
      dts.assets.addFontAsset(fontProps.font.id, fontProps);

      dts.drawApi.setFont("test-font");
      dts.drawApi.print("BPX", v_(7, 4), c1, { centerXy: [false, false] });

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - - - - - - - - - - - - - - - -
          - - - - - - - - - - - - - - - - - - - -
          - - - - - - - - - - - - - - - - - - - -
          - - - - - - - - - - - - - - - - - - - -
          - - - - - - - # # - - - - - - - - - - -
          - - - - - - - # - # - - # # - - # - # -
          - - - - - - - # # # - - # - # - # - # -
          - - - - - - - # - - # - # # - - - # - -
          - - - - - - - # - - # - # - - - # - # -
          - - - - - - - # # # - - # - - - # - # -
          - - - - - - - - - - - - - - - - - - - -
        `,
      });
    });

    test("X centering", () => {
      dts = drawingTestSetup(20, 11, c0);
      dts.assets.addImageAsset(fontImage.uniqueUrl, fontImage.asset);
      dts.assets.addFontAsset(fontProps.font.id, fontProps);

      dts.drawApi.setFont("test-font");
      dts.drawApi.print("BPX", v_(7, 4), c1, { centerXy: [true, false] });

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - - - - - - - - - - - - - - - -
          - - - - - - - - - - - - - - - - - - - -
          - - - - - - - - - - - - - - - - - - - -
          - - - - - - - - - - - - - - - - - - - -
          - # # - - - - - - - - - - - - - - - - -
          - # - # - - # # - - # - # - - - - - - -
          - # # # - - # - # - # - # - - - - - - -
          - # - - # - # # - - - # - - - - - - - -
          - # - - # - # - - - # - # - - - - - - -
          - # # # - - # - - - # - # - - - - - - -
          - - - - - - - - - - - - - - - - - - - -
        `,
      });
    });

    test("Y centering", () => {
      dts = drawingTestSetup(20, 11, c0);
      dts.assets.addImageAsset(fontImage.uniqueUrl, fontImage.asset);
      dts.assets.addFontAsset(fontProps.font.id, fontProps);

      dts.drawApi.setFont("test-font");
      dts.drawApi.print("BPX", v_(7, 4), c1, { centerXy: [false, true] });

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - - - - - - - - - - - - - - - -
          - - - - - - - # # - - - - - - - - - - -
          - - - - - - - # - # - - # # - - # - # -
          - - - - - - - # # # - - # - # - # - # -
          - - - - - - - # - - # - # # - - - # - -
          - - - - - - - # - - # - # - - - # - # -
          - - - - - - - # # # - - # - - - # - # -
          - - - - - - - - - - - - - - - - - - - -
          - - - - - - - - - - - - - - - - - - - -
          - - - - - - - - - - - - - - - - - - - -
          - - - - - - - - - - - - - - - - - - - -
        `,
      });
    });

    test("XY centering", () => {
      dts = drawingTestSetup(20, 11, c0);
      dts.assets.addImageAsset(fontImage.uniqueUrl, fontImage.asset);
      dts.assets.addFontAsset(fontProps.font.id, fontProps);

      dts.drawApi.setFont("test-font");
      dts.drawApi.print("BPX", v_(7, 4), c1, { centerXy: [true, true] });

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - - - - - - - - - - - - - - - -
          - # # - - - - - - - - - - - - - - - - -
          - # - # - - # # - - # - # - - - - - - -
          - # # # - - # - # - # - # - - - - - - -
          - # - - # - # # - - - # - - - - - - - -
          - # - - # - # - - - # - # - - - - - - -
          - # # # - - # - - - # - # - - - - - - -
          - - - - - - - - - - - - - - - - - - - -
          - - - - - - - - - - - - - - - - - - - -
          - - - - - - - - - - - - - - - - - - - -
          - - - - - - - - - - - - - - - - - - - -
        `,
      });
    });
  });

  test("rounding", () => {
    dts = drawingTestSetup(16, 10, c0);
    dts.assets.addImageAsset(fontImage.uniqueUrl, fontImage.asset);
    dts.assets.addFontAsset(fontProps.font.id, fontProps);

    dts.drawApi.setFont("test-font");
    dts.drawApi.print("BPX", v_(2.49, 1.51), c1);

    dts.canvas.expectToEqual({
      withMapping: { "-": c0, "#": c1 },
      expectedImageAsAscii: `
        - - - - - - - - - - - - - - - -
        - - - - - - - - - - - - - - - -
        - - # # - - - - - - - - - - - -
        - - # - # - - # # - - # - # - -
        - - # # # - - # - # - # - # - -
        - - # - - # - # # - - - # - - -
        - - # - - # - # - - - # - # - -
        - - # # # - - # - - - # - # - -
        - - - - - - - - - - - - - - - -
        - - - - - - - - - - - - - - - -
      `,
    });
  });

  describe("scale", () => {
    test("an integer positive scale", () => {
      dts = drawingTestSetup(26, 14, c0);
      dts.assets.addImageAsset(fontImage.uniqueUrl, fontImage.asset);
      dts.assets.addFontAsset(fontProps.font.id, fontProps);

      dts.drawApi.setFont("test-font");
      dts.drawApi.print("BPX", v_(1, 1), c1, { scaleXy: v_(2, 2) });

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - - - - - - - - - - - - - - - - - - - - - -
          - # # # # - - - - - - - - - - - - - - - - - - - - -
          - # # # # - - - - - - - - - - - - - - - - - - - - -
          - # # - - # # - - - - # # # # - - - - # # - - # # -
          - # # - - # # - - - - # # # # - - - - # # - - # # -
          - # # # # # # - - - - # # - - # # - - # # - - # # -
          - # # # # # # - - - - # # - - # # - - # # - - # # -
          - # # - - - - # # - - # # # # - - - - - - # # - - -
          - # # - - - - # # - - # # # # - - - - - - # # - - -
          - # # - - - - # # - - # # - - - - - - # # - - # # -
          - # # - - - - # # - - # # - - - - - - # # - - # # -
          - # # # # # # - - - - # # - - - - - - # # - - # # -
          - # # # # # # - - - - # # - - - - - - # # - - # # -
          - - - - - - - - - - - - - - - - - - - - - - - - - -
        `,
      });
    });

    test("a negative scale: fallback to a scale of (0,0)", () => {
      dts = drawingTestSetup(14, 8, c0);
      dts.assets.addImageAsset(fontImage.uniqueUrl, fontImage.asset);
      dts.assets.addFontAsset(fontProps.font.id, fontProps);

      dts.drawApi.setFont("test-font");
      dts.drawApi.print("BPX", v_(1, 1), c1, { scaleXy: v_(-3, -2) });

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - - - - - - - - - -
          - - - - - - - - - - - - - -
          - - - - - - - - - - - - - -
          - - - - - - - - - - - - - -
          - - - - - - - - - - - - - -
          - - - - - - - - - - - - - -
          - - - - - - - - - - - - - -
          - - - - - - - - - - - - - -
        `,
      });
    });

    test("a non-integer scale: floor", () => {
      dts = drawingTestSetup(14, 8, c0);
      dts.assets.addImageAsset(fontImage.uniqueUrl, fontImage.asset);
      dts.assets.addFontAsset(fontProps.font.id, fontProps);

      dts.drawApi.setFont("test-font");
      dts.drawApi.print("BPX", v_(1, 1), c1, { scaleXy: v_(0.9, 0.9) });

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - - - - - - - - - -
          - - - - - - - - - - - - - -
          - - - - - - - - - - - - - -
          - - - - - - - - - - - - - -
          - - - - - - - - - - - - - -
          - - - - - - - - - - - - - -
          - - - - - - - - - - - - - -
          - - - - - - - - - - - - - -
        `,
      });

      dts.drawApi.clearCanvas(c0);
      dts.drawApi.print("BPX", v_(1, 1), c1, { scaleXy: v_(1.9, 1.9) });

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - - - - - - - - - -
          - # # - - - - - - - - - - -
          - # - # - - # # - - # - # -
          - # # # - - # - # - # - # -
          - # - - # - # # - - - # - -
          - # - - # - # - - - # - # -
          - # # # - - # - - - # - # -
          - - - - - - - - - - - - - -
        `,
      });
    });
  });

  test("clipping", () => {
    dts = drawingTestSetup(7, 3, c0);
    dts.assets.addImageAsset(fontImage.uniqueUrl, fontImage.asset);
    dts.assets.addFontAsset(fontProps.font.id, fontProps);

    dts.drawApi.setFont("test-font");
    dts.drawApi.print("BPX", v_(-3, -2), c1);

    dts.canvas.expectToEqual({
      withMapping: { "-": c0, "#": c1 },
      expectedImageAsAscii: `
          - - # - # - #
          # - # # - - -
          # - # - - - #
        `,
    });
  });

  test("camera offset", () => {
    dts = drawingTestSetup(14, 8, c0);
    dts.assets.addImageAsset(fontImage.uniqueUrl, fontImage.asset);
    dts.assets.addFontAsset(fontProps.font.id, fontProps);

    dts.drawApi.setFont("test-font");
    dts.drawApi.setCameraOffset(v_(2, -3));
    dts.drawApi.print("BPX", v_(1, 1), c1);

    dts.canvas.expectToEqual({
      withMapping: { "-": c0, "#": c1 },
      expectedImageAsAscii: `
        - - - - - - - - - - - - - -
        - - - - - - - - - - - - - -
        - - - - - - - - - - - - - -
        - - - - - - - - - - - - - -
        # - - - - - - - - - - - - -
        - # - - # # - - # - # - - -
        # # - - # - # - # - # - - -
        - - # - # # - - - # - - - -
      `,
    });
  });

  test("pattern", () => {
    dts = drawingTestSetup(14, 8, c0);
    dts.assets.addImageAsset(fontImage.uniqueUrl, fontImage.asset);
    dts.assets.addFontAsset(fontProps.font.id, fontProps);

    dts.drawApi.setFont("test-font");
    dts.drawApi.setPattern(BpxPattern.of(0b0011_0011_1100_1100));
    dts.drawApi.print("BPX", v_(1, 1), c1);

    dts.canvas.expectToEqual({
      withMapping: { "-": c0, "#": c1 },
      expectedImageAsAscii: `
        - - - - - - - - - - - - - -
        - # - - - - - - - - - - - -
        - - - # - - # # - - # - - -
        - - # # - - # - - - # - - -
        - # - - # - - - - - - - - -
        - # - - # - - - - - - - # -
        - - # # - - # - - - # - - -
        - - - - - - - - - - - - - -
      `,
    });
  });

  test("camera offset + pattern", () => {
    dts = drawingTestSetup(14, 8, c0);
    dts.assets.addImageAsset(fontImage.uniqueUrl, fontImage.asset);
    dts.assets.addFontAsset(fontProps.font.id, fontProps);

    dts.drawApi.setFont("test-font");
    dts.drawApi.setCameraOffset(v_(2, -3));
    dts.drawApi.setPattern(BpxPattern.of(0b0011_0011_1100_1100));
    dts.drawApi.print("BPX", v_(1, 1), c1);

    dts.canvas.expectToEqual({
      withMapping: { "-": c0, "#": c1 },
      expectedImageAsAscii: `
        - - - - - - - - - - - - - -
        - - - - - - - - - - - - - -
        - - - - - - - - - - - - - -
        - - - - - - - - - - - - - -
        # - - - - - - - - - - - - -
        - # - - # # - - # - - - - -
        - - - - - - # - - - # - - -
        - - # - - - - - - - - - - -
      `,
    });
  });

  // TODO: pixels? default initial font?
});
