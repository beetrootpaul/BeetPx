import { BpxGameInputEvent, GameInputMethod } from "./GameInput";
import { GameInputSpecialized } from "./GameInputSpecialized";

export class GameInputKeyboard implements GameInputSpecialized {
  inputMethod: GameInputMethod = "keyboard";

  readonly #keyMapping: Map<string, BpxGameInputEvent> = new Map<
    string,
    BpxGameInputEvent
  >([
    ["ArrowLeft", "button_left"],
    ["ArrowRight", "button_right"],
    ["ArrowUp", "button_up"],
    ["ArrowDown", "button_down"],

    ["w", "button_up"],
    ["W", "button_up"],
    ["s", "button_down"],
    ["S", "button_down"],
    ["a", "button_left"],
    ["A", "button_left"],
    ["d", "button_right"],
    ["D", "button_right"],

    ["j", "button_a"],
    ["J", "button_a"],
    ["k", "button_b"],
    ["K", "button_b"],

    ["c", "button_a"],
    ["C", "button_a"],
    ["x", "button_b"],
    ["x", "button_b"],

    ["p", "button_menu"],
    ["P", "button_menu"],
    ["Escape", "button_menu"],
    ["Enter", "button_menu"],

    ["m", "mute_unmute_toggle"],
    ["M", "mute_unmute_toggle"],

    ["f", "full_screen"],
    ["F", "full_screen"],
  ]);

  readonly #eventsSinceLastUpdate: Set<BpxGameInputEvent> =
    new Set<BpxGameInputEvent>();

  constructor(params: { enableDebugInputs: boolean }) {
    if (params.enableDebugInputs) {
      this.#keyMapping.set(";", "debug_toggle");
      this.#keyMapping.set(",", "frame_by_frame_toggle");
      this.#keyMapping.set(".", "frame_by_frame_step");
    }
  }

  startListening(): void {
    document.addEventListener("keydown", (keyboardEvent: KeyboardEvent) => {
      const gameInputEvent = this.#keyMapping.get(keyboardEvent.key);
      if (gameInputEvent) {
        keyboardEvent.preventDefault();
        this.#eventsSinceLastUpdate.add(gameInputEvent);
      }
    });
    document.addEventListener("keyup", (keyboardEvent: KeyboardEvent) => {
      const gameInputEvent = this.#keyMapping.get(keyboardEvent.key);
      if (gameInputEvent) {
        keyboardEvent.preventDefault();
        this.#eventsSinceLastUpdate.delete(gameInputEvent);
      }
    });
  }

  update(eventsCollector: Set<BpxGameInputEvent>): boolean {
    let anythingAdded = false;

    for (const event of this.#eventsSinceLastUpdate) {
      eventsCollector.add(event);
      anythingAdded = true;
    }

    // On macOS Chrome and Safari "keyup" (for a full screen toggle key) is
    //   not registered during full screen transition. If user presses the key
    //   for a typical short duration, it ends up recognized as still pressed
    //   after the full screen transition ends. Therefore, in order to toggle
    //   full screen back, user has to press the key twice: once to "release"
    //   the key, and second time to initiate the next full screen transition.
    // As a workaround we do not keep "full_screen" event "pressed", so the
    //   engine will recognize it as a key being up immediately.
    this.#eventsSinceLastUpdate.delete("full_screen");

    return anythingAdded;
  }
}
