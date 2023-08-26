import { Assets, SoundAsset, SoundUrl } from "../Assets";
import { Logger } from "../logger/Logger";
import { Utils } from "../Utils";
import { SoundSequence, SoundSequenceEntry } from "./SoundSequence";

export type AudioPlaybackId = number;

// TODO: refactor this big mess of a class, extract playbacks for example
export class AudioApi {
  static readonly #storageMuteUnmuteKey = "audio_api__muted";
  static readonly #storageMuteUnmuteTrue = "yes";

  // start from 1 to avoid a case when someone checks for ID being truthy and gets `false`, because of value `0`
  static #nextPlaybackId = 1;

  readonly #assets: Assets;
  readonly #audioContext: AudioContext;

  readonly #globalGainNode: GainNode;

  readonly #muteUnmuteExponentialTimeConstant = 0.1;

  #isGloballyMuted: boolean;

  readonly #sounds: Map<
    AudioPlaybackId,
    { sourceNodes: AudioBufferSourceNode[]; gainNodes: GainNode[] }
  > = new Map();

  readonly #muteUnmuteTimeConstant = 0.1;

  get audioContext(): AudioContext {
    return this.#audioContext;
  }

  get globalGainNode(): GainNode {
    return this.#globalGainNode;
  }

  constructor(assets: Assets, audioContext: AudioContext) {
    this.#assets = assets;
    this.#audioContext = audioContext;

    this.#isGloballyMuted = this.#loadStoredGlobalMuteUnmuteState();

    this.#globalGainNode = this.#audioContext.createGain();
    this.#globalGainNode.gain.value = this.#isGloballyMuted ? 0 : 1;
    this.#globalGainNode.connect(this.#audioContext.destination);
  }

  // In some browsers audio should start in result of user interaction (e.g. button click).
  // Since we cannot assure it for every game setup, let' expose a function which tries to
  // resume the AudioContext and call it on every user interaction detected by this framework.
  resumeAudioContextIfNeeded(): void {
    if (this.#audioContext.state === "suspended") {
      this.#audioContext.resume().catch((err) => {
        Logger.errorBeetPx(err);
      });
      // TODO: are we sure we want to unmute here? What if it was intentionally muted?
      this.#unmute();
    }
  }

  toggleMuteUnmute(): void {
    if (this.#isGloballyMuted) {
      this.#unmute();
    } else {
      this.#mute();
    }
  }

  #mute(): void {
    this.#storeGlobalMuteUnmuteState(true);
    this.#isGloballyMuted = true;
    this.#globalGainNode.gain.setTargetAtTime(
      0,
      this.#audioContext.currentTime,
      this.#muteUnmuteExponentialTimeConstant,
    );
  }

  #unmute(): void {
    this.#storeGlobalMuteUnmuteState(false);
    this.#isGloballyMuted = false;
    this.#globalGainNode.gain.setTargetAtTime(
      1,
      this.#audioContext.currentTime,
      this.#muteUnmuteExponentialTimeConstant,
    );
  }

  #loadStoredGlobalMuteUnmuteState(): boolean {
    return (
      window.localStorage.getItem(AudioApi.#storageMuteUnmuteKey) ===
      AudioApi.#storageMuteUnmuteTrue
    );
  }

  #storeGlobalMuteUnmuteState(muted: boolean): void {
    if (muted) {
      window.localStorage.setItem(
        AudioApi.#storageMuteUnmuteKey,
        AudioApi.#storageMuteUnmuteTrue,
      );
    } else {
      window.localStorage.removeItem(AudioApi.#storageMuteUnmuteKey);
    }
  }

  stopAllSounds(): void {
    for (const [
      playbackId,
      { sourceNodes, gainNodes },
    ] of this.#sounds.entries()) {
      this.#sounds.delete(playbackId);
      for (const gainNode of gainNodes) {
        gainNode.disconnect();
      }
      for (const sourceNode of sourceNodes) {
        sourceNode.addEventListener("ended", () => {
          sourceNode.disconnect();
        });
        sourceNode.stop();
      }
    }
  }

  playSoundOnce(soundUrl: SoundUrl): AudioPlaybackId {
    const playbackId = AudioApi.#nextPlaybackId++;

    const soundAsset = this.#assets.getSoundAsset(soundUrl);

    const sourceNode = this.#newSourceNode(soundAsset);
    this.#register(playbackId, sourceNode);

    sourceNode.connect(this.#globalGainNode);
    sourceNode.start();
    sourceNode.addEventListener("ended", () => {
      this.#unregister(playbackId);
      sourceNode.disconnect();
    });

    return playbackId;
  }

  playSoundLooped(
    soundUrl: SoundUrl,
    muteOnStart: boolean = false,
  ): AudioPlaybackId {
    const playbackId = AudioApi.#nextPlaybackId++;

    const soundAsset = this.#assets.getSoundAsset(soundUrl);

    const gainNode = this.#audioContext.createGain();
    gainNode.gain.value = muteOnStart ? 0 : 1;
    gainNode.connect(this.#globalGainNode);

    const sourceNode = this.#newSourceNode(soundAsset);
    this.#register(playbackId, sourceNode, gainNode);

    sourceNode.loop = true;
    sourceNode.connect(gainNode);
    sourceNode.start();

    return playbackId;
  }

  playSoundSequence(soundSequence: SoundSequence): AudioPlaybackId {
    const playbackId = AudioApi.#nextPlaybackId++;

    const intro = soundSequence.sequence ?? [];
    const loop = soundSequence.sequenceLooped ?? [];

    const playbackFns: Array<() => void> = Array.from({
      length: intro.length + loop.length,
    });

    for (let i = 0; i < intro.length; i++) {
      playbackFns[i] = () => {
        if (!this.#sounds.get(playbackId)) {
          return;
        }
        this.#playSoundSequenceEntry(playbackId, intro[i]!, () =>
          playbackFns[i + 1]!(),
        );
      };
    }

    const firstLoopedIndex = intro.length;
    for (let i = 0; i < loop.length; i++) {
      playbackFns[firstLoopedIndex + i] = () => {
        if (!this.#sounds.get(playbackId)) {
          return;
        }
        this.#playSoundSequenceEntry(
          playbackId,
          loop[i]!,
          i < loop.length - 1
            ? () => playbackFns[firstLoopedIndex + i + 1]!()
            : () => playbackFns[firstLoopedIndex]!(),
        );
      };
    }

    // one more fn just to make loops above simpler, since there is always something on index `i+1`
    playbackFns.push(Utils.noop);

    this.#sounds.set(playbackId, { sourceNodes: [], gainNodes: [] });
    playbackFns[0]?.();

    return playbackId;
  }

  #playSoundSequenceEntry(
    playbackId: AudioPlaybackId,
    entry: SoundSequenceEntry,
    onEntryEnded?: () => void,
  ): void {
    const [mainSound, ...additionalSounds] = entry;

    const mainSoundAsset = this.#assets.getSoundAsset(mainSound.url);
    const durationMs = mainSound.durationMs(
      mainSoundAsset.audioBuffer.duration * 1000,
    );

    const sourceNodes: AudioBufferSourceNode[] = [];

    const mainSourceNode = this.#newSourceNode(
      this.#assets.getSoundAsset(mainSound.url),
    );
    this.#register(playbackId, mainSourceNode);

    mainSourceNode.connect(this.#globalGainNode);
    if (onEntryEnded) {
      // TODO: this approach doesn't seem as the precise one… so far the audio output sounds OK and on time
      //       When needed, consider reworking it based on:
      //       - https://web.dev/audio-scheduling/
      //       - https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques
      mainSourceNode.addEventListener("ended", onEntryEnded);
    }
    sourceNodes.push(mainSourceNode);

    additionalSounds.forEach((sound) => {
      const sourceNode = this.#newSourceNode(
        this.#assets.getSoundAsset(sound.url),
      );
      this.#register(playbackId, sourceNode);

      sourceNode.connect(this.#globalGainNode);
      sourceNodes.push(sourceNode);
    });

    sourceNodes.forEach((sn) => {
      sn.start(0, 0, durationMs / 1000);
    });
  }

  #newSourceNode(soundAsset: SoundAsset): AudioBufferSourceNode {
    const sourceNode = this.#audioContext.createBufferSource();
    sourceNode.buffer = soundAsset.audioBuffer;
    return sourceNode;
  }

  // TODO: better API to make clear that only looped sounds can be muted individually?
  muteSound(playbackId: AudioPlaybackId): void {
    const nodes = this.#sounds.get(playbackId);
    if (nodes?.gainNodes) {
      for (const gainNode of nodes?.gainNodes) {
        gainNode.gain.setTargetAtTime(
          0,
          this.#audioContext.currentTime,
          this.#muteUnmuteTimeConstant,
        );
      }
    }
  }

  // TODO: better API to make clear that only looped sounds can be muted individually?
  unmuteSound(playbackId: AudioPlaybackId): void {
    const nodes = this.#sounds.get(playbackId);
    if (nodes?.gainNodes) {
      for (const gainNode of nodes?.gainNodes) {
        gainNode.gain.setTargetAtTime(
          1,
          this.#audioContext.currentTime,
          this.#muteUnmuteTimeConstant,
        );
      }
    }
  }

  #register(
    playbackId: AudioPlaybackId,
    sourceNode: AudioBufferSourceNode,
    gainNode?: GainNode,
  ) {
    const registeredNodes = this.#sounds.get(playbackId);
    if (registeredNodes) {
      registeredNodes.sourceNodes.push(sourceNode);
      if (gainNode) {
        registeredNodes.gainNodes.push(gainNode);
      }
    } else {
      this.#sounds.set(playbackId, {
        sourceNodes: [sourceNode],
        gainNodes: gainNode ? [gainNode] : [],
      });
    }
  }

  #unregister(playbackId: AudioPlaybackId) {
    this.#sounds.delete(playbackId);
  }
}
