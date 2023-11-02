import {
    PAGInit,
    type types,
    type moduleOption
} from "libpag";
import type { PAGFile } from "libpag/types/pag-file";
import type { PAGView } from "libpag/types/pag-view";
// import { apngAssembler } from "apng-handler";
export { timestampToCountdown } from "@goodluck/util";

export interface Options {
    canvas: HTMLCanvasElement;
    devicePixelRatio: number;
    resizeable: boolean;
    wasmPath: string;
}

export const THEME_COLOR = {
    light: ["#f8f8f9", "#dfdfe0", "#888a95", "#2c2f32"],
    lightgray: ["#dddee1", "#c7c7ca", "#6e8086", "#2c2f32"],
    gray: ["#3b3c40", "#515255", "#94969c", "#f8f9fb"],
    dark: ["#1f2023", "#363739", "#767b8a", "#f8f9fb"],
    blue: ["#151d36", "#2c344b", "#40475d", "#f8f9fb"],
    purple: ["#231b2b", "#393240", "#7a748e", "#f8f9fb"]
}

export class Core {
    #options = {} as Options;

    #loaded = false;

    #pag = {} as types.PAG;
    #pagFile = {} as PAGFile;
    #pagView = {} as PAGView;
    #duration = 0;

    public get loaded() {
        return this.#loaded;
    }
    public get duration() {
        return this.#duration;
    }

    public get pagView() {
        return this.#pagView;
    }
    public get pagFile() {
        return this.#pagFile;
    }

    constructor(options: Options) {
        this.#options = Object.assign({
            canvas: void 0,
            devicePixelRatio: 3,
            resizeable: true
        }, options);
    }

    public static from(options: moduleOption) {
        return PAGInit(options);
    }

    /*public static apngAssembler(buffers: ArrayBuffer[], width: number, height: number) {
        return apngAssembler({
            buffers,
            width,
            height
        });
    }*/

    public async loadFile(file: ArrayBuffer) {
        this.#pag = await PAGInit({
            locateFile: () => this.#options.wasmPath
        });
        this.#pagFile = await this.#pag.PAGFile.load(file);
        this.#duration = this.#pagFile.duration();
        this.#onResize();
        this.#pagView = (await this.#pag.PAGView.init(this.#pagFile, this.#options.canvas, {
            useScale: false
        }))!;
        this.#pagView.setRepeatCount(0);
        await this.#pagView.play();
        if(this.#options.resizeable) {
            let resizeTimer = 0;
            window.addEventListener("resize", () => {
                if(resizeTimer) {
                    clearTimeout(resizeTimer);
                    resizeTimer = 0;
                }
                resizeTimer = window.setTimeout(this.#onResize, 300);
            }, false);
        }
        this.#loaded = true;
    }


    public async getFileSize(file: ArrayBuffer) {
        this.#pagFile.destroy();
        this.#pagFile = await this.#pag.PAGFile.load(file);
        return {
            width: this.#pagFile.width(),
            height: this.#pagFile.height()
        }
    }

    #onResize() {
        const style = window.getComputedStyle(this.#options.canvas, null);
        this.#options.canvas.width = Number(style.width.replace("px", "")) * this.#options.devicePixelRatio;
        this.#options.canvas.height = Number(style.height.replace("px", "")) * this.#options.devicePixelRatio;
        this.#pagView.updateSize?.();
        this.#pagView.flush?.();
    }
}
