'use strict';

const Alana = require('../lib/index');

describe('access state', () => {
  const bot = new Alana.default();
  const tester = new Alana.TestPlatform(bot);
  bot.addPlatform(tester);
  bot.start();

  bot.newScript()
    .dialog((sessions, response) => {
      sessions.user.state.name = 'name';
    })
    .dialog((session, response) => {
      response.sendText(session.user.state.name);
    })
    .expect((s,r) => {
      
    })

  it('run', function () {
    return tester.newTest()
      .expectText('name')
      .run();
  });
});