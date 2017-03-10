const Promise = require('bluebird');
before(function(){
  require('source-map-support').install();
  Promise.config({
    // Enable long stack traces
    longStackTraces: true,
    // Enable cancellation
    cancellation: true,
    // // Enable monitoring
    // monitoring: true,
    warnings: {
      wForgottenReturn: false
    }
  });
})