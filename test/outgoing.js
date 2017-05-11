'use strict';

const Alana = require('../lib/index');

describe('bad sendText', () => {
  const bot = new Alana.default();
  const tester = new Alana.TestPlatform(bot);
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
  const bot = new Alana.default();
  const tester = new Alana.TestPlatform(bot);
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
  const bot = new Alana.default();
  const tester = new Alana.TestPlatform(bot);
  bot.addPlatform(tester);
  bot.start();

  bot.newScript()
    .dialog((sessions, response) => {
      response.sendText('test');
    })
    .expect((s,r) => {

    });

  it('run', function () {
    return tester.newTest()
      .expectText('test')
      .run();
  });
});

describe('good send', () => {
  const bot = new Alana.default();
  const tester = new Alana.TestPlatform(bot);
  bot.addPlatform(tester);
  bot.start();

  bot.newScript()
    .dialog((sessions, response) => {
      response.send('test');
    })
    .expect((s,r) => {

    });

  it('run', function () {
    return tester.newTest()
      .expectText('test')
      .run();
  });
});
