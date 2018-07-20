var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var cssnano = require('gulp-cssnano');
var uglify = require("gulp-uglify");
var base64 = require('gulp-base64');
var imagemin = require('gulp-imagemin');
var babel = require('gulp-babel');
var jsonminify = require('gulp-jsonminify2');
var autoprefixer = require('gulp-autoprefixer');
var del = require("del");
var runSequence = require('run-sequence'); //由于gulp 执行任务为并发，run-sequence 为顺序执行
var gulpif = require('gulp-if');
var plumber = require('gulp-plumber');//错误处理
var rename=require("gulp-rename");

var env = process.env.NODE_ENV || 'development';
var isProduction = () => env === 'production';

gulp.task("default", function(cb) {
    
      runSequence([
        'clean',
        'build',
        'watch'
        ],cb)
      
})


gulp.task("watch",function(){
      gulp.watch('src/**/*.js', ['js'])
      gulp.watch('src/**/*.html', ['html'])
      gulp.watch('src/**/*.css', ['css'])
      gulp.watch('src/**/*.json', ['json'])
      gulp.watch('src/**/*.{jpe?g,png,gif}', ['image'])
})

gulp.task('clean', del.bind(null, ['./dist']))

gulp.task('build',['clean'], function(cb) {

     runSequence(["html","css","json","js",'image'],cb)
});

gulp.task('image',function(){
    gulp.src(['./src/images/*.{jpe?g,png,gif}'])
        .pipe(imagemin())
        .pipe(gulp.dest('./dist/images'));
})

gulp.task('html', function() {
    gulp.src('./src/pages/**/*.html')
        .pipe(plumber())
        .pipe(htmlmin({
            collapseWhitespace: true, //去掉空格
            minifyJS: true, //压缩js
            keepClosingSlash: true, //保存闭合标签
            removeComments: true //去掉注释
        }))
        .pipe(rename({extname: '.wxml'}))
        .pipe(gulp.dest('./dist/pages'));
});

gulp.task('css', function() {
    gulp.src([
        "./src/**/**/*.css",
        "./src/*.css"
    ])
    .pipe(plumber())
    .pipe(autoprefixer({
         browsers: ['> 1%',"last 40 versions"]
    })).pipe(cssnano()) //压缩css
        .pipe(base64({
            maxImageSize: 100 * 1000 * 1024
        }))
        .pipe(rename({extname: '.wxss'}))
        .pipe(gulp.dest('./dist'));
});

gulp.task("js", function() {
    gulp.src([
        "./src/*.js",
        "./src/**/*.js",
        "./src/**/**/*.js"
    ])
        .pipe(plumber())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify())
        .pipe(gulp.dest('./dist'));
})

gulp.task("json", function() {
    gulp.src(["./src/*.json", "./src/**/**/*.json"])
        .pipe(plumber())
        .pipe(gulpif(isProduction,jsonminify()))
        .pipe(gulp.dest('./dist'));
})



