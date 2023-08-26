import { Logger } from "../logger/Logger";

export class DebugMode {
  static #enabled = false;

  static get enabled(): boolean {
    return this.#enabled;
  }
  static set enabled(value: boolean) {
    this.#enabled = value;
    Logger.infoBeetPx(`Debug flag set to: ${this.#enabled}`);
  }
}

// TODO: consider `private _abc` notation instead of `#abc`
