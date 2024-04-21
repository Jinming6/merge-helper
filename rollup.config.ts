import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import replace from '@rollup/plugin-replace';
import dotenv from 'dotenv';

dotenv.config();

const pkgPath = fileURLToPath(new URL('./package.json', import.meta.url));
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
const replaceName = (name: string): string => {
  const arr = name.split('-').map((item, index) => {
    if (index === 0) {
      return item;
    }
    return item[0].toUpperCase() + item.slice(1);
  });
  return arr.join('');
};
const name = replaceName(pkg.name as string); // 生成的umd的name

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/mergeHelper.js',
      format: 'umd',
      name,
      globals: {
        lodashEs: '_',
      },
    },
    {
      file: 'dist/mergeHelper.min.js',
      format: 'umd',
      name,
      plugins: [terser()],
      globals: {
        lodashEs: '_',
      },
    },
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
    }),
    nodeResolve(),
    replace({
      'process.env.PACKAGE_NAME': JSON.stringify(process.env.PACKAGE_NAME),
      preventAssignment: true,
    }),
  ],
  external: ['lodashEs'],
};
