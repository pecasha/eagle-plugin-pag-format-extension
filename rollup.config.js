import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

const isProd = process.title.includes("--prod");

export default [
    {
        input: "src/core/index.ts",
        output: {
            file: "build/core.js",
            format: "cjs"
        },
        plugins: [
            resolve(),
            typescript({
                cacheRoot: "./node_modules/.cache/rollup-plugin-typescript2"
            }),
            commonjs(),
            terser({
                compress: {
                    drop_debugger: isProd
                }
            })
        ]
    }
];
