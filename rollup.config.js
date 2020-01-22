import { terser } from 'rollup-plugin-terser';

export default {
  input: 'dist/index.js',
  external: ['react'],
  output: {
    file: 'dist/bundle.js',
    format: 'cjs',
  },
  plugins: [
    terser({
      compress: true,
      mangle: true,
    }),
  ],
};
