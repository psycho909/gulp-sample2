const gulp=require('gulp');
const sass=require('gulp-sass');
const postcss=require('gulp-postcss');
const autoprefixer=require('autoprefixer');
const sourcemaps=require('gulp-sourcemaps');
const browserSync=require('browser-sync').create();
const spritesmith = require('gulp.spritesmith');
const tinypng = require('gulp-tinypng-nokey');
const version = require('gulp-version-number')
var colors = require('colors');

const browserify=require('browserify')
const babelify=require('babelify')
const babel=require('gulp-babel')
const buffer=require('vinyl-buffer');
const source=require('vinyl-source-stream');
const uglify=require('gulp-uglify');

const paths={
	"scss":"./src/scss/**/*.scss",
	"pug":"./src/pug/**/*.pug",
	"ejs":"./src/ejs/**/*.ejs",
	"js":"./src/js/**/*.js",
	"json":"./src/data/json/**/*.json",
	"images":"./src/images/**/*.*",
	"sprite":"./src/sprite/**/*.*",
	"html":"./src/html/**/*.html",
	"dist":{
		"sprite":"./dist/images/sprite/",
		"css":"./dist/css/",
		"js":"./dist/js/",
		"html":"./dist/*.html",
		"base":"./dist/"
	}
}

function imageMin1(){
	console.log(colors.red('imageMin1 : COMPILE'))
	return gulp.src(paths.images)
		.pipe(tinypng())
		.pipe(gulp.dest('./dist/images/'))
}

function sprite(){
	console.log(colors.red('sprite : COMPILE'))
	return gulp.src(paths.sprite)
		.pipe(spritesmith({
			imgName: 'sprite.png',
			cssName: '_sprites.scss',
			cssFormat:'scss'
		}))
		.pipe(gulp.dest(paths.dist.sprite));
}

// compile scss into css
function style(){
	console.log(colors.red('style'))
	// 1.where is my scss file
	return gulp.src(paths.scss)
	// 2.pass that file through sass compiler
		.pipe(sass({
			// compressed 壓縮
			// expanded 普通
			outputStyle:'expanded'
		}))
	.on('error',sass.logError)
	.pipe(sourcemaps.init())
	.pipe(postcss([autoprefixer()]))
	.pipe(sourcemaps.write('.'))
	// 3.where do i save the compiled css?
		.pipe(gulp.dest(paths.dist.css))
	// 4.stream changes to all browser
		.pipe(browserSync.stream())
}

function babeljs(){
	return browserify({
		entries:['src/js/app.js'],
		debug:true
	})
	.transform("babelify", {presets: ["env"]})
	.bundle()
	.on('error',function(err){
		this.emit('end')
	})
	.pipe(source('app.js'))
	.pipe(buffer())
	.pipe(gulp.dest('dist/js/'))
}

function htmlVersion(){
	console.log(colors.red('htmlVersion'))
	return gulp.src(paths.html)
		.pipe(version({
			'value':"%MDS%",
			"replaces":[/{{version}}/ig,"%MDS%"],
			append:{
				"key":"v",
				to:["image"]
			}
		}))
		.pipe(gulp.dest(paths.dist.base))
		.pipe(browserSync.stream())
}

function watch(){
	browserSync.init({
		server:{
			baseDir:paths.dist.base
		}
	})
	gulp.watch(paths.scss,style)
	gulp.watch(paths.html,htmlVersion)
	gulp.watch(paths.dist.js).on('change',browserSync.reload)
	gulp.watch(paths.images,imageMin1).on('change',browserSync.reload)
}

exports.style=style;
exports.watch=watch
exports.babeljs=babeljs

exports.sprite=sprite;
exports.imageMin1=imageMin1;