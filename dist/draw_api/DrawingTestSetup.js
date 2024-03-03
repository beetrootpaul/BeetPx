import { Assets } from "../assets/Assets";
import { CanvasForTests } from "../canvas/CanvasForTests";
import { rgb_white_ } from "../color/RgbColor";
import { BpxFontSaint11Minimal4 } from "../font/BpxFontSaint11Minimal4";
import { DrawApi } from "./DrawApi";
export function drawingTestSetup(canvasWidth, canvasHeight, canvasBgColor) {
    const canvas = new CanvasForTests(canvasWidth, canvasHeight, canvasBgColor);
    const assets = new Assets();
    const drawApi = new DrawApi({
        canvas,
        assets,
    });
    
    
    assets.addFontAsset(BpxFontSaint11Minimal4.id, {
        font: new BpxFontSaint11Minimal4(),
        spriteTextColor: rgb_white_,
    });
    return { canvas, assets, drawApi };
}
