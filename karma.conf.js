module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher')
    ],
    files: [
      {pattern: 'node_modules/systemjs/dist/system-polyfills.js', included: true, watched: true},
      {pattern: 'node_modules/systemjs/dist/system.src.js', included: true, watched: true},
      {pattern: 'node_modules/es6-shim/es6-shim.js', included: true, watched: true},
     
      // paths loaded via module imports
      {pattern: 'src/app/**/*.js', included: true, watched: true},

      // paths to support debugging with source maps in dev tools
      {pattern: 'src/app/**/*.ts', included: false, watched: false},
      {pattern: 'src/app/**/*.js.map', included: false, watched: false}
    ],
    exclude: [],
    preprocessors: {},
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome', 'Firefox'],
    singleRun: false
  });
};
