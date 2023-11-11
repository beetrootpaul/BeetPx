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
var _BpxFillPattern_bits;


export class BpxFillPattern {
    
    static of(bits) {
        return new BpxFillPattern(bits);
    }
    
    constructor(bits) {
        _BpxFillPattern_bits.set(this, void 0);
        __classPrivateFieldSet(this, _BpxFillPattern_bits, bits, "f");
    }
    hasPrimaryColorAt(x, y) {
        const patternX = x % 4;
        const patternY = y % 4;
        const bitPosition = 4 * 4 - (patternY * 4 + patternX) - 1;
        const isSecondary = Boolean(__classPrivateFieldGet(this, _BpxFillPattern_bits, "f") & (1 << bitPosition));
        return !isSecondary;
    }
}
_BpxFillPattern_bits = new WeakMap();
BpxFillPattern.primaryOnly = new BpxFillPattern(0);
BpxFillPattern.secondaryOnly = new BpxFillPattern(65535);
