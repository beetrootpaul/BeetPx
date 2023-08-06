import { Assets, AssetsToLoad } from "./Assets";
import { AudioApi } from "./audio/AudioApi";
import { DrawApi } from "./draw_api/DrawApi";
import { Framework, type FrameworkOptions } from "./Framework";
import { StorageApi } from "./StorageApi";
export declare class BeetPx {
    #private;
    static init(frameworkOptions: FrameworkOptions, assetsToLoad: AssetsToLoad): ReturnType<Framework["loadAssets"]>;
    static get frameNumber(): Framework["frameNumber"];
    static get averageFps(): Framework["averageFps"];
    static get continuousInputEvents(): Framework["continuousInputEvents"];
    static get fireOnceInputEvents(): Framework["fireOnceInputEvents"];
    static get audioContext(): AudioApi["audioContext"];
    static get globalGainNode(): AudioApi["globalGainNode"];
    static get debug(): Framework["debug"];
    static setOnUpdate: Framework["setOnUpdate"];
    static setOnDraw: Framework["setOnDraw"];
    static setCameraOffset: DrawApi["setCameraOffset"];
    static setClippingRegion: DrawApi["setClippingRegion"];
    static setFillPattern: DrawApi["setFillPattern"];
    static mapSpriteColors: DrawApi["mapSpriteColors"];
    static getMappedSpriteColor: DrawApi["getMappedSpriteColor"];
    static setFont: DrawApi["setFont"];
    static getFont: DrawApi["getFont"];
    static clearCanvas: DrawApi["clearCanvas"];
    static pixel: DrawApi["pixel"];
    static line: DrawApi["line"];
    static rect: DrawApi["rect"];
    static rectFilled: DrawApi["rectFilled"];
    static ellipse: DrawApi["ellipse"];
    static ellipseFilled: DrawApi["ellipseFilled"];
    static sprite: DrawApi["sprite"];
    static print: DrawApi["print"];
    static toggleMuteUnmute: AudioApi["toggleMuteUnmute"];
    static playSoundOnce: AudioApi["playSoundOnce"];
    static playSoundLooped: AudioApi["playSoundLooped"];
    static muteSound: AudioApi["muteSound"];
    static unmuteSound: AudioApi["unmuteSound"];
    static store: StorageApi["store"];
    static load: StorageApi["load"];
    static clearStorage: StorageApi["clearStorage"];
    static getImageAsset: Assets["getImageAsset"];
    static getFontAsset: Assets["getFontAsset"];
    static getSoundAsset: Assets["getSoundAsset"];
}
