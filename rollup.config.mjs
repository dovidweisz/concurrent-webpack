import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';

const packageJson = require('./package.json');

export default [
  // Main library build (CJS and ESM)
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main, // Will be 'dist/index.cjs'
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.module, // Will be 'dist/index.mjs'
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json', declaration: false }), // Declaration handled by separate dts build
    ],
    external: Object.keys(packageJson.dependencies || {}), // Externalize dependencies
  },
  // Type definitions build
  {
    input: 'src/index.ts',
    output: [{ file: packageJson.types, format: 'esm' }], // Will be 'dist/index.d.ts'
    plugins: [dts()],
  },
  // CLI binary build (CJS)
  {
    input: 'bin/run.ts',
    output: [
      {
        file: 'dist/bin/run.js', // Output path for the binary
        format: 'cjs',
        sourcemap: true,
        banner: '#!/usr/bin/env node', // Keep the shebang
      },
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json', declaration: false }),
    ],
    external: [
      ...Object.keys(packageJson.dependencies || {}),
      'node:fs/promises', // Explicitly externalize built-in node modules if used directly
      'node:path',
      'url',
      // Add any other node built-ins if directy imported and not resolved by plugins
    ],
  },
];
