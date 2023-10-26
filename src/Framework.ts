import { Assets, AssetsToLoad } from "./Assets";
import { BeetPx } from "./BeetPx";
import { BpxSolidColor, black_ } from "./Color";
import { FullScreen } from "./FullScreen";
import { HtmlTemplate } from "./HtmlTemplate";
import { Loading } from "./Loading";
import { BpxUtils } from "./Utils";
import { BpxVector2d, v_, v_0_0_ } from "./Vector2d";
import { AudioApi } from "./audio/AudioApi";
import {
  BpxBrowserType,
  BrowserTypeDetector,
} from "./browser/BrowserTypeDetector";
import { DebugMode } from "./debug/DebugMode";
import { DrawApi } from "./draw_api/DrawApi";
import { CanvasPixels } from "./draw_api/canvas_pixels/CanvasPixels";
import { CanvasPixels2d } from "./draw_api/canvas_pixels/CanvasPixels2d";
import { CanvasPixelsWebGl2 } from "./draw_api/canvas_pixels/CanvasPixelsWebGl2";
import { BpxButtonName } from "./game_input/Buttons";
import { GameInput } from "./game_input/GameInput";
import { GameLoop } from "./game_loop/GameLoop";
import { Logger } from "./logger/Logger";
import { StorageApi } from "./storage/StorageApi";

export type FrameworkOptions = {
  gameCanvasSize: "64x64" | "128x128";
  // TODO: validation it is really one of these two values
  desiredUpdateFps: 30 | 60;
  visibleTouchButtons: BpxButtonName[];
  canvasContextType: "2d" | "webgl2";
  debugFeatures: boolean;
};

export type OnAssetsLoaded = {
  startGame: () => void;
};

export class Framework {
  // TODO: Move debug responsibility to a separate class
  static readonly #storageDebugDisabledKey = "framework__debug_disabled";
  static readonly #storageDebugDisabledTrue = "yes";

  #frameByFrame: boolean;

  readonly #browserType: BpxBrowserType;

  readonly #gameCanvasSize: BpxVector2d;
  readonly #htmlCanvasBackground: BpxSolidColor =
    BpxSolidColor.fromRgbCssHex("#000000");

  readonly #htmlCanvasContext: CanvasRenderingContext2D;
  readonly #offscreenContext: OffscreenCanvasRenderingContext2D;
  readonly #offscreenImageData: ImageData;

  readonly #loading: Loading;
  readonly gameInput: GameInput;
  readonly #gameLoop: GameLoop;
  readonly audioApi: AudioApi;
  readonly #fullScreen: FullScreen;

  readonly storageApi: StorageApi;

  readonly assets: Assets;

  readonly #canvasPixels: CanvasPixels;
  readonly drawApi: DrawApi;

  #onStarted?: () => void;
  #onUpdate?: () => void;
  #onDraw?: () => void;

  #scaleToFill = 1;
  #centeringOffset = v_0_0_;

  #frameNumber: number = 0;
  #renderFps: number = 1;

  // used to indicate whether the AudioContext resume succeeded. It might have been false for the entire
  #alreadyResumedAudioContext: boolean = false;

  get frameNumber(): number {
    return this.#frameNumber;
  }

  get renderFps(): number {
    return this.#renderFps;
  }

  constructor(options: FrameworkOptions) {
    DebugMode.enabled = options.debugFeatures
      ? window.localStorage.getItem(Framework.#storageDebugDisabledKey) !==
        Framework.#storageDebugDisabledTrue
      : false;

    Logger.debug("Framework options:", options);

    this.#frameByFrame = false;

    this.#browserType = BrowserTypeDetector.detect(navigator.userAgent);

    this.#loading = new Loading(HtmlTemplate.selectors.display);

    this.#gameCanvasSize =
      options.gameCanvasSize === "64x64"
        ? v_(64, 64)
        : options.gameCanvasSize === "128x128"
        ? v_(128, 128)
        : BpxUtils.throwError(
            `Unsupported canvas size: "${options.gameCanvasSize}"`,
          );

    const htmlCanvas = document.querySelector<HTMLCanvasElement>(
      HtmlTemplate.selectors.canvas,
    );
    if (!htmlCanvas) {
      throw Error(
        `Was unable to find <canvas> by selector '${HtmlTemplate.selectors.canvas}'`,
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
    offscreenCanvas.width = this.#gameCanvasSize.x;
    offscreenCanvas.height = this.#gameCanvasSize.y;
    const offscreenContext = offscreenCanvas.getContext("2d", {
      // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas#turn_off_transparency
      alpha: false,
    });
    if (!offscreenContext) {
      throw Error("Was unable to obtain OffscreenCanvas' 2D context");
    }
    this.#offscreenContext = offscreenContext;

    this.gameInput = new GameInput({
      visibleTouchButtons: options.visibleTouchButtons,
      // TODO: are those selectors for both touch and mouse? Even if so, make them separate
      muteButtonsSelector: HtmlTemplate.selectors.controlsMuteToggle,
      // TODO: are those selectors for both touch and mouse? Even if so, make them separate
      fullScreenButtonsSelector: HtmlTemplate.selectors.controlsFullScreen,
      enableDebugInputs: options.debugFeatures,
      browserType: this.#browserType,
    });

    this.#gameLoop = new GameLoop({
      desiredUpdateFps: options.desiredUpdateFps,
      requestAnimationFrameFn: window.requestAnimationFrame.bind(window),
      documentVisibilityStateProvider: document,
    });

    this.storageApi = new StorageApi();

    const audioContext = new AudioContext();

    this.assets = new Assets({
      decodeAudioData: (arrayBuffer: ArrayBuffer) =>
        audioContext.decodeAudioData(arrayBuffer),
    });

    this.audioApi = new AudioApi(this.assets, audioContext);

    this.#fullScreen = FullScreen.newFor(
      HtmlTemplate.selectors.display,
      HtmlTemplate.selectors.controlsFullScreen,
    );

    this.#offscreenImageData = this.#offscreenContext.createImageData(
      this.#offscreenContext.canvas.width,
      this.#offscreenContext.canvas.height,
    );

    this.#initializeAsNonTransparent(this.#offscreenImageData);

    this.#canvasPixels =
      options.canvasContextType === "webgl2"
        ? new CanvasPixelsWebGl2(this.#gameCanvasSize)
        : new CanvasPixels2d(
            this.#gameCanvasSize,
            this.#offscreenImageData.data,
          );
    this.drawApi = new DrawApi({
      canvasPixels: this.#canvasPixels,
      assets: this.assets,
    });
  }

  detectedBrowserType(): BpxBrowserType {
    return this.#browserType;
  }

  async loadAssets(assetsToLoad: AssetsToLoad): Promise<OnAssetsLoaded> {
    return this.assets.loadAssets(assetsToLoad).then(() => {
      Logger.infoBeetPx("initialized");
      return {
        startGame: this.#startGame.bind(this),
      };
    });
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

    this.audioApi.restart();

    BeetPx.clearCanvas(black_);

    this.#onStarted?.();
  }

  #initializeAsNonTransparent(imageData: ImageData) {
    for (let i = 3; i < imageData.data.length; i += 4) {
      imageData.data[i] = 0xff;
    }
  }

  // TODO: How to prevent an error of calling startGame twice? What would happen if called twice?
  #startGame(): void {
    if (__BEETPX_IS_PROD__) {
      // A popup which prevents user from accidentally closing the browser tab during gameplay.
      // Implementation notes:
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

    this.#frameNumber = 0;

    this.#onStarted?.();

    this.#loading.showApp();

    this.gameInput.startListening();

    this.#gameLoop.start({
      updateFn: () => {
        if (this.gameInput.buttonFullScreen.wasJustPressed(false)) {
          this.#fullScreen.toggle();
        }
        if (this.gameInput.buttonMuteUnmute.wasJustPressed(false)) {
          if (this.audioApi.isAudioMuted()) {
            this.audioApi.unmuteAudio();
          } else {
            this.audioApi.muteAudio();
          }
        }
        if (this.gameInput.buttonDebugToggle.wasJustPressed(false)) {
          DebugMode.enabled = !DebugMode.enabled;
          if (DebugMode.enabled) {
            window.localStorage.removeItem(Framework.#storageDebugDisabledKey);
          } else {
            window.localStorage.setItem(
              Framework.#storageDebugDisabledKey,
              Framework.#storageDebugDisabledTrue,
            );
          }
          this.#redrawDebugMargin();
        }
        if (this.gameInput.buttonFrameByFrameToggle.wasJustPressed(false)) {
          this.#frameByFrame = !this.#frameByFrame;
          Logger.infoBeetPx(`FrameByFrame mode set to: ${this.#frameByFrame}`);
        }

        const shouldUpdate =
          !this.#frameByFrame ||
          this.gameInput.buttonFrameByFrameStep.wasJustPressed(false);

        const hasAnyInteractionHappened = this.gameInput.update({
          skipGameButtons: !shouldUpdate,
        });
        if (hasAnyInteractionHappened && !this.#alreadyResumedAudioContext) {
          this.audioApi
            .tryToResumeAudioContextSuspendedByBrowserForSecurityReasons()
            .then((resumed) => {
              if (resumed) {
                this.#alreadyResumedAudioContext = true;
              }
            });
        }

        if (shouldUpdate) {
          if (this.#frameByFrame) {
            Logger.infoBeetPx(
              `Running onUpdate for frame: ${this.#frameNumber}`,
            );
          }

          this.#onUpdate?.();

          this.#frameNumber =
            this.#frameNumber >= Number.MAX_SAFE_INTEGER
              ? 0
              : this.#frameNumber + 1;
        }
      },
      renderFn: (renderFps) => {
        this.#renderFps = renderFps;

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
    this.#canvasPixels.render();

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
    // TODO: does the fitting algorithm take DPI into account? Maybe it would allow low res game to occupy more space?

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
    this.#htmlCanvasContext.fillStyle = DebugMode.enabled
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
