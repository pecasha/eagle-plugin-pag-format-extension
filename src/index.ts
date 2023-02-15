import type { types } from "libpag";
import type { PAGFile } from "libpag/types/pag-file";
import type { PAGView } from "libpag/types/pag-view";

interface Options {
    canvas: HTMLCanvasElement;
    devicePixelRatio: number;
    resizeable: boolean;
    pag: types.PAG
}

export class Core {
    #options = {} as Options;

    #loaded = false;

    #pagFile = {} as PAGFile;
    #pagView = {} as PAGView;

    private get loaded() {
        return this.#loaded;
    }

    constructor(options: Options) {
        this.#options = Object.assign({
            canvas: void 0,
            devicePixelRatio: 3,
            resizeable: true,
            pag: void 0
        }, options);
    }

    public async loadFile(file: ArrayBuffer) {
        this.#pagFile = await this.#options.pag.PAGFile.load(file);
        this.#onResize();
        this.#pagView = (await this.#options.pag.PAGView.init(this.#pagFile, this.#options.canvas, {
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
        this.#pagFile = await this.#options.pag.PAGFile.load(file);
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
