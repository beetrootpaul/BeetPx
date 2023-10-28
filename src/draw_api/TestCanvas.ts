import { expect } from "@jest/globals";
import { BpxColorId, BpxSolidColor } from "../Color";
import { v_ } from "../Vector2d";
import { CanvasPixels } from "./canvas_pixels/CanvasPixels";
import { CanvasPixelsForTests } from "./canvas_pixels/CanvasPixelsForTests";

export class TestCanvas {
  readonly pixels: CanvasPixels;

  constructor(width: number, height: number, color: BpxSolidColor) {
    this.pixels = new CanvasPixelsForTests(v_(width, height));
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.pixels.set(color, x, y);
      }
    }
  }

  expectToEqual(params: {
    withMapping: Record<string, BpxSolidColor>;
    expectedImageAsAscii: string;
  }) {
    const { withMapping: asciiToColor, expectedImageAsAscii } = params;

    const colorToAscii: Map<BpxColorId, string> = new Map(
      Object.entries(asciiToColor).map(([ascii, color]) => [color.id, ascii]),
    );

    const actualAscii = this.#asAscii(colorToAscii);

    const expectedAscii =
      expectedImageAsAscii
        .trim()
        .split("\n")
        .map((line) =>
          line
            .trim()
            .split("")
            .filter((char) => char !== " ")
            .join(" "),
        )
        .filter((line) => line.length > 0)
        .join("\n") + "\n";

    expect(actualAscii).toEqual(expectedAscii);
  }

  #asAscii(colorToAscii: Map<BpxColorId, string>): string {
    let asciiImage = "";

    const snapshotId = this.pixels.generateNextSnapshotId();
    this.pixels.takeSnapshot(snapshotId);
    const snapshot = this.pixels.getSnapshot(snapshotId)!;
    for (let y = 0; y < this.pixels.canvasSize.y; y += 1) {
      for (let x = 0; x < this.pixels.canvasSize.x; x += 1) {
        const index = y * this.pixels.canvasSize.x + x;
        const color = snapshot.get(index);
        asciiImage += colorToAscii.get(color.id) ?? "?";
      }
      asciiImage += "\n";
    }

    return asciiImage
      .split("\n")
      .map((line) => line.split("").join(" "))
      .join("\n");
  }
}
