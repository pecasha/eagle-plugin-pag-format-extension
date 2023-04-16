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
    light: ["#f8f9fb", "#e3e5e7", "#a0a1a4", "#323339"],
    lightgray: ["#e2e4e6", "#c6c8c9", "#8b8d8e", "#191d1e"],
    gray: ["#353639", "#2a2b2f", "#707173", "#d7d7d7"],
    dark: ["#242528", "#1d1e21", "#646567", "#d3d3d4"],
    "dark-blue": ["#343848", "#2a2d3b", "#70737e", "#d6d7da"],
    purple: ["#393547", "#2e2a3a", "#73707d", "#d7d7da"]
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
