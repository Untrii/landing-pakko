const { src, dest, series, watch } = require('gulp')
const sass = require('gulp-sass')
const csso = require('gulp-csso')
const include = require('gulp-file-include')
const htmlmin = require('gulp-htmlmin')
const del = require('del')
const concat = require('gulp-concat')
const autoprefixer = require('gulp-autoprefixer')
const sourcemaps = require('gulp-sourcemaps')
const babel = require('gulp-babel')
const sync = require('browser-sync').create()

function html() {
  return src('src/**.html')
    .pipe(
      include({
        prefix: '@@',
      })
    )
    .pipe(
      htmlmin({
        collapseWhitespace: true,
      })
    )
    .pipe(dest('dist'))
}

function scss() {
  return src('src/scss/**.scss')
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(csso())
    .pipe(concat('index.css'))
    .pipe(dest('dist'))
}

function assets() {
  return src('src/assets/**').pipe(dest('dist/assets'))
}

function clear() {
  return del('dist')
}

function javascript() {
  return src('src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ['@babel/env', 'minify'],
      })
    )
    .pipe(concat('index.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('dist'))
}

function serve() {
  sync.init({
    server: './dist',
  })

  const listeners = [
    ['src/assets/**', [assets]],
    ['src/**.html', [html]],
    ['src/scss/**.scss', [scss]],
    ['src/**/*.js', [javascript]],
  ]

  listeners.forEach(([sources, callbacks]) => {
    watch(sources, series(...callbacks)).on('change', sync.reload)
  })
}

exports.build = series(clear, scss, html, assets, javascript)
exports.serve = series(clear, scss, html, assets, javascript, serve)
exports.clear = clear
