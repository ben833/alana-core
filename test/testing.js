'use strict';

const Alana = require('../lib/index');
const Promise = require('bluebird');

describe('require run()', () => {
  const bot = new Alana.default();
  const tester = new Alana.TestPlatform(bot);
  bot.addPlatform(tester);
  bot.start();

  bot.newScript()
    .dialog((incoming, response) => {
      response.sendText('hi');
    });

  it('throw error without run', function () {
    return Promise.resolve()
    .then(() => {
      return tester.newTest()
        .expectText('hi')
    })
    .then(() => {
      throw new Error('Didn\'t require run()');
    })
    .catch(err => {
      if (err.message === 'Didn\'t require run()') {
        throw err;
      }
    })
  });
});

