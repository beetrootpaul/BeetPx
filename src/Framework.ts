import { Assets, AssetsToLoad } from "./Assets";
import { AudioApi } from "./audio/AudioApi";
import { SolidColor } from "./Color";
import { DrawApi } from "./draw_api/DrawApi";
import { FullScreen } from "./FullScreen";
import { Buttons } from "./game_input/Buttons";
import { GameInput, GameInputEvent } from "./game_input/GameInput";
import { GameLoop } from "./game_loop/GameLoop";
import { Loading } from "./Loading";
import { StorageApi } from "./storage/StorageApi";
import { v_, Vector2d } from "./Vector2d";

export type FrameworkOptions = {
  gameCanvasSize: Vector2d;
  desiredFps: number;
  // TODO: Does is still work?
  logActualFps?: boolean;
  debug?: {
    available: boolean;
    /**
     * A key to toggle debug mode on/off. Has to match a
     * [KeyboardEvent.key](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key)
     * of a desired key.
     */
    toggleKey?: string;
    frameByFrame?: {
      activateKey?: string;
      stepKey?: string;
    };
  };
};

export type OnAssetsLoaded = {
  startGame: () => void;
};

export class Framework {
  // TODO: Move debug responsibility to a separate class
  static readonly #storageDebugDisabledKey = "framework__debug_disabled";
  static readonly #storageDebugDisabledTrue = "yes";

  readonly #htmlDisplaySelector = "#display";
  readonly #htmlCanvasSelector = "#canvas";
  readonly #htmlControlsFullscreenSelector = ".controls_fullscreen_toggle";
  readonly #htmlControlsMuteSelector = ".controls_mute_toggle";

  readonly #debugOptions: FrameworkOptions["debug"];
  #debug: boolean;
  #frameByFrame: boolean;
  get debug(): boolean {
    return this.#debug;
  }

  readonly #gameCanvasSize: Vector2d;
  readonly #htmlCanvasBackground: SolidColor =
    SolidColor.fromRgbCssHex("#000000");

  readonly #htmlCanvasContext: CanvasRenderingContext2D;
  readonly #offscreenContext: OffscreenCanvasRenderingContext2D;
  readonly #offscreenImageData: ImageData;

  readonly #loading: Loading;
  readonly #gameInput: GameInput;
  readonly buttons: Buttons;
  readonly #gameLoop: GameLoop;
  readonly audioApi: AudioApi;
  readonly #fullScreen: FullScreen;

  readonly storageApi: StorageApi;

  readonly assets: Assets;

  readonly drawApi: DrawApi;

  #onStarted?: () => void;
  #onUpdate?: () => void;
  #onDraw?: () => void;

  #scaleToFill = 1;
  #centeringOffset = Vector2d.zero;

  #frameNumber: number = 0;
  averageFps: number = 1;
  continuousInputEvents: Set<GameInputEvent> = new Set();
  fireOnceInputEvents: Set<GameInputEvent> = new Set();

  get frameNumber(): number {
    return this.#frameNumber;
  }

  constructor(options: FrameworkOptions) {
    this.#debugOptions = options.debug ?? {
      available: false,
    };
    this.#debug = this.#debugOptions?.available
      ? window.localStorage.getItem(Framework.#storageDebugDisabledKey) !==
        Framework.#storageDebugDisabledTrue
      : false;
    this.#frameByFrame = false;

    this.#loading = new Loading(this.#htmlDisplaySelector);

    this.#gameCanvasSize = options.gameCanvasSize.floor();

    const htmlCanvas = document.querySelector<HTMLCanvasElement>(
      this.#htmlCanvasSelector,
    );
    if (!htmlCanvas) {
      throw Error(
        `Was unable to find <canvas> by selector '${this.#htmlCanvasSelector}'`,
      );
    }

    const htmlCanvasContext = htmlCanvas.getContext("2d", {
      // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas#turn_off_transparency
      alpha: false,
    });
    if (!htmlCanvasContext) {
      throw Error("Was unable to obtain <canvas>' 2D context");
    }
    this.#htmlCanvasContext = htmlCanvasContext;

    const offscreenCanvas = document
      .createElement("canvas")
      .transferControlToOffscreen();
    offscreenCanvas.width = options.gameCanvasSize.x;
    offscreenCanvas.height = options.gameCanvasSize.y;
    const offscreenContext = offscreenCanvas.getContext("2d", {
      // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas#turn_off_transparency
      alpha: false,
    });
    if (!offscreenContext) {
      throw Error("Was unable to obtain OffscreenCanvas' 2D context");
    }
    this.#offscreenContext = offscreenContext;

    this.#gameInput = new GameInput({
      muteButtonsSelector: this.#htmlControlsMuteSelector,
      fullScreenButtonsSelector: this.#htmlControlsFullscreenSelector,
      // TODO: extract ";", ",", and "." to some file about debugging
      debugToggleKey: this.#debugOptions?.available
        ? this.#debugOptions?.toggleKey ?? ";"
        : undefined,
      debugFrameByFrameActivateKey: this.#debugOptions?.available
        ? this.#debugOptions.frameByFrame?.activateKey ?? ","
        : undefined,
      debugFrameByFrameStepKey: this.#debugOptions?.available
        ? this.#debugOptions.frameByFrame?.stepKey ?? "."
        : undefined,
    });

    this.buttons = new Buttons();

    this.#gameLoop = new GameLoop({
      desiredFps: options.desiredFps,
      logActualFps: options.logActualFps ?? false,
      requestAnimationFrameFn: window.requestAnimationFrame.bind(window),
    });

    this.storageApi = new StorageApi();

    const audioContext = new AudioContext();

    this.assets = new Assets({
      decodeAudioData: (arrayBuffer: ArrayBuffer) =>
        audioContext.decodeAudioData(arrayBuffer),
    });

    this.audioApi = new AudioApi(this.assets, audioContext);

    this.#fullScreen = FullScreen.newFor(
      this.#htmlDisplaySelector,
      this.#htmlControlsFullscreenSelector,
    );

    this.#offscreenImageData = this.#offscreenContext.createImageData(
      this.#offscreenContext.canvas.width,
      this.#offscreenContext.canvas.height,
    );
    this.drawApi = new DrawApi({
      canvasBytes: this.#offscreenImageData.data,
      canvasSize: this.#gameCanvasSize,
      assets: this.assets,
    });
  }

  async loadAssets(assetsToLoad: AssetsToLoad): Promise<OnAssetsLoaded> {
    return this.assets.loadAssets(assetsToLoad).then(() => ({
      startGame: this.#startGame.bind(this),
    }));
  }

  setOnStarted(onStarted: () => void) {
    this.#onStarted = onStarted;
  }

  setOnUpdate(onUpdate: () => void) {
    this.#onUpdate = onUpdate;
  }

  setOnDraw(onDraw: () => void) {
    this.#onDraw = onDraw;
  }

  restart() {
    this.#frameNumber = 0;
    this.#onStarted?.();
  }

  // TODO: How to prevent an error of calling startGame twice? What would happen if called twice?
  #startGame(): void {
    if (__BEETPX_IS_PROD__) {
      // - returned message seems to be ignored by some browsers, therefore using `""`
      // - this event is *not* always run when for example there was no mouse click inside
      //   iframe with the game in Firefox
      // - there are two ways of implementing this, because of browsers incompatibilities,
      //   therefore using both of them here (`event.returnValue =` and `return`)
      window.addEventListener("beforeunload", (event) => {
        event.preventDefault();
        event.returnValue = "";
        return "";
      });
    }

    this.#setupHtmlCanvas();
    window.addEventListener("resize", (_event) => {
      this.#setupHtmlCanvas();
    });

    this.#onStarted?.();

    this.#loading.showApp();

    this.#gameInput.startListening();

    this.#gameLoop.start({
      updateFn: (averageFps) => {
        const fireOnceEvents = this.#gameInput.consumeFireOnceEvents();
        if (fireOnceEvents.has("full_screen")) {
          this.#fullScreen.toggle();
        }
        if (fireOnceEvents.has("mute_unmute_toggle")) {
          this.audioApi.toggleMuteUnmute();
        }
        if (fireOnceEvents.has("debug_toggle")) {
          this.#debug = !this.#debug;
          console.debug(`Debug flag set to: ${this.#debug}`);
          if (this.#debug) {
            window.localStorage.removeItem(Framework.#storageDebugDisabledKey);
          } else {
            window.localStorage.setItem(
              Framework.#storageDebugDisabledKey,
              Framework.#storageDebugDisabledTrue,
            );
          }
          this.#redrawDebugMargin();
        }
        if (fireOnceEvents.has("frame_by_frame_toggle")) {
          this.#frameByFrame = !this.#frameByFrame;
          console.debug(`FrameByFrame mode set to: ${this.#frameByFrame}`);
        }

        const continuousEvents = this.#gameInput.getCurrentContinuousEvents();

        if (fireOnceEvents.size > 0 || continuousEvents.size > 0) {
          this.audioApi.resumeAudioContextIfNeeded();
        }

        this.averageFps = averageFps;
        this.continuousInputEvents = continuousEvents;
        this.fireOnceInputEvents = fireOnceEvents;

        if (!this.#frameByFrame || fireOnceEvents.has("frame_by_frame_step")) {
          if (this.#frameByFrame) {
            console.debug(`Running onUpdate for frame: ${this.#frameNumber}`);
          }

          this.buttons.update(continuousEvents);

          this.#onUpdate?.();

          this.#frameNumber =
            this.#frameNumber == Number.MAX_SAFE_INTEGER
              ? 0
              : this.#frameNumber + 1;
        }
      },
      renderFn: () => {
        this.#onDraw?.();
        this.#render();
      },
    });
  }

  // This function assumes that <canvas> has width and height set to 100% by CSS.
  #setupHtmlCanvas(): void {
    // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas#scaling_for_high_resolution_displays
    this.#htmlCanvasContext.canvas.width =
      this.#htmlCanvasContext.canvas.getBoundingClientRect().width *
      window.devicePixelRatio;
    this.#htmlCanvasContext.canvas.height =
      this.#htmlCanvasContext.canvas.getBoundingClientRect().height *
      window.devicePixelRatio;

    this.#htmlCanvasContext.imageSmoothingEnabled = false;

    this.#htmlCanvasContext.fillStyle =
      this.#htmlCanvasBackground.asRgbCssHex();
    this.#htmlCanvasContext.fillRect(
      0,
      0,
      this.#htmlCanvasContext.canvas.width,
      this.#htmlCanvasContext.canvas.height,
    );
  }

  #render(): void {
    this.#offscreenContext.putImageData(this.#offscreenImageData, 0, 0);

    const htmlCanvasSize = v_(
      this.#htmlCanvasContext.canvas.width,
      this.#htmlCanvasContext.canvas.height,
    );
    // TODO: encapsulate this calculation and related fields
    this.#scaleToFill = Math.min(
      htmlCanvasSize.div(this.#gameCanvasSize).floor().x,
      htmlCanvasSize.div(this.#gameCanvasSize).floor().y,
    );
    this.#centeringOffset = htmlCanvasSize
      .sub(this.#gameCanvasSize.mul(this.#scaleToFill))
      .div(2)
      .floor();

    this.#redrawDebugMargin();

    this.#htmlCanvasContext.drawImage(
      this.#offscreenContext.canvas,
      0,
      0,
      this.#offscreenContext.canvas.width,
      this.#offscreenContext.canvas.height,
      this.#centeringOffset.x,
      this.#centeringOffset.y,
      this.#scaleToFill * this.#gameCanvasSize.x,
      this.#scaleToFill * this.#gameCanvasSize.y,
    );
  }

  #redrawDebugMargin(): void {
    const debugBgMargin = 1;
    this.#htmlCanvasContext.fillStyle = this.#debug
      ? "#ff0000"
      : this.#htmlCanvasBackground.asRgbCssHex();
    this.#htmlCanvasContext.fillRect(
      this.#centeringOffset.x - debugBgMargin,
      this.#centeringOffset.y - debugBgMargin,
      this.#scaleToFill * this.#gameCanvasSize.x + 2 * debugBgMargin,
      this.#scaleToFill * this.#gameCanvasSize.y + 2 * debugBgMargin,
    );
  }
}
