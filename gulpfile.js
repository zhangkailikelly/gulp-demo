/**
 * Created by syzx9801@163.com on 2017/7/4.
 */
//路径信息
var cssDest = '../assets/css',
    lessSrc = '../assets/css/*.less',
    cssSrc = '../assets/css/*.css',
    jsSrc = '../assets/js/demo/*.js',
    jsDest = '../assets/js/demo',
    appjs = '../assets/js/demo/app.js'
    htmlSrc = '../html/**/*.html';

//引用包
var gulp = require('gulp'),
    less = require('gulp-less'),
    cssmin = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    uglify = require('gulp-uglify'),
    babel = require('gulp-babel'),
    es2015 = require('babel-preset-es2015'),
    stylelint = require('gulp-stylelint'),
    stylelfmt = require('gulp-stylefmt'),
    checkStyleFormatter = require('./lib/checkstyle-formatter'),
    htmlcs = require('hny-gulp-htmlcs'),
    errorLevel = require('./config/errlevel'),
    eslint = require('gulp-eslint'),
    fs = require('fs'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    babelify = require('babelify');

/*
*   编译部分
* **/
//编译less文件
gulp.task('less',function(){
    gulp.src(lessSrc)
        .pipe(less())
        .pipe(gulp.dest(cssDest))
});
//格式化css文件
gulp.task('css',['less'],function(){
    gulp.src(cssSrc)
        .pipe(cssmin())
        .pipe(concat('main.css'))
        .pipe(gulp.dest(cssDest))
});
//编译es6
gulp.task('js',function(){
    gulp.src(jsSrc)
        .pipe(babel({
            presets:[es2015]
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest(jsDest))
});
//  引入部分
gulp.task('browserify', ['js'],function () {
    var b = browserify({
        entries: appjs,
    })
    .transform(babelify.configure({
        presets: [es2015]
    }));
    return b.bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('../assets/js'))
        .pipe(notify({message:'browserify task is success'}));
});

/**
 *      静态代码检查部分
 * */
gulp.task('csscheck', function() {
    var checkstyleXML = 'stylecheck.xml';
    return gulp.src(cssSrc)
        // 按照规则处理代码
        .pipe(stylelfmt({ configFile: './config/.stylefmtrc' }))
        // 按照规则check代码
        .pipe(stylelint({
            configFile: './config/.stylelintrc',
            failAfterError: false,
            // 报告路径
            reportOutputDir: './reports',
            // 输出结果
            reporters: [
                {formatter: 'verbose', console: true},
                {formatter: checkStyleFormatter, save: checkstyleXML}
            ]
        }));
});

gulp.task('htmlcheck', function() {
    var checkstyleXML = 'htmlcs.xml';
    return gulp.src(htmlSrc)
        .pipe(htmlcs({
                configFile: './config/.htmlcsrc',
                errorLevel: errorLevel,
                failAfterError: false,
                // 报告路径
                reportOutputDir: './reports',
                // 输出结果
                reporters: [
                    { formatter: 'verbose',console: true},
                    { formatter: checkStyleFormatter,save: checkstyleXML}
                ]
            })
        );
});

gulp.task('jseslint', function() {
    var checkstyleXML = 'Elint.xml';
    return gulp.src([jsSrc])
        // 按照规则处理代码
        .pipe(eslint({
            configFile: './config/.eslintrc.json',
            reportOutputDir: './reports'
        }))
        .pipe(eslint.format('checkstyle',fs.createWriteStream('reports/'+checkstyleXML)));
});

/**
 *  监听编译部分
 * */
gulp.task('watch',function(){
    gulp.watch(lessSrc,['css']);
    gulp.watch(jsSrc,['browserify']);
});

//开发完毕打包
gulp.task('run', ['css', 'browserify']);
//自检
gulp.task('checkstyle',['csscheck','htmlcheck','jseslint']);
