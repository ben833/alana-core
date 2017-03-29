'use strict';

const Alana = require('../lib/index');
const Promise = require('bluebird');

describe('only default script', () => {
  const bot = new Alana.default();
  const tester = new Alana.TestPlatform(bot);
  bot.addPlatform(tester);
  bot.start();

  bot.newScript()
    .dialog((incoming, response) => {
      response.sendText('hi');
    });

  it('run', function () {
    return tester.newTest()
      .expectText('hi')
      .run();
  });
});

describe('only default script with expect', () => {
  const bot = new Alana.default();
  const tester = new Alana.TestPlatform(bot);
  bot.addPlatform(tester);
  bot.start();

  bot.newScript()
    .expect.text((incoming, response) => {
      response.sendText(incoming.message.text);
    });

  it('run', function () {
    return tester.newTest()
      .sendText('hi')
      .expectText('hi')
      .run();
  });
});

describe('only greeting script', () => {
  const bot = new Alana.default();
  const tester = new Alana.TestPlatform(bot);
  bot.addPlatform(tester);
  bot.start();

  bot.addGreeting((user, response) => {
    response.sendText('hi');
  });

  it('run', function () {
    return tester.newTest()
      .expectText('hi')
      .run();
  });
});

describe('greeting then default', () => {
  const bot = new Alana.default();
  const tester = new Alana.TestPlatform(bot);
  bot.addPlatform(tester);
  bot.start();

  bot.addGreeting((user, response) => {
      response.sendText('hey');
    });
  bot.newScript()
    .dialog((incoming, response) => {
      response.sendText('ho');
    });

  it('basic', function () {
    return tester.newTest()
      .expectText('hey')
      .expectText('ho')
      .run();
  });

  it('with begin', function () {
    bot.newScript()
      .begin((incoming, response) => {
        response.sendText('begin');
      })
      .dialog((incoming, response) => {
        response.sendText('ho');
      });
    return tester.newTest()
      .expectText('hey')
      .expectText('begin')
      .expectText('ho')      
      .run();
  });
});

describe('greeting -> script -> default', () => {
  const bot = new Alana.default();
  const tester = new Alana.TestPlatform(bot);
  bot.addPlatform(tester);
  bot.start();

  bot.addGreeting((user, response) => {
      response.sendText('hey');
      response.startScript('special');
    });
  bot.newScript()
    .dialog((incoming, response) => {
      response.sendText('ho');
    });
  bot.newScript('special')
    .dialog((incoming, response) => {
      response.sendText('special');
    });

  it('run', function () {
    return tester.newTest()
      .expectText('hey')
      .expectText('special')
      .expectText('ho')
      .run();
  });
});

describe('script loop in default', () => {
  const bot = new Alana.default();
  const tester = new Alana.TestPlatform(bot);
  bot.addPlatform(tester);
  bot.start();

  bot.newScript()
    .begin((incoming, response) => {
      response.sendText('begin');
      return null;
    })
    .dialog((incoming, response) => {
      response.sendText('hi');
      return null;
    });

  it('run', function () {
    return tester.newTest()
      .expectText('begin')
      .expectText('hi')
      .sendText('hey you')
      .expectText('hi')
      .sendText('try again')
      .expectText('hi')
      .run();
  });
});

describe('mutli script loop', () => {
  const bot = new Alana.default();
  const tester = new Alana.TestPlatform(bot);
  bot.addPlatform(tester);
  bot.start();

  bot.addGreeting(function(user, response) {
    response.sendText('Menu: echo, order');
  });

  bot.newScript()
    .expect.text((sessions, response) => {
      response.startScript(sessions.message.text)
    })

  bot.newScript('order')
    .dialog((sessions, response) => {
      response.sendText('1');
      response.sendText('2');
    })
    .dialog((sessions, response) => {
      response.sendText('3');
    })

  it('run', function () {
    return tester.newTest()
      .expectText('Menu: echo, order')
      .sendText('order')
      .expectText('1')
      .expectText('2')
      .expectText('3')
      .run();
  });
});

describe('mutli script loop', () => {
  const bot = new Alana.default();
  const tester = new Alana.TestPlatform(bot);
  bot.addPlatform(tester);
  bot.start();

  bot.addGreeting(function(user, response) {
    response.sendText('Menu: echo, order');
  });

  bot.newScript()
    .expect.text((sessions, response) => {
      response.startScript(sessions.message.text)
    })

  bot.newScript('order')
    .dialog((sessions, response) => {
      response.sendText('1');
      response.sendText('2');
    })
    .dialog((sessions, response) => {
      response.sendText('3');
    })

  it('run', function () {
    return tester.newTest()
      .expectText('Menu: echo, order')
      .sendText('order')
      .expectText('1')
      .expectText('2')
      .expectText('3')
      .run();
  });
});

describe('infinite loop', () => {
  const bot = new Alana.default();
  const tester = new Alana.TestPlatform(bot);
  bot.addPlatform(tester);
  bot.start();

  bot.newScript()
    .expect.text((sessions, response) => {
      if (sessions.message.text === 'ping') {
        response.startScript(sessions.message.text)
      }
    })

  it('run', function () {
    return tester.newTest()
      .checkForTrailingDialogs()
      .sendText('pong')
      .run();
  });
});

describe('begin -> always + (dialog -> script loop)', () => {
  const bot = new Alana.default();
  const tester = new Alana.TestPlatform(bot);
  bot.addPlatform(tester);
  bot.start();

  bot.newScript()
    .begin((session, response) => { 
      response.sendText('begin') ;
      return null
    })
    .dialog.always('always', (sessions, response) => {
      // 0
      response.sendText('always')
      return null
    })
    .dialog('start', (sessions, response) => {
      // 1
      response.sendText('dialog');
      return null;
    })
    .expect.text((sessions, response) => {
      // 2
      response.sendText('expect')
      response.goto('start');
    })

  it('run', function () {
    return tester.newTest()
      .checkForTrailingDialogs()
      .expectText('begin')
      .expectText('always')
      .expectText('dialog')
      // .debugBreak()
      .sendText('input')
      .expectText('always')
      .expectText('expect')
      .expectText('always')
      .expectText('dialog')
      .run();
  });
});

describe('stop test', () => {
  const bot = new Alana.default();
  const tester = new Alana.TestPlatform(bot);
  bot.addPlatform(tester);
  bot.start();

  bot.newScript()
    .begin((session, response) => { 
      response.sendText('begin') ;
      return null
    })
    .dialog.always('always', (sessions, response) => {
      response.sendText('always')
      return null
    })
    .dialog('start', (sessions, response, stop) => {
      response.sendText('dialog');
      stop()
    })
    .dialog('second', (sessions, response, stop) => {
      response.sendText('second');
    })
    .expect.text((sessions, response) => {
      // 2
      response.sendText('expect')
      response.goto('start');
    })

  it('run', function () {
    return tester.newTest()
      .checkForTrailingDialogs()
      .expectText('begin')
      .expectText('always')
      .expectText('dialog')
      .sendText('input')
      .expectText('always')
      .expectText('dialog')
      .run();
  });
});

describe.skip('default script - dialog -> expect loop', () => {
  const bot = new Alana.default();
  const tester = new Alana.TestPlatform(bot);
  bot.addPlatform(tester);
  bot.start();

  bot.newScript()
    .dialog((sessions, response, stop) => {
      response.sendText('dialog');
    })
    .expect.text((sessions, response) => {
      response.sendText('expect')
    })

  it('run', function () {
    return tester.newTest()
      .checkForTrailingDialogs()
      .expectText('dialog')
      .sendText('input')
      .expectText('expect')
      .expectText('dialog')
      .run();
  });
});