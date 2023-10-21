var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _GamepadGameInput_axisThreshold, _GamepadGameInput_axisMapping, _GamepadGameInput_dualSenseDpadValueRanges, _GamepadGameInput_gamepads;
import { GamepadTypeDetector } from "./GamepadTypeDetector";
// TODO: move those docs to specialized files per gamepad x browser x OS ?
/* Xbox

env:
  macOS Ventura 13.5.2 (Apple M1 Max), Firefox 118.0.2 (64-bit)
gamepad:
  "45e-2fd-Xbox Wireless Controller"
buttons:
  - A -> 1
  - B -> 2
  - X -> 3
  - Y -> 5
  - LB -> 5
  - RB -> 8
  - LT -> -
  - RT -> -
  - dpad up    -> 12
  - dpad down  -> 13
  - dpad left  -> 14
  - dpad right -> 15
  - Xbox logo                    ->  0
  - "two windows" (center left ) ->  8
  - menu          (center right) -> 16
  - left  stick pressed -> 11
  - right stick pressed -> 16
 axes and their ranges:
  - left  stick, horizontal -> 0 (left -1.00 : 1.00 right)
  - left  stick, vertical   -> 1 (  up -1.00 : 1.00 down )
  - right stick, horizontal -> 2 (left -1.00 : 1.00 right)
  - right stick, vertical   -> 3 (  up -1.00 : 1.00 down )


env:
  macOS Ventura 13.5.2 (Apple M1 Max), Safari 16.6 (18615.3.12.11.2)
gamepad:
  "Xbox Wireless Controller Extended Gamepad"
buttons:
  - A -> 0
  - B -> 1
  - X -> 2
  - Y -> 3
  - LB -> 4
  - RB -> 5
  - LT -> 6
  - RT -> 7
  - dpad up    -> 12
  - dpad down  -> 13
  - dpad left  -> 14
  - dpad right -> 15
  - Xbox logo                    -> 16
  - "two windows" (center left ) ->  8
  - menu          (center right) ->  9
  - left  stick pressed -> 10
  - right stick pressed -> 11
 axes and their ranges:
  - left  stick, horizontal -> 0 (left -1.00 : 1.00 right)
  - left  stick, vertical   -> 1 (  up -1.00 : 1.00 down )
  - right stick, horizontal -> 2 (left -1.00 : 1.00 right)
  - right stick, vertical   -> 3 (  up -1.00 : 1.00 down )


env:
  macOS Ventura 13.5.2 (Apple M1 Max), Arc 1.13.1 (42579), Chromium Engine Version 118.0.5993.88
  macOS Ventura 13.5.2 (Apple M1 Max), Brave 1.59.122 Chromium: 118.0.5993.96 (Official Build) (arm64)
  macOS Ventura 13.5.2 (Apple M1 Max), Chrome 118.0.5993.88 (Official Build) (arm64)
  macOS Ventura 13.5.2 (Apple M1 Max), Edge 118.0.2088.61 (Official build) (arm64)
  macOS Ventura 13.5.2 (Apple M1 Max), Opera One (version: 103.0.4928.34) (arm64)
  macOS Ventura 13.5.2 (Apple M1 Max), Vivaldi 6.2.3105.58 (Stable channel) (arm64)
gamepad:
  "Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 02fd)"
buttons:
  - A -> 0
  - B -> 1
  - X -> 2
  - Y -> 3
  - LB -> 4
  - RB -> 5
  - LT -> 6 ("touched: true" if half-pressed)
  - RT -> 7 ("touched: true" if half-pressed)
  - dpad up    -> 12
  - dpad down  -> 13
  - dpad left  -> 14
  - dpad right -> 15
  - Xbox logo                    -> 16
  - "two windows" (center left ) ->  8
  - menu          (center right) ->  9
  - left  stick pressed -> 10
  - right stick pressed -> 11
 axes and their ranges:
  - left  stick, horizontal -> 0 (left -1.00 : 1.00 right)
  - left  stick, vertical   -> 1 (  up -1.00 : 1.00 down )
  - right stick, horizontal -> 2 (left -1.00 : 1.00 right)
  - right stick, vertical   -> 3 (  up -1.00 : 1.00 down )
*/
/* DualSense

env:
  macOS Ventura 13.5.2 (Apple M1 Max), Firefox 118.0.2 (64-bit)
gamepad:
  "54c-ce6-DualSense Wireless Controller"
buttons:
  - x        -> 1
  - circle   -> 2
  - square   -> 0
  - triangle -> 3
  - L1 -> 4
  - R1 -> 5
  - L2 -> 6
  - R2 -> 7
  - dpad up    -> -
  - dpad down  -> -
  - dpad left  -> -
  - dpad right -> -
  - touch panel press -> 13
  - PS logo                      -> 12
  - microphone                   ->  -
  - "three lines" (center left ) ->  8
  - menu          (center right) ->  9
  - left  stick pressed -> 10
  - right stick pressed -> 11
 axes and their ranges:
  - left  stick, horizontal -> 0 (left -1.00 : 1.00 right)
  - left  stick, vertical   -> 1 (  up -1.00 : 1.00 down )
  - right stick, horizontal -> 2 (left -1.00 : 1.00 right)
  - right stick, vertical   -> 3 (  up -1.00 : 1.00 down )
  - L2                      -> 5 (idle -1.00 : 1.00 pushed)
  - R2                      -> 6 (idle -1.00 : 1.00 pushed)
  - dpad -> 4 (from -1.00 +2/7 for each 1/8 turn clockwise:
                 up         -1.00
                 up-right   -0.71
                 right      -0.43
                 down-right -0.14
                 down        0.14
                 down-left   0.43
                 left        0.71
                 up-left     1.00
                 idle        1.29
              )


env:
  macOS Ventura 13.5.2 (Apple M1 Max), Safari 16.6 (18615.3.12.11.2)
gamepad:
  "54c-ce6-DualSense Wireless Controller"
buttons:
  - x        -> 0
  - circle   -> 1
  - square   -> 2
  - triangle -> 3
  - L1 -> 4
  - R1 -> 5
  - L2 -> 6
  - R2 -> 7
  - dpad up    -> 12
  - dpad down  -> 13
  - dpad left  -> 14
  - dpad right -> 15
  - touch panel press -> -
  - PS logo                      -> 16
  - microphone                   ->  -
  - "three lines" (center left ) ->  8
  - menu          (center right) ->  9
  - left  stick pressed -> 10
  - right stick pressed -> 11
 axes and their ranges:
  - left  stick, horizontal -> 0 (left -1.00 : 1.00 right)
  - left  stick, vertical   -> 1 (  up -1.00 : 1.00 down )
  - right stick, horizontal -> 2 (left -1.00 : 1.00 right)
  - right stick, vertical   -> 3 (  up -1.00 : 1.00 down )
  - L2                      -> -
  - R2                      -> -
  - dpad -> -


env:
  macOS Ventura 13.5.2 (Apple M1 Max), Arc 1.13.1 (42579), Chromium Engine Version 118.0.5993.88
  macOS Ventura 13.5.2 (Apple M1 Max), Brave 1.59.122 Chromium: 118.0.5993.96 (Official Build) (arm64)
  macOS Ventura 13.5.2 (Apple M1 Max), Chrome 118.0.5993.88 (Official Build) (arm64)
  macOS Ventura 13.5.2 (Apple M1 Max), Edge 118.0.2088.61 (Official build) (arm64)
  macOS Ventura 13.5.2 (Apple M1 Max), Opera One (version: 103.0.4928.34) (arm64)
  macOS Ventura 13.5.2 (Apple M1 Max), Vivaldi 6.2.3105.58 (Stable channel) (arm64)
gamepad:
  "DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)"
buttons:
  - x        -> 0
  - circle   -> 1
  - square   -> 2
  - triangle -> 3
  - L1 -> 4
  - R1 -> 5
  - L2 -> 6 ("touched: true" if half-pressed)
  - R2 -> 7 ("touched: true" if half-pressed)
  - dpad up    -> 12
  - dpad down  -> 13
  - dpad left  -> 14
  - dpad right -> 15
  - touch panel press -> 17
  - PS logo                      -> 16
  - microphone                   ->  -
  - "three lines" (center left ) ->  8
  - menu          (center right) ->  9
  - left  stick pressed -> 10
  - right stick pressed -> 11
 axes and their ranges:
  - left  stick, horizontal -> 0 (left -1.00 : 1.00 right)
  - left  stick, vertical   -> 1 (  up -1.00 : 1.00 down )
  - right stick, horizontal -> 2 (left -1.00 : 1.00 right)
  - right stick, vertical   -> 3 (  up -1.00 : 1.00 down )
  - L2                      -> -
  - R2                      -> -
  - dpad -> -
 */
// Constants for DualSense calculations. Not inside the class for sake of access brevity.
const ds = {
    dpadAxisIndex: 4,
    dpadStep: 2 / 7,
    dpadRangeThreshold: 0.25 * (2 / 7),
};
export class GamepadGameInput {
    constructor() {
        this.inputMethod = "gamepad";
        this.buttonMapping = new Map([
            [0, "button_a"],
            [1, "button_a"],
            [2, "button_b"],
            [3, "button_b"],
            [5, "button_a"],
            [8, "button_menu"],
            [9, "button_menu"],
            [12, "button_up"],
            [13, "button_down"],
            [14, "button_left"],
            [15, "button_right"],
            [16, "button_menu"],
        ]);
        _GamepadGameInput_axisThreshold.set(this, 0.6);
        _GamepadGameInput_axisMapping.set(this, new Map([
            // keys here are: 100 * axis index + sign(axis value)
            [0 - 1, "button_left"],
            [0 + 1, "button_right"],
            [100 - 1, "button_up"],
            [100 + 1, "button_down"],
            [200 - 1, "button_left"],
            [200 + 1, "button_right"],
            [300 - 1, "button_up"],
            [300 + 1, "button_down"],
        ]));
        // [min, max, event]
        _GamepadGameInput_dualSenseDpadValueRanges.set(this, [
            [-1, -1 + 2 / 7, "button_up"],
            [-1 + 2 / 7, -1 + 3 * (2 / 7), "button_right"],
            [-1 + 3 * (2 / 7), -1 + 5 * (2 / 7), "button_down"],
            [-1 + 5 * (2 / 7), -1 + 7 * (2 / 7), "button_left"],
            [-1 + 7 * (2 / 7), -1 + 7 * (2 / 7), "button_up"],
        ]);
        _GamepadGameInput_gamepads.set(this, new Map());
    }
    startListening() {
        window.addEventListener("gamepadconnected", (gamepadEvent) => {
            __classPrivateFieldGet(this, _GamepadGameInput_gamepads, "f").set(gamepadEvent.gamepad.index, gamepadEvent.gamepad);
        });
        window.addEventListener("gamepaddisconnected", (gamepadEvent) => {
            __classPrivateFieldGet(this, _GamepadGameInput_gamepads, "f").delete(gamepadEvent.gamepad.index);
        });
    }
    update(eventsCollector) {
        let wasAnyEventDetected = false;
        navigator.getGamepads().forEach((gamepad) => {
            if (gamepad) {
                gamepad.buttons.forEach((button, buttonIndex) => {
                    if (button.pressed || button.touched) {
                        const gameInputEvent = this.buttonMapping.get(buttonIndex);
                        if (gameInputEvent) {
                            eventsCollector.add(gameInputEvent);
                            wasAnyEventDetected = true;
                        }
                    }
                });
                gamepad.axes.forEach((axis, axisIndex) => {
                    if (axisIndex === ds.dpadAxisIndex) {
                        __classPrivateFieldGet(this, _GamepadGameInput_dualSenseDpadValueRanges, "f").forEach(([min, max, gameInputEvent]) => {
                            if (axis > min - ds.dpadRangeThreshold &&
                                axis < max + ds.dpadRangeThreshold) {
                                eventsCollector.add(gameInputEvent);
                                wasAnyEventDetected = true;
                            }
                        });
                    }
                    else {
                        if (Math.abs(axis) > __classPrivateFieldGet(this, _GamepadGameInput_axisThreshold, "f")) {
                            const gameInputEvent = __classPrivateFieldGet(this, _GamepadGameInput_axisMapping, "f").get(100 * axisIndex + Math.sign(axis));
                            if (gameInputEvent) {
                                eventsCollector.add(gameInputEvent);
                                wasAnyEventDetected = true;
                            }
                        }
                    }
                });
            }
        });
        return wasAnyEventDetected;
    }
    connectedGamepadTypes() {
        const types = new Set();
        for (const gamepad of __classPrivateFieldGet(this, _GamepadGameInput_gamepads, "f").values()) {
            types.add(GamepadTypeDetector.detect(gamepad));
        }
        return types;
    }
}
_GamepadGameInput_axisThreshold = new WeakMap(), _GamepadGameInput_axisMapping = new WeakMap(), _GamepadGameInput_dualSenseDpadValueRanges = new WeakMap(), _GamepadGameInput_gamepads = new WeakMap();
