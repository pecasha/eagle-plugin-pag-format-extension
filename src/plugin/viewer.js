const fs = require("fs");
const path = require("path");
const {
    Core,
    THEME_COLOR,
    timestampToCountdown
} = require("../core/index.ts");

const urlParams = new URLSearchParams(window.location.search);
const filePath = urlParams.get("path");
const theme = urlParams.get("theme");

(async function() {
    const $durationTotal = document.querySelector(".duration-total");
    const $durationCurrent = document.querySelector(".duration-current");
    const $cursor = document.querySelector(".cursor");
    const $btn = document.querySelector(".progress > i");

    document.documentElement.style.setProperty("--theme-bg-color", THEME_COLOR[theme][0]);
    document.documentElement.style.setProperty("--theme-bd-color", THEME_COLOR[theme][1]);
    document.documentElement.style.setProperty("--theme-ct-color", THEME_COLOR[theme][2]);
    document.documentElement.style.setProperty("--theme-ft-color", THEME_COLOR[theme][3]);

    const pag = new Core({
        wasmPath: require("url").pathToFileURL(require("path").resolve(`${__dirname}/lib/pag.wasm`)).href,
        canvas: document.querySelector("#pag"),
        devicePixelRatio: window.devicePixelRatio,
    });

    try {
        const file = await fs.promises.readFile(filePath);
        await pag.loadFile(file.buffer);
        const duration = pag.duration / 1000;
        $durationTotal.innerHTML = timestampToCountdown(duration, "mm:ss");
        pag.pagView.addListener("onAnimationUpdate", pagView => {
            const progress = pagView.getProgress();
            $cursor.style.left = `${progress * 100}%`;
            $durationCurrent.innerHTML = timestampToCountdown(duration * progress, "mm:ss");
        });
        $btn.addEventListener("click", () => {
            if($btn.classList.contains("icon-pause")) {
                pag.pagView.pause();
                $btn.classList.remove("icon-pause");
                $btn.classList.add("icon-play");
            } else {
                pag.pagView.play();
                $btn.classList.remove("icon-play");
                $btn.classList.add("icon-pause");
            }
        });
    } catch (err) {
        console.error(err);
        const message = err.message || err || "未知错误";
        alert(`PAG格式扩展插件错误: ${message}`);
        /*eagle.log.error(`PAG格式扩展插件错误: ${message}`);
        eagle.notification.show({
            title: "错误",
            description: message,
        });*/
    }
})();
