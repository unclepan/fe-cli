import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import babel from '@rollup/plugin-babel' // tool-node 无需
import clear from 'rollup-plugin-clear'

const shareConfig = {
  input: 'src/index.ts',
  external: [
    /@babel\/runtime/,
  ], // tool-node 无需
  plugins: [
    clear({
      targets: ['dist', 'esm'],
    }),
    resolve(),
    commonjs(),
  ],
}

export default [
  {
    ...shareConfig,
    plugins: [
      ...shareConfig.plugins,
      typescript({
        outDir: 'esm',
      }),
      babel({
        babelHelpers: 'runtime',
        extensions: ['.ts']
      })
    ],
    output: [
      {
        dir: 'esm',
        format: 'esm',
        sourcemap: true,
        preserveModules: true,
        exports: 'auto',
      },
    ]
  },
  {
    ...shareConfig,
    plugins: [
      ...shareConfig.plugins,
      typescript({
        outDir: 'lib',
      }),
      babel({
        babelHelpers: 'runtime',
        extensions: ['.ts']
      })
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