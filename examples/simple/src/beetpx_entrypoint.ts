import { BeetPx, SolidColor, spr_, v_, Vector2d } from "../../../src";

BeetPx.init(
  {
    gameCanvasSize: "128x128",
    desiredUpdateFps: 30,
    visibleTouchButtons: ["left", "right", "up", "down", "x", "o", "menu"],
    debugFeatures: !__BEETPX_IS_PROD__,
  },
  {
    images: [{ url: "logo.png" }],
    fonts: [],
    sounds: [{ url: "music_base.wav" }, { url: "music_melody.wav" }],
  },
).then(({ startGame }) => {
  let melodyPlaybackId: number = -1;

  const velocity = 2;

  const logoPositionBaseDefault = v_((128 - 16) / 2, (128 - 16) / 2);
  let logoPositionBase = Vector2d.zero;
  let logoPositionOffset = Vector2d.zero;

  BeetPx.setOnStarted(() => {
    BeetPx.stopAllSounds();
    BeetPx.playSoundLooped("music_base.wav");
    melodyPlaybackId = BeetPx.playSoundLooped("music_melody.wav", true);

    logoPositionBase = logoPositionBaseDefault;
    logoPositionOffset = Vector2d.zero;
  });

  BeetPx.setOnUpdate(() => {
    if (BeetPx.wasJustPressed("x")) {
      BeetPx.unmuteSound(melodyPlaybackId);
    }
    if (BeetPx.wasJustPressed("o")) {
      BeetPx.muteSound(melodyPlaybackId);
    }

    // TODO: consider exposing some XY (-1,1) representation of directions
    if (BeetPx.isPressed("right")) {
      logoPositionBase = logoPositionBase.add(velocity, 0);
    }
    if (BeetPx.isPressed("left")) {
      logoPositionBase = logoPositionBase.add(-velocity, 0);
    }
    if (BeetPx.isPressed("up")) {
      logoPositionBase = logoPositionBase.add(0, -velocity);
    }
    if (BeetPx.isPressed("down")) {
      logoPositionBase = logoPositionBase.add(0, velocity);
    }

    logoPositionOffset = v_(
      Math.cos((BeetPx.frameNumber / 30) * Math.PI),
      Math.sin((BeetPx.frameNumber / 30) * Math.PI),
    ).mul(10);

    if (BeetPx.wasJustPressed("menu")) {
      BeetPx.restart();
    }
  });

  BeetPx.setOnDraw(() => {
    BeetPx.clearCanvas(SolidColor.fromRgbCssHex("#754665"));
    BeetPx.sprite(
      spr_("logo.png")(0, 0, 16, 16),
      logoPositionBase.add(logoPositionOffset),
    );
    if (BeetPx.debug) {
      BeetPx.line(
        v_(0, 0),
        logoPositionBase.add(logoPositionOffset),
        SolidColor.fromRgbCssHex("#ff0000"),
      );
    }
  });

  startGame();
});
