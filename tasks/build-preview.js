'use strict'

const path = require('path')

const vfs = require('vinyl-fs')
const map = require('map-stream')
const merge = require('merge-stream')
const minimatch = require('minimatch')
const handlebars = require('handlebars')

module.exports = async (src, dest, destTheme) => {

  const relativeThemePath = path.relative(dest, destTheme)

  const [layoutsIndex] = await Promise.all([
    compileLayouts(src),
    registerPartials(src),
  ])

  vfs.src(['preview-site/*.html'])
    .pipe(map((file, next) => {
      const compileLayout = layoutsIndex['index.hbs']
      const mockModel = {
        'keywords': 'key, words, many, of, them',
        'canonical-url': 'https://example.com/index.html',
        'github-edit-url': 'https://github.com/mulesoft/mulesoft-docs',
        'theme-path': relativeThemePath,
        'title': 'Shared Resources',
        'contents': file.contents.toString(),
      }
      file.contents = new Buffer(compileLayout(mockModel))
      next(null, file)
    }))
    .pipe(vfs.dest(dest))
}

function registerPartials(src) {

  return new Promise((resolve, reject) => {

    vfs.src(['nav/*.adoc', 'partials/*.hbs'], { base: src, cwd: src })
      .pipe(map((file, next) => {
        handlebars.registerPartial(file.stem, file.contents.toString())
        next(null, file)
      }))
      .on('error', reject)
      .on('end', resolve)
  })
}

function compileLayouts(src) {

  const layoutsIndex = {}
  return new Promise((resolve, reject) => {

    vfs.src('layouts/*.hbs', { base: src, cwd: src })
      .pipe(map((file, next) => {
        layoutsIndex[file.basename] = handlebars.compile(file.contents.toString())
        next(null, file)
      }))
      .on('error', reject)
      .on('end', () => resolve(layoutsIndex))
  })
}
