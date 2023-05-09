const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const clear = require('rollup-plugin-clear');

const shareConfig = {
  input: 'src/index.ts',
  // tool-node 无需
  // external: [
  //   /@babel\/runtime/,
  // ],
  plugins: [
    clear({
      targets: ['dist', 'esm'],
    }),
    resolve(),
    commonjs(),
  ],
}

module.exports = [
  // {
  //   ...shareConfig,
  //   plugins: [
  //     ...shareConfig.plugins,
  //     typescript({
  //       outDir: 'esm',
  //     }),
  //     babel({
  //       babelHelpers: 'runtime',
  //       extensions: ['.ts']
  //     })
  //   ],
  //   output: [
  //     {
  //       dir: 'esm',
  //       format: 'esm',
  //       sourcemap: true,
  //       preserveModules: true,
  //       exports: 'auto',
  //     },
  //   ]
  // },
  {
    ...shareConfig,
    plugins: [
      ...shareConfig.plugins,
      typescript({
        outDir: 'dist',
      }),
    ],
    output: [
      {
        dir: 'dist',
        format: 'cjs',
        sourcemap: true,
        preserveModules: true,
        exports: 'auto',
        // tool-node 启用 generatedCode
        // generatedCode: {
        //   arrowFunctions: true,
        //   constBindings: true,
        //   objectShorthand: true,
        //   preset: 'es2015',
        // }
      },
    ]
  }
]