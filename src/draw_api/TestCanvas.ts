import { expect } from "@jest/globals";
import { BpxColorId, BpxSolidColor } from "../Color";
import { BpxVector2d, v2d_ } from "../Vector2d";

export class TestCanvas {
  readonly size: BpxVector2d;
  readonly bytes: Uint8ClampedArray;

  constructor(width: number, height: number, color: BpxSolidColor) {
    this.size = v2d_(width, height);
    this.bytes = new Uint8ClampedArray(4 * width * height);
    for (let i = 0; i < width * height; i += 1) {
      this.bytes[4 * i] = color.r;
      this.bytes[4 * i + 1] = color.g;
      this.bytes[4 * i + 2] = color.b;
      this.bytes[4 * i + 3] = 0xff;
    }
  }

  expectToEqual(params: {
    withMapping: Record<string, BpxSolidColor>;
    expectedImageAsAscii: string;
  }) {
    // first, let's check if bytes didn't increase in their length

    expect(this.bytes.length).toEqual(this.size[0] * this.size[1] * 4);

    // then, let's proceed to the actual image check

    const { withMapping: asciiToColor, expectedImageAsAscii } = params;

    const colorToAscii: Map<BpxColorId, string> = new Map(
      Object.entries(asciiToColor).map(([ascii, color]) => [color.id, ascii]),
    );

    const actualAscii = this.#asAscii(colorToAscii);

    const expectedAscii =
      params.expectedImageAsAscii
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

    for (let y = 0; y < this.size[1]; y += 1) {
      for (let x = 0; x < this.size[0]; x += 1) {
        const i = 4 * (y * this.size[0] + x);
        const colorBytes = this.bytes.slice(i, i + 4);
        if (colorBytes[3] !== 0xff) {
          asciiImage += "!";
        } else {
          const color = new BpxSolidColor(
            colorBytes[0]!,
            colorBytes[1]!,
            colorBytes[2]!,
          );
          asciiImage += colorToAscii.get(color.id) ?? "?";
        }
      }
      asciiImage += "\n";
    }

    return asciiImage
      .split("\n")
      .map((line) => line.split("").join(" "))
      .join("\n");
  }
}
