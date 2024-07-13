var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _BpxTimer_instances, _BpxTimer_frames, _BpxTimer_loop, _BpxTimer_pausedWithGame, _BpxTimer_pausedDirectly, _BpxTimer_offsetFrame, _BpxTimer_pausedFrame, _BpxTimer_tRaw_get, _BpxTimer_pauseDueToGamePause, _BpxTimer_resumeDueToGameResume;
import { BeetPx } from "../BeetPx";
import { clamp } from "../utils/clamp";
import { mod } from "../utils/mod";
export class BpxTimer {
    static for(opts) {
        return new BpxTimer(opts);
    }
    constructor(opts) {
        _BpxTimer_instances.add(this);
        _BpxTimer_frames.set(this, void 0);
        _BpxTimer_loop.set(this, void 0);
        _BpxTimer_pausedWithGame.set(this, void 0);
        _BpxTimer_pausedDirectly.set(this, void 0);
        _BpxTimer_offsetFrame.set(this, void 0);
        _BpxTimer_pausedFrame.set(this, void 0);
        if (!opts.ignoreGamePause) {
            const withInternals = this;
            withInternals.__internal__pauseDueToGamePause =
                __classPrivateFieldGet(withInternals, _BpxTimer_instances, "m", _BpxTimer_pauseDueToGamePause).bind(withInternals);
            withInternals.__internal__resumeDueToGameResume =
                __classPrivateFieldGet(withInternals, _BpxTimer_instances, "m", _BpxTimer_resumeDueToGameResume).bind(withInternals);
            BpxTimer.timersControlledByGamePause.push(new WeakRef(withInternals));
        }
        __classPrivateFieldSet(this, _BpxTimer_frames, Math.max(0, Math.round(opts.frames)), "f");
        __classPrivateFieldSet(this, _BpxTimer_loop, opts.loop, "f");
        __classPrivateFieldSet(this, _BpxTimer_offsetFrame, BeetPx.frameNumber + opts.delayFrames, "f");
        __classPrivateFieldSet(this, _BpxTimer_pausedWithGame, false, "f");
        __classPrivateFieldSet(this, _BpxTimer_pausedDirectly, false, "f");
        __classPrivateFieldSet(this, _BpxTimer_pausedFrame, null, "f");
        if (opts.pause) {
            this.pause();
        }
    }
    get t() {
        return (__classPrivateFieldGet(this, _BpxTimer_loop, "f") ?
            __classPrivateFieldGet(this, _BpxTimer_instances, "a", _BpxTimer_tRaw_get) >= 0 ?
                mod(__classPrivateFieldGet(this, _BpxTimer_instances, "a", _BpxTimer_tRaw_get), __classPrivateFieldGet(this, _BpxTimer_frames, "f"))
                : 0
            : clamp(0, __classPrivateFieldGet(this, _BpxTimer_instances, "a", _BpxTimer_tRaw_get), __classPrivateFieldGet(this, _BpxTimer_frames, "f")));
    }
    get framesLeft() {
        return __classPrivateFieldGet(this, _BpxTimer_frames, "f") - this.t;
    }
    get progress() {
        return __classPrivateFieldGet(this, _BpxTimer_frames, "f") > 0 ? this.t / __classPrivateFieldGet(this, _BpxTimer_frames, "f") : 1;
    }
    get hasFinished() {
        return __classPrivateFieldGet(this, _BpxTimer_instances, "a", _BpxTimer_tRaw_get) >= __classPrivateFieldGet(this, _BpxTimer_frames, "f");
    }
    get hasJustFinished() {
        return (__classPrivateFieldGet(this, _BpxTimer_frames, "f") > 0 ?
            __classPrivateFieldGet(this, _BpxTimer_loop, "f") ?
                __classPrivateFieldGet(this, _BpxTimer_instances, "a", _BpxTimer_tRaw_get) > 0 && this.t === 0
                : __classPrivateFieldGet(this, _BpxTimer_instances, "a", _BpxTimer_tRaw_get) === __classPrivateFieldGet(this, _BpxTimer_frames, "f")
            : __classPrivateFieldGet(this, _BpxTimer_loop, "f") ? true
                : __classPrivateFieldGet(this, _BpxTimer_instances, "a", _BpxTimer_tRaw_get) === 0);
    }
    pause() {
        if (__classPrivateFieldGet(this, _BpxTimer_pausedDirectly, "f")) {
            return;
        }
        __classPrivateFieldSet(this, _BpxTimer_pausedDirectly, true, "f");
        if (__classPrivateFieldGet(this, _BpxTimer_pausedWithGame, "f")) {
            return;
        }
        __classPrivateFieldSet(this, _BpxTimer_pausedFrame, BeetPx.frameNumber, "f");
    }
    resume() {
        if (!__classPrivateFieldGet(this, _BpxTimer_pausedDirectly, "f")) {
            return;
        }
        __classPrivateFieldSet(this, _BpxTimer_pausedDirectly, false, "f");
        if (__classPrivateFieldGet(this, _BpxTimer_pausedWithGame, "f")) {
            return;
        }
        __classPrivateFieldSet(this, _BpxTimer_offsetFrame, __classPrivateFieldGet(this, _BpxTimer_offsetFrame, "f") + (BeetPx.frameNumber - (__classPrivateFieldGet(this, _BpxTimer_pausedFrame, "f") ?? 0)), "f");
        __classPrivateFieldSet(this, _BpxTimer_pausedFrame, null, "f");
    }
    restart() {
        __classPrivateFieldSet(this, _BpxTimer_offsetFrame, BeetPx.frameNumber, "f");
        __classPrivateFieldSet(this, _BpxTimer_pausedFrame, null, "f");
        __classPrivateFieldSet(this, _BpxTimer_pausedDirectly, false, "f");
        __classPrivateFieldSet(this, _BpxTimer_pausedWithGame, false, "f");
    }
}
_BpxTimer_frames = new WeakMap(), _BpxTimer_loop = new WeakMap(), _BpxTimer_pausedWithGame = new WeakMap(), _BpxTimer_pausedDirectly = new WeakMap(), _BpxTimer_offsetFrame = new WeakMap(), _BpxTimer_pausedFrame = new WeakMap(), _BpxTimer_instances = new WeakSet(), _BpxTimer_tRaw_get = function _BpxTimer_tRaw_get() {
    return (__classPrivateFieldGet(this, _BpxTimer_pausedFrame, "f") ?? BeetPx.frameNumber) - __classPrivateFieldGet(this, _BpxTimer_offsetFrame, "f");
}, _BpxTimer_pauseDueToGamePause = function _BpxTimer_pauseDueToGamePause() {
    if (__classPrivateFieldGet(this, _BpxTimer_pausedWithGame, "f")) {
        return;
    }
    __classPrivateFieldSet(this, _BpxTimer_pausedWithGame, true, "f");
    if (__classPrivateFieldGet(this, _BpxTimer_pausedDirectly, "f")) {
        return;
    }
    __classPrivateFieldSet(this, _BpxTimer_pausedFrame, BeetPx.frameNumber, "f");
}, _BpxTimer_resumeDueToGameResume = function _BpxTimer_resumeDueToGameResume() {
    if (!__classPrivateFieldGet(this, _BpxTimer_pausedWithGame, "f")) {
        return;
    }
    __classPrivateFieldSet(this, _BpxTimer_pausedWithGame, false, "f");
    if (__classPrivateFieldGet(this, _BpxTimer_pausedDirectly, "f")) {
        return;
    }
    __classPrivateFieldSet(this, _BpxTimer_offsetFrame, __classPrivateFieldGet(this, _BpxTimer_offsetFrame, "f") + (BeetPx.frameNumber - (__classPrivateFieldGet(this, _BpxTimer_pausedFrame, "f") ?? 0)), "f");
    __classPrivateFieldSet(this, _BpxTimer_pausedFrame, null, "f");
};
BpxTimer.timersControlledByGamePause = [];
