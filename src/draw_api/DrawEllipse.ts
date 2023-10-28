import { BpxCompositeColor, BpxMappingColor, BpxSolidColor } from "../Color";
import { BpxVector2d } from "../Vector2d";
import { CanvasPixels } from "./canvas_pixels/CanvasPixels";
import { BpxClippingRegion } from "./ClippingRegion";
import { DrawPixel } from "./DrawPixel";
import { BpxFillPattern } from "./FillPattern";

export class DrawEllipse {
  readonly #canvasPixels: CanvasPixels;

  readonly #pixel: DrawPixel;

  constructor(canvasPixels: CanvasPixels) {
    this.#canvasPixels = canvasPixels;

    this.#pixel = new DrawPixel(this.#canvasPixels, {
      disableRounding: true,
      disableVisitedCheck: false,
    });
  }

  // TODO: tests for MappingColor x fillPattern => secondary means no mapping?
  // TODO: tests for MappingColor
  // TODO: tests for CompositeColor and fillPattern
  // TODO: cover ClippingRegion with tests
  // Based on http://members.chello.at/easyfilter/bresenham.html
  draw(
    xy: BpxVector2d,
    wh: BpxVector2d,
    color: BpxSolidColor | BpxCompositeColor | BpxMappingColor,
    fill: boolean,
    fillPattern: BpxFillPattern = BpxFillPattern.primaryOnly,
    clippingRegion: BpxClippingRegion | null = null,
  ): void {
    const [xyMinInclusive, xyMaxExclusive] = BpxVector2d.minMax(
      xy.round(),
      xy.add(wh).round(),
    );

    if (
      xyMaxExclusive.x - xyMinInclusive.x <= 0 ||
      xyMaxExclusive.y - xyMinInclusive.y <= 0
    ) {
      return;
    }

    // avoid all computations if the whole rectangle is outside the canvas
    if (
      xyMaxExclusive.x <= 0 ||
      xyMaxExclusive.y <= 0 ||
      xyMinInclusive.x >= this.#canvasPixels.canvasSize.x ||
      xyMinInclusive.y >= this.#canvasPixels.canvasSize.y
    ) {
      return;
    }

    //
    // PREPARE
    //

    let a = xyMaxExclusive.x - xyMinInclusive.x - 1;
    let b = xyMaxExclusive.y - xyMinInclusive.y - 1;
    let b1 = b & 1;

    let left = xyMinInclusive.x;
    let right = xyMaxExclusive.x - 1;
    let bottom = xyMinInclusive.y + Math.floor((b + 1) / 2);
    let top = bottom - b1;

    let errIncrementX = 4 * (1 - a) * b * b;
    let errIncrementY = 4 * (b1 + 1) * a * a;
    let currentErr = errIncrementX + errIncrementY + b1 * a * a;

    a = 8 * a * a;
    b1 = 8 * b * b;

    do {
      //
      // DRAW THE CURRENT PIXEL IN EACH QUADRANT
      //

      this.#pixel.draw(right, bottom, color, fillPattern, clippingRegion);
      this.#pixel.draw(left, bottom, color, fillPattern, clippingRegion);
      this.#pixel.draw(left, top, color, fillPattern, clippingRegion);
      this.#pixel.draw(right, top, color, fillPattern, clippingRegion);
      if (fill) {
        for (let x = left + 1; x < right; x++) {
          this.#pixel.draw(x, top, color, fillPattern, clippingRegion);
          this.#pixel.draw(x, bottom, color, fillPattern, clippingRegion);
        }
      }

      //
      // STEP TO THE NEXT PIXEL
      //

      const currentErrBeforeStep = currentErr;
      if (2 * currentErrBeforeStep <= errIncrementY) {
        bottom += 1;
        top -= 1;
        errIncrementY += a;
        currentErr += errIncrementY;
      }
      if (
        2 * currentErrBeforeStep >= errIncrementX ||
        2 * currentErr > errIncrementY
      ) {
        left += 1;
        right -= 1;
        errIncrementX += b1;
        currentErr += errIncrementX;
      }
    } while (left <= right);

    //
    // DRAW MISSING TOP & BOTTOM PARTS
    //

    while (bottom - top <= b) {
      // TODO: update the implementation below to honor fill pattern

      this.#pixel.draw(left - 1, bottom, color, fillPattern, clippingRegion);
      this.#pixel.draw(right + 1, bottom, color, fillPattern, clippingRegion);
      bottom += 1;
      this.#pixel.draw(left - 1, top, color, fillPattern, clippingRegion);
      this.#pixel.draw(right + 1, top, color, fillPattern, clippingRegion);
      top -= 1;
    }
  }
}
