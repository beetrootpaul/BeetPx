import { BpxBrowserType } from "../browser/BrowserTypeDetector";
import { u_ } from "../Utils";
import { BpxGameInputEvent, GameInputMethod } from "./GameInput";
import { GamepadMapping } from "./gamepad_mapping/GamepadMapping";
import { GamepadMappingFallback } from "./gamepad_mapping/GamepadMappingFallback";
import { GamepadMappingFirefoxDualSense } from "./gamepad_mapping/GamepadMappingFirefoxDualSense";
import { GamepadMappingFirefoxXbox } from "./gamepad_mapping/GamepadMappingFirefoxXbox";
import { GamepadMappingStandard } from "./gamepad_mapping/GamepadMappingStandard";
import { GamepadTypeDetector } from "./GamepadTypeDetector";
import { SpecializedGameInput } from "./SpecializedGameInput";

export const supportedGamepadTypes = ["xbox", "dualsense", "other"] as const;

export type BpxGamepadType = (typeof supportedGamepadTypes)[number];

export class GamepadGameInput implements SpecializedGameInput {
  inputMethod: GameInputMethod = "gamepad";

  readonly #browserType: BpxBrowserType;

  readonly #mappings = {
    standard: new GamepadMappingStandard(),
    firefoxDualSense: new GamepadMappingFirefoxDualSense(),
    firefoxOther: new GamepadMappingFirefoxXbox(),
    other: new GamepadMappingFallback(),
  };

  constructor(params: { browserType: BpxBrowserType }) {
    this.#browserType = params.browserType;
  }

  startListening(): void {
    // do nothing
  }

  update(eventsCollector: Set<BpxGameInputEvent>): boolean {
    let wasAnyEventDetected = false;

    for (const gamepad of navigator.getGamepads()) {
      if (!gamepad) continue;

      const mapping = this.#mappingFor(gamepad);

      gamepad.buttons.forEach((button, buttonIndex) => {
        const event = mapping.eventForButton(buttonIndex, button);
        if (event) {
          eventsCollector.add(event);
          wasAnyEventDetected = true;
        }
      });

      gamepad.axes.forEach((axisValue, axisIndex) => {
        mapping.eventsForAxisValue(axisIndex, axisValue).forEach((event) => {
          eventsCollector.add(event);
          wasAnyEventDetected = true;
        });
      });
    }

    return wasAnyEventDetected;
  }

  connectedGamepadTypes(): Set<BpxGamepadType> {
    return new Set<BpxGamepadType>(
      navigator
        .getGamepads()
        .filter(u_.isDefined)
        .map((gamepad) => GamepadTypeDetector.detect(gamepad)),
    );
  }

  #mappingFor(gamepad: Gamepad): GamepadMapping {
    if (gamepad.mapping === "standard") {
      return new GamepadMappingStandard();
    }
    if (this.#browserType === "firefox") {
      if (GamepadTypeDetector.detect(gamepad) === "dualsense") {
        return new GamepadMappingFirefoxDualSense();
      } else {
        // Let's use Xbox as a default one for all other gamepad types in Firefox,
        //   since my gut feeling is the way `GamepadTypeDetector` detects
        //   DualSense would work for DualShock as well.
        return new GamepadMappingFirefoxXbox();
      }
    }
    return new GamepadMappingFallback();
  }
}
