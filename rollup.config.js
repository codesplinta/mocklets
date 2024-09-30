import fs from 'fs'
import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import strip from '@rollup/plugin-strip'
import json from '@rollup/plugin-json'
import terser from '@rollup/plugin-terser'

const pkg = JSON.parse(
  fs.readFileSync('./package.json', { encoding: 'utf-8' })
)
const extensions = ['.js']
const externalGlobals = Object.keys(pkg.dependencies)
const devHelpersToRemove = process.env.PRODUCTION ? ['console.log', 'console.info', 'assert.*', 'debug', 'alert'] : []

export default {
  input: 'index.js',
  external: externalGlobals,
  plugins: [
    babel({
	    extensions,
	    babelHelpers: 'bundled',
	    exclude: 'node_modules/**'
    }),
    strip({
	    functions: devHelpersToRemove
    }),
    json(),
    terser(),
    commonjs({
      ignoreDynamicRequires: true,
      ignoreGlobal: true
    }),
    resolve({
      extensions
    }),
  ],
  output: [
    {
	    name: pkg.name,
	    file: pkg.main,
	    format: 'cjs',
	    sourcemap: true
    },
    {
	    name: pkg.name,
	    file: pkg.module,
	    format: 'es',
	    sourcemap: true
    }
  ]
}
