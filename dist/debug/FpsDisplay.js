var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _FpsDisplay_drawApi, _FpsDisplay_color, _FpsDisplay_xy;
import { font_saint11Minimal4_, rgb_p8_, v_ } from "../shorthands";
export class FpsDisplay {
    constructor(drawApi, params) {
        _FpsDisplay_drawApi.set(this, void 0);
        _FpsDisplay_color.set(this, void 0);
        _FpsDisplay_xy.set(this, void 0);
        __classPrivateFieldSet(this, _FpsDisplay_drawApi, drawApi, "f");
        __classPrivateFieldSet(this, _FpsDisplay_color, params.color ?? rgb_p8_.orange, "f");
        const placement = params.placement ?? "top-right";
        __classPrivateFieldSet(this, _FpsDisplay_xy, v_(placement.endsWith("-left") ? 1 : 128 - 3 * 4, placement.startsWith("top-") ? 1 : 128 - 5), "f");
    }
    drawRenderingFps(renderingFps) {
        const prevFont = __classPrivateFieldGet(this, _FpsDisplay_drawApi, "f").useFont(font_saint11Minimal4_);
        __classPrivateFieldGet(this, _FpsDisplay_drawApi, "f").drawText(renderingFps.toFixed(), __classPrivateFieldGet(this, _FpsDisplay_xy, "f"), __classPrivateFieldGet(this, _FpsDisplay_color, "f"));
        __classPrivateFieldGet(this, _FpsDisplay_drawApi, "f").useFont(prevFont);
    }
}
_FpsDisplay_drawApi = new WeakMap(), _FpsDisplay_color = new WeakMap(), _FpsDisplay_xy = new WeakMap();
