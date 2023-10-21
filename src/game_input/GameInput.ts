import { Button } from "./Button";
import { BpxButtonName, Buttons } from "./Buttons";
import { GamepadGameInput } from "./GamepadGameInput";
import { KeyboardGameInput } from "./KeyboardGameInput";
import { MouseGameInput } from "./MouseGameInput";
import { SpecializedGameInput } from "./SpecializedGameInput";
import { TouchGameInput } from "./TouchGameInput";

export type GameInputMethod = "gamepad" | "keyboard" | "mouse" | "touch";

export type BpxGameInputEvent =
  | null
  | "button_left"
  | "button_right"
  | "button_up"
  | "button_down"
  | "button_a"
  | "button_b"
  | "button_menu"
  | "mute_unmute_toggle"
  | "full_screen"
  | "debug_toggle"
  | "frame_by_frame_toggle"
  | "frame_by_frame_step";

export class GameInput {
  readonly #specializedGameInputs: SpecializedGameInput[];

  readonly gameButtons: Buttons;

  readonly buttonFullScreen: Button;
  readonly buttonMuteUnmute: Button;
  readonly buttonDebugToggle: Button;
  readonly buttonFrameByFrameToggle: Button;
  readonly buttonFrameByFrameStep: Button;

  #eventsCapturesInLastUpdate: Set<BpxGameInputEvent> = new Set();

  #mostRecentInputMethods: Set<GameInputMethod> = new Set();

  constructor(params: {
    visibleTouchButtons: BpxButtonName[];
    muteButtonsSelector: string;
    fullScreenButtonsSelector: string;
    enableDebugInputs: boolean;
  }) {
    this.#specializedGameInputs = [
      new MouseGameInput({
        muteButtonsSelector: params.muteButtonsSelector,
        fullScreenButtonsSelector: params.fullScreenButtonsSelector,
      }),
      new KeyboardGameInput({
        enableDebugInputs: params.enableDebugInputs,
      }),
      new TouchGameInput({
        visibleButtons: params.visibleTouchButtons,
      }),
      new GamepadGameInput(),
    ];

    this.gameButtons = new Buttons();

    this.buttonFullScreen = new Button();
    this.buttonMuteUnmute = new Button();
    this.buttonDebugToggle = new Button();
    this.buttonFrameByFrameToggle = new Button();
    this.buttonFrameByFrameStep = new Button();
  }

  startListening(): void {
    for (const sgi of this.#specializedGameInputs) {
      sgi.startListening();
    }
  }

  /**
   * @return If any interaction happened.
   */
  update(params: { skipGameButtons: boolean }): boolean {
    this.#mostRecentInputMethods.clear();

    const events = new Set<BpxGameInputEvent>();
    for (const sgi of this.#specializedGameInputs) {
      if (sgi.update(events)) {
        // We do not care here if there were many input methods active at once,
        //   since usually it will be just one method.
        this.#mostRecentInputMethods.add(sgi.inputMethod);
      }
    }

    this.#eventsCapturesInLastUpdate = events;

    if (!params.skipGameButtons) {
      this.gameButtons.update(events);
    }

    this.buttonFullScreen.update(events.has("full_screen"));
    this.buttonMuteUnmute.update(events.has("mute_unmute_toggle"));
    this.buttonDebugToggle.update(events.has("debug_toggle"));
    this.buttonFrameByFrameToggle.update(events.has("frame_by_frame_toggle"));
    this.buttonFrameByFrameStep.update(events.has("frame_by_frame_step"));

    return events.size > 0;
  }

  mostRecentInputMethods(): Set<GameInputMethod> {
    return this.#mostRecentInputMethods;
  }

  __internal__capturedEvents(): Set<BpxGameInputEvent> {
    return this.#eventsCapturesInLastUpdate;
  }
}
