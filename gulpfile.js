const gulp = require('gulp')
const sass = require('gulp-sass')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const sourcemaps = require('gulp-sourcemaps')
const browserSync = require('browser-sync').create()
const spritesmith = require('gulp.spritesmith')
const tinypng = require('gulp-tinypng-nokey')
const version = require('gulp-version-number')
var colors = require('colors')

const browserify = require('browserify')
const babelify = require('babelify')
const buffer = require('vinyl-buffer')
const source = require('vinyl-source-stream')
const uglify = require('gulp-uglify')

const babel = require('gulp-babel');

const paths = {
    entry:{
        scss: './src/scss/**/*.scss',
        pug: './src/pug/**/*.pug',
        ejs: './src/ejs/**/*.ejs',
        js: './src/js/default.js',
        alljs: './src/js/**/*.js',
        json: './src/data/json/**/*.json',
        images: './src/images/**/*.*',
        sprite: './src/sprite/**/*.*',
        html: './src/html/**/*.html',
    },
    output: {
        sprite: './dist/images/sprite/',
        css: './dist/css/',
        js: './dist/js/',
        html: './dist/*.html',
        images: './dist/images/',
        base: './dist/',
    },
}

function imageMin1() {
    console.log(colors.red('imageMin1 : COMPILE'))
    return gulp
        .src(paths.entry.images)
        .pipe(tinypng())
        .pipe(gulp.dest(paths.output.images))
}

function sprite() {
    console.log(colors.red('sprite : COMPILE'))
    return gulp
        .src(paths.sprite)
        .pipe(
            spritesmith({
                imgName: 'sprite.png',
                cssName: '_sprites.scss',
                cssFormat: 'scss',
            })
        )
        .pipe(gulp.dest(paths.output.sprite))
}

// compile scss into css
function style() {
    console.log(colors.red('style'))
    // 1.where is my scss file
    return (
        gulp
            .src(paths.entry.scss)
            // 2.pass that file through sass compiler
            .pipe(
                sass({
                    // compressed 壓縮
                    // expanded 普通
                    outputStyle: 'expanded',
                })
            )
            .on('error', sass.logError)
            .pipe(sourcemaps.init())
            .pipe(postcss([autoprefixer()]))
            .pipe(sourcemaps.write('.'))
            // 3.where do i save the compiled css?
            .pipe(gulp.dest(paths.output.css))
            // 4.stream changes to all browser
            .pipe(browserSync.stream())
    )
}

const browserifyJs = () => {
    return browserify({
        entries: paths.entry.js,
        debug: true,
        transform: [
            babelify.configure({
                presets: ["@babel/preset-env"],
            }),
        ],
    })
	.bundle()
	.pipe(source('default.js'))
	.pipe(buffer())
	.pipe(gulp.dest(paths.output.js))
}

const gulpBabel=()=>{
    console.log(colors.red('gulpBabel'))
    return gulp.src(paths.entry.alljs)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ["@babel/preset-env"],
        }))
        .pipe(gulp.dest(paths.output.js))
}

function htmlVersion() {
    console.log(colors.red('htmlVersion'))
    return gulp
        .src(paths.entry.html)
        .pipe(
            version({
                value: '%MDS%',
                replaces: [/{{version}}/gi, '%MDS%'],
                append: {
                    key: 'v',
                    to: ['image'],
                },
            })
        )
        .pipe(gulp.dest(paths.output.base))
        .pipe(browserSync.stream())
}

const watch= (done) => {
    browserSync.init({
        server: {
            baseDir: paths.output.base,
        },
    })
    gulp.watch(paths.entry.scss, gulp.parallel(style))
    gulp.watch(paths.entry.html, gulp.parallel(htmlVersion))
    // gulp.watch(paths.output.js).on('change',browserSync.reload)
    gulp.watch(paths.entry.alljs, gulp.parallel(browserifyJs)).on('change', browserSync.reload)
    gulp.watch(paths.entry.images, gulp.parallel(imageMin1)).on('change', browserSync.reload)
	done()
}

const watchBabel= (done) => {
    browserSync.init({
        server: {
            baseDir: paths.output.base,
        },
    })
    gulp.watch(paths.entry.scss, gulp.parallel(style))
    gulp.watch(paths.entry.html, gulp.parallel(htmlVersion))
    // gulp.watch(paths.output.js).on('change',browserSync.reload)
    gulp.watch(paths.entry.alljs, gulp.parallel(gulpBabel)).on('change', browserSync.reload)
    gulp.watch(paths.entry.images, gulp.parallel(imageMin1)).on('change', browserSync.reload)
	done()
}

exports.style = style
exports.watch = watch
exports.watchBabel = watchBabel
exports.browserifyJs = browserifyJs
exports.sprite = sprite
exports.imageMin1 = imageMin1
exports.gulpBabel = gulpBabel

exports.default=gulp.series(style,browserifyJs,watch)
