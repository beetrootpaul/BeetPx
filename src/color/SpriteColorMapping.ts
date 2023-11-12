import { BpxColorMapper } from "./ColorMapper";
import { BpxRgbColor, BpxRgbCssHex } from "./RgbColor";

export class BpxSpriteColorMapping {
  static noMapping: BpxSpriteColorMapping = new BpxSpriteColorMapping((c) => c);

  static from(
    colorMappingEntries: Array<[BpxRgbColor, BpxRgbColor | null]>,
  ): BpxSpriteColorMapping {
    const map = new Map<BpxRgbCssHex, BpxRgbColor | null>(
      colorMappingEntries.map(([from, to]) => [from.cssHex, to]),
    );
    return new BpxSpriteColorMapping((spriteColor) => {
      if (!spriteColor) return spriteColor;
      const mapped = map.get(spriteColor.cssHex);
      return typeof mapped === "undefined" ? spriteColor : mapped;
    });
  }

  // noinspection JSUnusedLocalSymbols
  readonly #nominalTypeHelper__spriteMapping = true;

  readonly #mapping: BpxColorMapper;

  constructor(mapping: BpxColorMapper) {
    this.#mapping = mapping;
  }

  getMappedColor(spriteColor: BpxRgbColor | null): BpxRgbColor | null {
    return this.#mapping(spriteColor);
  }
}
