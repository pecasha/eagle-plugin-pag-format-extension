const fs = require("fs");
const path = require("path");
const url = require("url");
const { Core } = require("../core/index.ts");

module.exports = async ({ src, dest, item }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const canvas = document.createElement("canvas");
            document.body.appendChild(canvas);

            const pag = await Core.from({
                locateFile: () => url.pathToFileURL(path.resolve(`${__dirname}/lib/pag.wasm`)).href
            });

            const file = await fs.promises.readFile(src);
            const pagFile = await pag.PAGFile.load(file.buffer);

            const width = pagFile.width();
            const height = pagFile.height();

            canvas.width = width;
            canvas.height = height;

            const pagView = await pag.PAGView.init(pagFile, canvas, {
                useScale: false
            });

            /*
            // 生成APNG动态预览图
            const frame = pagFile.duration() / 1000000 * 24;
            const buffers = [];
            for(let i=0; i<frame; i++) {
                pagView.setProgress(i / frame);
                await pagView.flush();
                const blob = await new Promise(resolve => canvas.toBlob(resolve));
                buffers.push(await blob.arrayBuffer());
            }

            const apngBlob = Core.apngAssembler(buffers, canvas.width, canvas.height);
            await fs.promises.writeFile(dest, Buffer.from(await apngBlob.arrayBuffer()));*/

            pagView.setProgress(.5); //TODO 将播放进度设置50%去截取预览图的方式有点不太合适
            await pagView.flush();
            const blob = await new Promise(resolve => canvas.toBlob(resolve));
            if(blob) {
                await fs.promises.writeFile(dest, Buffer.from(await blob.arrayBuffer()));
            }

            item.duration = Math.ceil(pagFile.duration() / 1000000);
            item.width = width;
            item.height = height;
            resolve(item);
        } catch (err) {
            reject(err);
        }
    });
}
