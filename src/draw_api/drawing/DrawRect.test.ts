import { describe, test } from "@jest/globals";
import { BpxCanvasSnapshotColorMapping } from "../../color/CanvasSnapshotColorMapping";
import { BpxPatternColors } from "../../color/PatternColors";
import { BpxRgbColor } from "../../color/RgbColor";
import { v_ } from "../../misc/Vector2d";
import { drawingTestSetup } from "../DrawingTestSetup";
import { BpxPattern } from "../Pattern";

describe("DrawRect", () => {
  const ct = null;
  const c0 = BpxRgbColor.fromCssHex("#010203");
  const c1 = BpxRgbColor.fromCssHex("#111213");
  const c2 = BpxRgbColor.fromCssHex("#212223");
  const c3 = BpxRgbColor.fromCssHex("#313233");
  const c4 = BpxRgbColor.fromCssHex("#414243");
  const c5 = BpxRgbColor.fromCssHex("#515253");

  describe("regular", () => {
    test("simple 1x1", () => {
      const dts = drawingTestSetup(3, 3, c0);

      dts.drawApi.rect(v_(1, 1), v_(1, 1), c1);

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - -
          - # -
          - - -
        `,
      });
    });

    test("simple 4x3", () => {
      const dts = drawingTestSetup(6, 5, c0);

      dts.drawApi.rect(v_(1, 1), v_(4, 3), c1);

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - -
          - # # # # -
          - # - - # -
          - # # # # -
          - - - - - -
        `,
      });
    });

    test("drawing on very edges of a canvas", () => {
      const dts = drawingTestSetup(4, 3, c0);

      dts.drawApi.rect(v_(0, 0), v_(4, 3), c1);

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          # # # #
          # - - #
          # # # #
        `,
      });
    });

    test("0-size", () => {
      const dts = drawingTestSetup(3, 3, c0);

      dts.drawApi.rect(v_(1, 1), v_(0, 0), c1);

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - -
          - - -
          - - -
        `,
      });
    });

    test("negative left-top corner", () => {
      const dts = drawingTestSetup(3, 3, c0);

      dts.drawApi.rect(v_(-1, -1), v_(3, 3), c1);

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - # -
          # # -
          - - -
        `,
      });
    });

    test("negative size", () => {
      const dts = drawingTestSetup(6, 5, c0);

      dts.drawApi.rect(v_(5, 4), v_(-4, -3), c1);

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - -
          - # # # # -
          - # - - # -
          - # # # # -
          - - - - - -
        `,
      });
    });

    test("rounding", () => {
      const dts = drawingTestSetup(16, 9, c0);

      // These numbers are chosen in away which should test whether rounding
      //   is performed before on initial values of xy and wh (which is *not*
      //   what we want here) or rather on calculated xy1 and x2.
      dts.drawApi.rect(v_(1.6, 2.4), v_(12.6, 4.4), c1);

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - - - - - - - - - - - -
          - - - - - - - - - - - - - - - -
          - - # # # # # # # # # # # # - -
          - - # - - - - - - - - - - # - -
          - - # - - - - - - - - - - # - -
          - - # - - - - - - - - - - # - -
          - - # # # # # # # # # # # # - -
          - - - - - - - - - - - - - - - -
          - - - - - - - - - - - - - - - -
        `,
      });
    });

    test("clipping: over the left edge", () => {
      const dts = drawingTestSetup(6, 6, c0);

      dts.drawApi.rect(v_(-2, 1), v_(4, 4), c1);

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - -
          # # - - - -
          - # - - - -
          - # - - - -
          # # - - - -
          - - - - - -
        `,
      });
    });

    test("clipping: over the right edge", () => {
      const dts = drawingTestSetup(6, 6, c0);

      dts.drawApi.rect(v_(4, 1), v_(4, 4), c1);

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - -
          - - - - # #
          - - - - # -
          - - - - # -
          - - - - # #
          - - - - - -
        `,
      });
    });

    test("clipping: over the top edge", () => {
      const dts = drawingTestSetup(6, 6, c0);

      dts.drawApi.rect(v_(1, -2), v_(4, 4), c1);

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - # - - # -
          - # # # # -
          - - - - - -
          - - - - - -
          - - - - - -
          - - - - - -
        `,
      });
    });

    test("clipping: over the bottom edge", () => {
      const dts = drawingTestSetup(6, 6, c0);

      dts.drawApi.rect(v_(1, 4), v_(4, 4), c1);

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - -
          - - - - - -
          - - - - - -
          - - - - - -
          - # # # # -
          - # - - # -
        `,
      });
    });

    test("pattern: simple one, with a single color", () => {
      const dts = drawingTestSetup(4, 4, c0);

      dts.drawApi.setPattern(BpxPattern.of(0b0000_0001_0011_0111));
      dts.drawApi.rect(v_(0, 0), v_(4, 4), c1);

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          # # # #
          # - - -
          # - - -
          # - - -
        `,
      });
    });

    test("pattern: simple one, with two colors", () => {
      const dts = drawingTestSetup(4, 4, c0);

      dts.drawApi.setPattern(BpxPattern.of(0b0000_0001_0011_0111));
      dts.drawApi.rect(v_(0, 0), v_(4, 4), BpxPatternColors.of(c1, c2));

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1, ":": c2 },
        expectedImageAsAscii: `
          # # # #
          # - - :
          # - - :
          # : : :
        `,
      });
    });

    test("pattern: various 4x4 patterns", () => {
      const dts = drawingTestSetup(10, 10, c0);

      dts.drawApi.setPattern(BpxPattern.primaryOnly);
      dts.drawApi.rect(v_(0, 0), v_(10, 10), BpxPatternColors.of(c4, c1));

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1, ":": c2, "%": c3, "=": c4, "^": c5 },
        expectedImageAsAscii: `
          = = = = = = = = = =
          = - - - - - - - - =
          = - - - - - - - - =
          = - - - - - - - - =
          = - - - - - - - - =
          = - - - - - - - - =
          = - - - - - - - - =
          = - - - - - - - - =
          = - - - - - - - - =
          = = = = = = = = = =
        `,
      });

      dts.drawApi.setPattern(BpxPattern.secondaryOnly);
      dts.drawApi.rect(v_(2, 2), v_(6, 6), BpxPatternColors.of(c4, c2));

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1, ":": c2, "%": c3, "=": c4, "^": c5 },
        expectedImageAsAscii: `
          = = = = = = = = = =
          = - - - - - - - - =
          = - : : : : : : - =
          = - : - - - - : - =
          = - : - - - - : - =
          = - : - - - - : - =
          = - : - - - - : - =
          = - : : : : : : - =
          = - - - - - - - - =
          = = = = = = = = = =
        `,
      });

      dts.drawApi.setPattern(BpxPattern.of(0b0000_0001_0011_0111));
      dts.drawApi.rect(v_(0, 0), v_(10, 10), BpxPatternColors.of(c3, ct));

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1, ":": c2, "%": c3, "=": c4, "^": c5 },
        expectedImageAsAscii: `
          % % % % % % % % % %
          % - - - - - - - - %
          % - : : : : : : - %
          % - : - - - - : - =
          % - : - - - - : - %
          % - : - - - - : - %
          % - : - - - - : - %
          % - : : : : : : - =
          % - - - - - - - - %
          % % % = % % % = % %
        `,
      });

      dts.drawApi.setPattern(BpxPattern.of(0b0011_0011_0011_0011));
      dts.drawApi.rect(v_(0, 0), v_(10, 5), BpxPatternColors.of(c5, ct));
      dts.drawApi.setPattern(BpxPattern.of(0b1100_1100_1100_1100));
      dts.drawApi.rect(v_(0, 5), v_(10, 5), BpxPatternColors.of(c5, c1));

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1, ":": c2, "%": c3, "=": c4, "^": c5 },
        expectedImageAsAscii: `
          ^ ^ % % ^ ^ % % ^ ^
          ^ - - - - - - - - ^
          ^ - : : : : : : - ^
          ^ - : - - - - : - ^
          ^ ^ : - ^ ^ - : ^ ^
          # # ^ ^ # # ^ ^ # #
          # - : - - - - : - #
          # - : : : : : : - #
          # - - - - - - - - #
          # # ^ ^ # # ^ ^ # #
        `,
      });
    });

    test("pattern: 4x4 pattern is aligned with canvas' top-left corner", () => {
      const dts = drawingTestSetup(11, 11, c0);

      dts.drawApi.setPattern(BpxPattern.of(0b0000_0001_0011_0111));
      dts.drawApi.rect(v_(1, 1), v_(9, 9), BpxPatternColors.of(c1, ct));

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - - - - - - -
          - # # - # # # - # # -
          - # - - - - - - - # -
          - - - - - - - - - - -
          - # - - - - - - - # -
          - # - - - - - - - # -
          - # - - - - - - - # -
          - - - - - - - - - - -
          - # - - - - - - - # -
          - # # - # # # - # # -
          - - - - - - - - - - -
        `,
      });
    });

    test("camera XY", () => {
      const dts = drawingTestSetup(14, 7, c0);

      dts.drawApi.setCameraXy(v_(3, -2));
      dts.drawApi.rect(v_(1, 1), v_(12, 5), BpxPatternColors.of(c1, c2));

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1, "@": c2 },
        expectedImageAsAscii: `
          - - - - - - - - - - - - - - 
          - - - - - - - - - - - - - - 
          - - - - - - - - - - - - - - 
          # # # # # # # # # # - - - - 
          - - - - - - - - - # - - - - 
          - - - - - - - - - # - - - - 
          - - - - - - - - - # - - - - 
        `,
      });
    });

    test("camera XY + pattern", () => {
      const dts = drawingTestSetup(14, 7, c0);

      dts.drawApi.setCameraXy(v_(3, -2));
      dts.drawApi.setPattern(BpxPattern.of(0b0011_0011_1100_1100));
      dts.drawApi.rect(v_(1, 1), v_(12, 5), BpxPatternColors.of(c1, c2));

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1, "@": c2 },
        expectedImageAsAscii: `
          - - - - - - - - - - - - - - 
          - - - - - - - - - - - - - - 
          - - - - - - - - - - - - - - 
          @ @ # # @ @ # # @ @ - - - - 
          - - - - - - - - - # - - - - 
          - - - - - - - - - # - - - - 
          - - - - - - - - - @ - - - - 
        `,
      });
    });

    test("canvas snapshot color mapping", () => {
      const dts = drawingTestSetup(14, 7, c0);

      dts.drawApi.rectFilled(v_(0, 2), v_(14, 3), c1);
      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - - - - - - - - - -
          - - - - - - - - - - - - - -
          # # # # # # # # # # # # # #
          # # # # # # # # # # # # # #
          # # # # # # # # # # # # # #
          - - - - - - - - - - - - - -
          - - - - - - - - - - - - - -
        `,
      });

      dts.drawApi.takeCanvasSnapshot();

      dts.drawApi.rectFilled(v_(5, 0), v_(4, 7), c1);
      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - # # # # - - - - -
          - - - - - # # # # - - - - -
          # # # # # # # # # # # # # #
          # # # # # # # # # # # # # #
          # # # # # # # # # # # # # #
          - - - - - # # # # - - - - -
          - - - - - # # # # - - - - -
        `,
      });

      dts.drawApi.rect(
        v_(1, 1),
        v_(12, 5),
        BpxCanvasSnapshotColorMapping.of((snapshotColor) =>
          snapshotColor?.cssHex === c1.cssHex ? c2 : c3,
        ),
      );

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1, "/": c2, "%": c3 },
        expectedImageAsAscii: `
          - - - - - # # # # - - - - -
          - % % % % % % % % % % % % -
          # / # # # # # # # # # # / #
          # / # # # # # # # # # # / #
          # / # # # # # # # # # # / #
          - % % % % % % % % % % % % -
          - - - - - # # # # - - - - -
        `,
      });
    });
  });

  describe("filled", () => {
    test("simple 1x1", () => {
      const dts = drawingTestSetup(3, 3, c0);

      dts.drawApi.rectFilled(v_(1, 1), v_(1, 1), c1);

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - -
          - # -
          - - -
        `,
      });
    });

    test("simple 4x3", () => {
      const dts = drawingTestSetup(6, 5, c0);

      dts.drawApi.rectFilled(v_(1, 1), v_(4, 3), c1);

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - -
          - # # # # -
          - # # # # -
          - # # # # -
          - - - - - -
        `,
      });
    });

    test("drawing on very edges of a canvas", () => {
      const dts = drawingTestSetup(4, 3, c0);

      dts.drawApi.rectFilled(v_(0, 0), v_(4, 3), c1);

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          # # # #
          # # # #
          # # # #
        `,
      });
    });

    test("0-size", () => {
      const dts = drawingTestSetup(3, 3, c0);

      dts.drawApi.rectFilled(v_(1, 1), v_(0, 0), c1);

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - -
          - - -
          - - -
        `,
      });
    });

    test("negative left-top corner", () => {
      const dts = drawingTestSetup(3, 3, c0);

      dts.drawApi.rectFilled(v_(-1, -1), v_(3, 3), c1);

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          # # -
          # # -
          - - -
        `,
      });
    });

    test("negative size", () => {
      const dts = drawingTestSetup(6, 5, c0);

      dts.drawApi.rectFilled(v_(5, 4), v_(-4, -3), c1);

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - -
          - # # # # -
          - # # # # -
          - # # # # -
          - - - - - -
        `,
      });
    });

    test("rounding", () => {
      const dts = drawingTestSetup(16, 9, c0);

      // These numbers are chosen in away which should test whether rounding
      //   is performed before on initial values of xy and wh (which is *not*
      //   what we want here) or rather on calculated xy1 and x2.
      dts.drawApi.rectFilled(v_(1.6, 2.4), v_(12.6, 4.4), c1);

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - - - - - - - - - - - -
          - - - - - - - - - - - - - - - -
          - - # # # # # # # # # # # # - -
          - - # # # # # # # # # # # # - -
          - - # # # # # # # # # # # # - -
          - - # # # # # # # # # # # # - -
          - - # # # # # # # # # # # # - -
          - - - - - - - - - - - - - - - -
          - - - - - - - - - - - - - - - -
        `,
      });
    });

    test("clipping: over the left edge", () => {
      const dts = drawingTestSetup(6, 6, c0);

      dts.drawApi.rectFilled(v_(-2, 1), v_(4, 4), c1);

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - -
          # # - - - -
          # # - - - -
          # # - - - -
          # # - - - -
          - - - - - -
        `,
      });
    });

    test("clipping: over the right edge", () => {
      const dts = drawingTestSetup(6, 6, c0);

      dts.drawApi.rectFilled(v_(4, 1), v_(4, 4), c1);

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - -
          - - - - # #
          - - - - # #
          - - - - # #
          - - - - # #
          - - - - - -
        `,
      });
    });

    test("clipping: over the top edge", () => {
      const dts = drawingTestSetup(6, 6, c0);

      dts.drawApi.rectFilled(v_(1, -2), v_(4, 4), c1);

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - # # # # -
          - # # # # -
          - - - - - -
          - - - - - -
          - - - - - -
          - - - - - -
        `,
      });
    });

    test("clipping: over the bottom edge", () => {
      const dts = drawingTestSetup(6, 6, c0);

      dts.drawApi.rectFilled(v_(1, 4), v_(4, 4), c1);

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - -
          - - - - - -
          - - - - - -
          - - - - - -
          - # # # # -
          - # # # # -
        `,
      });
    });

    test("pattern: simple one, with a single color", () => {
      const dts = drawingTestSetup(4, 4, c0);

      dts.drawApi.setPattern(BpxPattern.of(0b0000_0001_0011_0111));
      dts.drawApi.rectFilled(v_(0, 0), v_(4, 4), c1);

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          # # # #
          # # # -
          # # - -
          # - - -
        `,
      });
    });

    test("pattern: simple one, with two colors", () => {
      const dts = drawingTestSetup(4, 4, c0);

      dts.drawApi.setPattern(BpxPattern.of(0b0000_0001_0011_0111));
      dts.drawApi.rectFilled(v_(0, 0), v_(4, 4), BpxPatternColors.of(c1, c2));

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1, ":": c2 },
        expectedImageAsAscii: `
          # # # #
          # # # :
          # # : :
          # : : :
        `,
      });
    });

    test("pattern: various 4x4 patterns", () => {
      const dts = drawingTestSetup(10, 10, c0);

      dts.drawApi.setPattern(BpxPattern.primaryOnly);
      dts.drawApi.rectFilled(v_(0, 0), v_(10, 10), BpxPatternColors.of(c4, c1));

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1, ":": c2, "%": c3, "=": c4, "^": c5 },
        expectedImageAsAscii: `
          = = = = = = = = = =
          = = = = = = = = = =
          = = = = = = = = = =
          = = = = = = = = = =
          = = = = = = = = = =
          = = = = = = = = = =
          = = = = = = = = = =
          = = = = = = = = = =
          = = = = = = = = = =
          = = = = = = = = = =
        `,
      });

      dts.drawApi.setPattern(BpxPattern.secondaryOnly);
      dts.drawApi.rectFilled(v_(2, 2), v_(6, 6), BpxPatternColors.of(c4, c2));

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1, ":": c2, "%": c3, "=": c4, "^": c5 },
        expectedImageAsAscii: `
          = = = = = = = = = =
          = = = = = = = = = =
          = = : : : : : : = =
          = = : : : : : : = =
          = = : : : : : : = =
          = = : : : : : : = =
          = = : : : : : : = =
          = = : : : : : : = =
          = = = = = = = = = =
          = = = = = = = = = =
        `,
      });

      dts.drawApi.setPattern(BpxPattern.of(0b0000_0001_0011_0111));
      dts.drawApi.rectFilled(v_(0, 0), v_(10, 10), BpxPatternColors.of(c3, ct));

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1, ":": c2, "%": c3, "=": c4, "^": c5 },
        expectedImageAsAscii: `
          % % % % % % % % % %
          % % % = % % % = % %
          % % : : % % : : % %
          % = : : % : : : % =
          % % % % % % % % % %
          % % % : % % % : % %
          % % : : % % : : % %
          % = : : % : : : % =
          % % % % % % % % % %
          % % % = % % % = % %
        `,
      });

      dts.drawApi.setPattern(BpxPattern.of(0b0011_0011_0011_0011));
      dts.drawApi.rectFilled(v_(0, 0), v_(10, 5), BpxPatternColors.of(c5, ct));
      dts.drawApi.setPattern(BpxPattern.of(0b1100_1100_1100_1100));
      dts.drawApi.rectFilled(v_(0, 5), v_(10, 5), BpxPatternColors.of(c5, c1));

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1, ":": c2, "%": c3, "=": c4, "^": c5 },
        expectedImageAsAscii: `
          ^ ^ % % ^ ^ % % ^ ^
          ^ ^ % = ^ ^ % = ^ ^
          ^ ^ : : ^ ^ : : ^ ^
          ^ ^ : : ^ ^ : : ^ ^
          ^ ^ % % ^ ^ % % ^ ^
          # # ^ ^ # # ^ ^ # #
          # # ^ ^ # # ^ ^ # #
          # # ^ ^ # # ^ ^ # #
          # # ^ ^ # # ^ ^ # #
          # # ^ ^ # # ^ ^ # #
        `,
      });
    });

    test("pattern: 4x4 pattern is aligned with canvas' top-left corner", () => {
      const dts = drawingTestSetup(11, 11, c0);

      dts.drawApi.setPattern(BpxPattern.of(0b0000_0001_0011_0111));
      dts.drawApi.rectFilled(v_(1, 1), v_(9, 9), BpxPatternColors.of(c1, ct));

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - - - - - - -
          - # # - # # # - # # -
          - # - - # # - - # # -
          - - - - # - - - # - -
          - # # # # # # # # # -
          - # # - # # # - # # -
          - # - - # # - - # # -
          - - - - # - - - # - -
          - # # # # # # # # # -
          - # # - # # # - # # -
          - - - - - - - - - - -
        `,
      });
    });

    test("camera XY", () => {
      const dts = drawingTestSetup(14, 7, c0);

      dts.drawApi.setCameraXy(v_(3, -2));
      dts.drawApi.rectFilled(v_(1, 1), v_(12, 5), BpxPatternColors.of(c1, c2));

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1, "@": c2 },
        expectedImageAsAscii: `
          - - - - - - - - - - - - - - 
          - - - - - - - - - - - - - - 
          - - - - - - - - - - - - - - 
          # # # # # # # # # # - - - - 
          # # # # # # # # # # - - - - 
          # # # # # # # # # # - - - - 
          # # # # # # # # # # - - - - 
        `,
      });
    });

    test("camera XY + pattern", () => {
      const dts = drawingTestSetup(14, 7, c0);

      dts.drawApi.setCameraXy(v_(3, -2));
      dts.drawApi.setPattern(BpxPattern.of(0b0011_0011_1100_1100));
      dts.drawApi.rectFilled(v_(1, 1), v_(12, 5), BpxPatternColors.of(c1, c2));

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1, "@": c2 },
        expectedImageAsAscii: `
          - - - - - - - - - - - - - - 
          - - - - - - - - - - - - - - 
          - - - - - - - - - - - - - - 
          @ @ # # @ @ # # @ @ - - - - 
          # # @ @ # # @ @ # # - - - - 
          # # @ @ # # @ @ # # - - - - 
          @ @ # # @ @ # # @ @ - - - - 
        `,
      });
    });

    test("canvas snapshot color mapping", () => {
      const dts = drawingTestSetup(14, 7, c0);

      dts.drawApi.rectFilled(v_(0, 2), v_(14, 3), c1);
      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - - - - - - - - - -
          - - - - - - - - - - - - - -
          # # # # # # # # # # # # # #
          # # # # # # # # # # # # # #
          # # # # # # # # # # # # # #
          - - - - - - - - - - - - - -
          - - - - - - - - - - - - - -
        `,
      });

      dts.drawApi.takeCanvasSnapshot();

      dts.drawApi.rectFilled(v_(5, 0), v_(4, 7), c1);
      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1 },
        expectedImageAsAscii: `
          - - - - - # # # # - - - - -
          - - - - - # # # # - - - - -
          # # # # # # # # # # # # # #
          # # # # # # # # # # # # # #
          # # # # # # # # # # # # # #
          - - - - - # # # # - - - - -
          - - - - - # # # # - - - - -
        `,
      });

      dts.drawApi.rectFilled(
        v_(1, 1),
        v_(12, 5),
        BpxCanvasSnapshotColorMapping.of((snapshotColor) =>
          snapshotColor?.cssHex === c1.cssHex ? c2 : c3,
        ),
      );

      dts.canvas.expectToEqual({
        withMapping: { "-": c0, "#": c1, "/": c2, "%": c3 },
        expectedImageAsAscii: `
          - - - - - # # # # - - - - -
          - % % % % % % % % % % % % -
          # / / / / / / / / / / / / #
          # / / / / / / / / / / / / #
          # / / / / / / / / / / / / #
          - % % % % % % % % % % % % -
          - - - - - # # # # - - - - -
        `,
      });
    });
  });
});
