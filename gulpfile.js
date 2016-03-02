'use strict';

var gulp = require('gulp'),
  debug = require('gulp-debug'),
  inject = require('gulp-inject'),
  tsc = require('gulp-typescript'),
  tslint = require('gulp-tslint'),
  less = require('gulp-less'),
  path = require('path'),
  sourcemaps = require('gulp-sourcemaps'),
  del = require('del'),
  Config = require('./gulpfile.config'),
  karma = require('karma');

var config = new Config();

/**
 * Lint all custom TypeScript files.
 */
gulp.task('ts-lint', function () {
  return gulp.src(config.allTypeScript).pipe(tslint()).pipe(tslint.report('prose'));
});

gulp.task('test', function (done) {
  karma.server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: false
  }, function () {
    done()
  });
});


gulp.task('default', ['ts-lint']);