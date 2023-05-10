import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import clear from 'rollup-plugin-clear';
import { readFile } from 'fs/promises';

// (!) Circular dependencies 问题
const onwarn = warning => {
  // Silence circular dependency warning for moment package
  if (
    warning.code === 'CIRCULAR_DEPENDENCY'
    // && !warning?.importer?.indexOf(path.normalize('node_modules/moment/src/lib/'))
  ) {
    return
  }
  console.warn(`(!) ${warning.message}`)
}

const pkg = JSON.parse(
  await readFile(
    new URL('./package.json', import.meta.url)
  )
);

const shareConfig = {
  // 入口文件，src/index.ts 
  input: 'src/index.ts',
  onwarn,
  // node 无需
  // external: [
  //   /@babel\/runtime/,
  // ],
  plugins: [
    clear({
      targets: ['dist', 'esm'],
    }),
    // 识别 commonjs 模式第三方依赖 
    commonjs(),
    // 解析第三方依赖 
    resolve({
      preferBuiltins: true
    }),
  ],
}

export default [
  {
    ...shareConfig,
    plugins: [
      ...shareConfig.plugins,
      typescript({
        outDir: 'dist',
      }),
    ],
    // 输出文件 
    output: [
      // commonjs 
      {
        banner: '#!/usr/bin/env node',
        file: pkg.main,  
        format: 'cjs',
        sourcemap: true,
      },
      // es module 
      // { 
      //   // package.json 配置的 module 属性 
      //   file: pkg.module, 
      //   format: 'es', 
      // }, 
      // umd 
      // { 
      //     // umd 导出文件的全局变量 
      //     name: 'RollupTsTemplate', 
      //     // package.json 配置的 umd 属性 
      //     file: pkg.umd, 
      //     format: 'umd' 
      // }
    ]
  }
]