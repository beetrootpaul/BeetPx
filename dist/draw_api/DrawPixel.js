"use strict";
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
var _DrawPixel_instances, _DrawPixel_canvasBytes, _DrawPixel_canvasSize, _DrawPixel_drawSolid;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrawPixel = void 0;
const Color_1 = require("../Color");
const Vector2d_1 = require("../Vector2d");
class DrawPixel {
    constructor(canvasBytes, canvasSize) {
        _DrawPixel_instances.add(this);
        _DrawPixel_canvasBytes.set(this, void 0);
        _DrawPixel_canvasSize.set(this, void 0);
        __classPrivateFieldSet(this, _DrawPixel_canvasBytes, canvasBytes, "f");
        __classPrivateFieldSet(this, _DrawPixel_canvasSize, canvasSize, "f");
    }
    // TODO: consolidate where composite color and fill patterns are handled (look for `instanceof`). Consider renaming fill pattern to e.g. pattern color as well
    // TODO: tests for MappingColor
    // TODO: consider moving fill pattern and composite color support inside here
    // TODO: cover ClippingRegion with tests
    draw(xy, color, clippingRegion = null) {
        xy = xy.round();
        if (clippingRegion && !clippingRegion.allowsDrawingAt(xy)) {
            return;
        }
        if (xy.gte(Vector2d_1.Vector2d.zero) && xy.lt(__classPrivateFieldGet(this, _DrawPixel_canvasSize, "f"))) {
            const i = 4 * (xy.y * __classPrivateFieldGet(this, _DrawPixel_canvasSize, "f").x + xy.x);
            if (color instanceof Color_1.CompositeColor) {
                __classPrivateFieldGet(this, _DrawPixel_instances, "m", _DrawPixel_drawSolid).call(this, i, color.primary);
            }
            else if (color instanceof Color_1.MappingColor) {
                __classPrivateFieldGet(this, _DrawPixel_instances, "m", _DrawPixel_drawSolid).call(this, i, color.getMappedColorFor(__classPrivateFieldGet(this, _DrawPixel_canvasBytes, "f")[i], __classPrivateFieldGet(this, _DrawPixel_canvasBytes, "f")[i + 1], __classPrivateFieldGet(this, _DrawPixel_canvasBytes, "f")[i + 2], __classPrivateFieldGet(this, _DrawPixel_canvasBytes, "f")[i + 3]));
            }
            else {
                __classPrivateFieldGet(this, _DrawPixel_instances, "m", _DrawPixel_drawSolid).call(this, i, color);
            }
        }
    }
}
exports.DrawPixel = DrawPixel;
_DrawPixel_canvasBytes = new WeakMap(), _DrawPixel_canvasSize = new WeakMap(), _DrawPixel_instances = new WeakSet(), _DrawPixel_drawSolid = function _DrawPixel_drawSolid(canvasIndex, color) {
    if (color instanceof Color_1.TransparentColor) {
        return;
    }
    __classPrivateFieldGet(this, _DrawPixel_canvasBytes, "f")[canvasIndex] = color.r;
    __classPrivateFieldGet(this, _DrawPixel_canvasBytes, "f")[canvasIndex + 1] = color.g;
    __classPrivateFieldGet(this, _DrawPixel_canvasBytes, "f")[canvasIndex + 2] = color.b;
    __classPrivateFieldGet(this, _DrawPixel_canvasBytes, "f")[canvasIndex + 3] = 0xff;
};
