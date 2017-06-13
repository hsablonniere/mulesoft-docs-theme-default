'use strict'

const path = require('path')

const gulp = require('gulp')

const buildTheme = require('./tasks/build-theme')
const buildPreview = require('./tasks/build-preview')
const serve = require('./tasks/serve')

const config = require('./config')
try {
  config.validate({ allowed: 'strict' })
}
catch (error) {
  const configErrorMessages = error.message.split('\n')
  configErrorMessages.forEach((message) => {
    console.error('Bad config -', message)
  })

  // 9 - Invalid Argument
  // https://nodejs.org/api/process.html#process_exit_codes
  process.exit(9)
}

const src = config.get('source')
const dest = config.get('destination')
const destTheme = path.join(dest, config.get('theme_destination'))

gulp.task('build-theme', () => {
  return buildTheme(src, destTheme)
})

gulp.task('build-preview', ['build-theme'], () => {
  return buildPreview(src, dest, destTheme)
})

gulp.task('serve', ['build-preview'], () => {
  return serve(dest, () => gulp.start('build-preview'))
})