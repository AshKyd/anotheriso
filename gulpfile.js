var gulp = require('gulp');
var less = require('gulp-less');
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
var connect = require('gulp-connect');
var gutil = require('gulp-util');

gulp.task('scripts', function() {
    gulp.src(['src/scripts/index.js'])
        .pipe(browserify({
          debug : true
        }))
        .on('error', gutil.log)
        // .pipe(uglify())
        .pipe(gulp.dest('dist/scripts/'));
});

gulp.task('styles', function(){
	gulp.src(['src/styles/*.less'])
		.pipe(less())
		.pipe(gulp.dest('dist/styles/'))
});

gulp.task('connect',function(){
	connect.server({
		root: 'dist',
		livereload: true
	});
});

gulp.task('copy',function(){
	gulp.src(['src/*.html'])
		.pipe(gulp.dest('dist/'));
	gulp.src(['src/images/**'])
		.pipe(gulp.dest('dist/images/'));
});

gulp.task('watch', function () {
	gulp.watch(['src/styles/**'], ['styles']);
	gulp.watch(['src/scripts/**'], ['scripts']);
	gulp.watch(['src/*.html','src/images/**'], ['copy']);
});

gulp.task('default',['copy','scripts','styles','connect','watch']);