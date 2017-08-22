'use strict'

const path = require('path')

const vfs = require('vinyl-fs')
const map = require('map-stream')
const merge = require('merge-stream')
const minimatch = require('minimatch')

const imagemin = require('gulp-imagemin')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const postcssCalc = require('postcss-calc')
const postcssVar = require('postcss-custom-properties')
const postcssImport = require('postcss-import')
const postcssUrl = require('postcss-url')
const cssnano = require('cssnano')

const postcssPlugins = [
  postcssImport(),
  postcssVar(),
  postcssCalc(),
  autoprefixer({ browsers: ['last 2 versions'] }),
  postcssUrl({
    url: function (asset) {
      if (asset.pathname && minimatch(asset.pathname, './files/*.{svg,eot,woff,woff2}')) {
        const parsedPath = path.parse(asset.pathname)
        return path.join('..', 'fonts', parsedPath.base)
      }
    },
  }),
  cssnano({ preset: 'default' }),
]

module.exports = (src, dest) => {

  const srcOptions = { base: src, cwd: src }

  return merge([

    vfs.src('images/**/*.svg', srcOptions)
      .pipe(imagemin()),

    vfs.src('scripts/**/*.js', srcOptions),

    vfs.src('fonts/*.{svg,eot,woff,woff2}', srcOptions),

    vfs.src('stylesheets/theme.css', srcOptions)
      .pipe(postcss(postcssPlugins)),

    vfs.src('node_modules/typeface-*/**/*.{svg,eot,woff,woff2}', srcOptions)
      .pipe(map((file, next) => {
        // move font files to fonts (without any subfolder)
        file.dirname = path.join(file.base, 'fonts')
        next(null, file)
      })),

    vfs.src('helpers/*.js', srcOptions),
    vfs.src('layouts/*.hbs', srcOptions),
    vfs.src('partials/*.hbs', srcOptions),
  ])
    .pipe(vfs.dest(dest))
}
