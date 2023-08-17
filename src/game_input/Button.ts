// TODO: implement a PICO-8 like button press detection which starts to repeat after certain threshold
import { Timer } from "../misc/Timer";

export class Button {
  // TODO: there numbers work good for 60 FPS. Make them depending on FPS to have the same durations in seconds
  static readonly repeatingFramesStart = 30;
  static readonly repeatingFramesInterval = 8;

  #isPressed = false;
  #wasJustToggled = false;

  #repeatingTimer: Timer | null = null;

  get isPressed(): boolean {
    return this.#isPressed;
  }

  wasJustPressed(repeating: boolean): boolean {
    return (
      (this.#wasJustToggled && this.#isPressed) ||
      (repeating && !!this.#repeatingTimer?.hasFinished)
    );
  }

  wasJustReleased(repeating: boolean): boolean {
    return (
      (this.#wasJustToggled && !this.#isPressed) ||
      (repeating && !!this.#repeatingTimer?.hasFinished)
    );
  }

  update(isPressed: boolean): void {
    this.#wasJustToggled = this.#isPressed !== isPressed;
    this.#isPressed = isPressed;

    if (isPressed && this.#repeatingTimer?.hasFinished) {
      this.#repeatingTimer = new Timer({
        frames: Button.repeatingFramesInterval,
      });
    }

    this.#repeatingTimer?.update();

    if (isPressed && this.#wasJustToggled) {
      this.#repeatingTimer = new Timer({ frames: Button.repeatingFramesStart });
    }

    if (!isPressed && this.#repeatingTimer) {
      this.#repeatingTimer = null;
    }
  }
}
