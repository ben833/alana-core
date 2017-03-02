'use strict';

const Botler = require('../lib/index');

describe('bad sendText', () => {
  const bot = new Botler.default();
  const tester = new Botler.TestPlatform(bot);
  bot.addPlatform(tester);
  bot.start();

  bot.newScript()
    .dialog((sessions, response) => {
      response.sendText();
    })

  it('run', function () {
    return tester.newTest()
      .expectText('Uh oh, something went wrong, can you try again?')
      .run();
  });
});

describe('bad send', () => {
  const bot = new Botler.default();
  const tester = new Botler.TestPlatform(bot);
  bot.addPlatform(tester);
  bot.start();

  bot.newScript()
    .dialog((sessions, response) => {
      response.send();
    })

  it('run', function () {
    return tester.newTest()
      .expectText('Uh oh, something went wrong, can you try again?')
      .run();
  });
});

describe('good sendText', () => {
  const bot = new Botler.default();
  const tester = new Botler.TestPlatform(bot);
  bot.addPlatform(tester);
  bot.start();

  bot.newScript()
    .dialog((sessions, response) => {
      response.sendText('test');
    })

  it('run', function () {
    return tester.newTest()
      .expectText('test')
      .run();
  });
});

describe('good send', () => {
  const bot = new Botler.default();
  const tester = new Botler.TestPlatform(bot);
  bot.addPlatform(tester);
  bot.start();

  bot.newScript()
    .dialog((sessions, response) => {
      response.send('test');
    })

  it('run', function () {
    return tester.newTest()
      .expectText('test')
      .run();
  });
});
