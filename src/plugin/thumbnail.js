const fs = require("fs");
const { Core } = require("../core/index.ts");

module.exports = async ({ src, dest, item }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const canvas = document.createElement("canvas");
            document.body.appendChild(canvas);

            const pag = await Core.from({
                locateFile: () => require("url").pathToFileURL(require("path").resolve(`${__dirname}/lib/pag.wasm`)).href
            });

            const file = await fs.promises.readFile(src);
            const pagFile = await pag.PAGFile.load(file.buffer);

            canvas.width = pagFile.width();
            canvas.height = pagFile.height();

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

            item.width = canvas.width;
            item.height = canvas.height;
            resolve(item);
        } catch (err) {
            reject(err);
        }
    });
}
