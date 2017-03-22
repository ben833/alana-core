'use strict';

const Alana = require('../lib/index');

describe('text trivia', () => {
  const trivia = {
    'history': [ // this is a trivia topic
      { q: 'Question 1', // this is the question we will ask the user
        w: ['a2', 'a3', 'a4'], // these are wrong answers
        c: 'a1', // this is the correct answer
      },
      { q: 'Question 2', w: ['a2', 'a3', 'a4'], c: 'a1' },
      { q: 'Question 3', w: ['a2', 'a3', 'a4'], c: 'a1' },
    ],
    'sports': [
      { q: 'Question 1', w: ['a2', 'a3', 'a4'], c: 'a1' },
      { q: 'Question 2', w: ['a2', 'a3', 'a4'], c: 'a1' },
      { q: 'Question 3', w: ['a2', 'a3', 'a4'], c: 'a1' },
    ],
  };
  const bot = new Alana.default();
  const tester = new Alana.TestPlatform(bot);
  bot.addPlatform(tester);
  bot.start();

  bot.addGreeting((user, response) => {
    response.sendText('Welcome to trivia time!')
    user.score = 0; //set the user's score to 0
  });

  bot.newScript() // 
    .dialog('start', (session, response, stop) => {
      response.sendText('Pick a trivia topic');
      const topics = Object.keys(trivia).join(' or ');
      response.sendText(topics);
    })
    .expect.text((session, response, stop) => {
        response.startScript(session.message.text);
      });

  Object.keys(trivia).forEach((topic) => { // iterate through each topic
    bot.newScript(topic) // a new script with the topic name
      /* 
      * begin dialogs are like greetings for scripts, they are only sent once
      */
      .begin((session, response, stop) => { 
        response.sendText(`Time to test you on ${topic}!`);
        session.user.question_number = 0; // Reset what question the user is on
      })
      .intent.always('general', 'help', (session, response) => {
        response.sendText(`You are in the ${topic} section`);
        response.goto('start');
      })
      /* 
      * If the dialog doesn't call stop() then the script will automatically flow 
      * to the next dialog. We can also use named dialogs to move around a script
      * we'll use this later to loop around the questions
      */
      .dialog('start', (session, response, stop) => {
        const question = trivia[topic][session.user.question_number];
        response
          .sendText(question.q)
          .sendText('Is it:'); //notice how you can chain responses (but don't have to!)
        response.sendText(question.w.concat(question.c).join(' or ')); //exercise for the reader to shuffle these!
      })
      /* 
      * The script will stop here because the next dialog is an expect dialog, which tells
      * alana to wait for input from the user. We can even specialize the expect to only 
      * response to a text message.
      */
      .expect.text((session, response, stop) => {
        const question = trivia[topic][session.user.question_number];
        if (session.message.text === question.c) {
          response.sendText('Correct!');
          session.user.score++;
        } else {
          response.sendText(`Wrong :( it was ${question.c}`);
          // session.user.score = Math.max(0, session.user.score - 1); //deduct a point ;)
        }
        response.sendText(`Your score is ${session.user.score}`);
        session.user.question_number++;
        if (session.user.question_number < trivia[topic].length) {
          // we still have questions, ask the next one
          response.goto('start');
        }
      });
      /* 
      * At the end of script, alana will automatically move the user to the default
      * script, usually the main menu
      */
  });

  it('greeting', function () {
    return tester.newTest()
      .checkForTrailingDialogs()
      .expectText('Welcome to trivia time!')
      .expectText('Pick a trivia topic')
      .expectText(Object.keys(trivia).join(' or '))
      .run();
  });

  it('pick topic', function () {
    return tester.newTest()
      .checkForTrailingDialogs()
      .expectText('Welcome to trivia time!')
      .expectText('Pick a trivia topic')
      .expectText(Object.keys(trivia).join(' or '))
      .sendText('history')
      .expectText('Time to test you on history!')
      .expectText('Question 1')
      .expectText('Is it:')
      .expectText('a2 or a3 or a4 or a1')
      .run();
  });

  it('pick bad topic', function () {
    return tester.newTest()
      .checkForTrailingDialogs()
      .expectText('Welcome to trivia time!')
      .expectText('Pick a trivia topic')
      .expectText(Object.keys(trivia).join(' or '))
      .sendText('science')
      .expectText('Pick a trivia topic')
      .expectText(Object.keys(trivia).join(' or '))
      .run();
  });

  it('wrong answer', function () {
    return tester.newTest()
      .checkForTrailingDialogs()
      .expectText('Welcome to trivia time!')
      .expectText('Pick a trivia topic')
      .expectText(Object.keys(trivia).join(' or '))
      .sendText('history')
      .expectText('Time to test you on history!')
      .expectText('Question 1')
      .expectText('Is it:')
      .expectText('a2 or a3 or a4 or a1')
      .sendText('a2')
      .expectText('Wrong :( it was a1')
      .expectText('Your score is 0')
      .expectText('Question 2')
      .expectText('Is it:')
      .expectText('a2 or a3 or a4 or a1')
      .run();
  });

  it('correct answer', function () {
    return tester.newTest()
      .checkForTrailingDialogs()
      .expectText('Welcome to trivia time!')
      .expectText('Pick a trivia topic')
      .expectText(Object.keys(trivia).join(' or '))
      .sendText('history')
      .expectText('Time to test you on history!')
      .expectText('Question 1')
      .expectText('Is it:')
      .expectText('a2 or a3 or a4 or a1')
      .sendText('a1')
      .expectText('Correct!')
      .expectText('Your score is 1')
      .expectText('Question 2')
      .expectText('Is it:')
      .expectText('a2 or a3 or a4 or a1')
      .run();
  });

  it('correct then wrong', function () {
    return tester.newTest()
      .checkForTrailingDialogs()
      .expectText('Welcome to trivia time!')
      .expectText('Pick a trivia topic')
      .expectText(Object.keys(trivia).join(' or '))
      .sendText('history')
      .expectText('Time to test you on history!')
      .expectText('Question 1')
      .expectText('Is it:')
      .expectText('a2 or a3 or a4 or a1')
      .sendText('a1')
      .expectText('Correct!')
      .expectText('Your score is 1')
      .expectText('Question 2')
      .expectText('Is it:')
      .expectText('a2 or a3 or a4 or a1')
      .sendText('a2')
      .expectText('Wrong :( it was a1')
      .expectText('Your score is 1')
      .expectText('Question 3')
      .expectText('Is it:')
      .expectText('a2 or a3 or a4 or a1')
      .run();
  });

  it('correct x2', function () {
    return tester.newTest()
      .checkForTrailingDialogs()
      .expectText('Welcome to trivia time!')
      .expectText('Pick a trivia topic')
      .expectText(Object.keys(trivia).join(' or '))
      .sendText('history')
      .expectText('Time to test you on history!')
      .expectText('Question 1')
      .expectText('Is it:')
      .expectText('a2 or a3 or a4 or a1')
      .sendText('a1')
      .expectText('Correct!')
      .expectText('Your score is 1')
      .expectText('Question 2')
      .expectText('Is it:')
      .expectText('a2 or a3 or a4 or a1')
      .sendText('a1')
      .expectText('Correct!')
      .expectText('Your score is 2')
      .expectText('Question 3')
      .expectText('Is it:')
      .expectText('a2 or a3 or a4 or a1')
      .run();
  });

  it('complete topic', function () {
    return tester.newTest()
      .checkForTrailingDialogs()
      .expectText('Welcome to trivia time!')
      .expectText('Pick a trivia topic')
      .expectText(Object.keys(trivia).join(' or '))
      .sendText('history')
      .expectText('Time to test you on history!')
      .expectText('Question 1')
      .expectText('Is it:')
      .expectText('a2 or a3 or a4 or a1')
      .sendText('a1')
      .expectText('Correct!')
      .expectText('Your score is 1')
      .expectText('Question 2')
      .expectText('Is it:')
      .expectText('a2 or a3 or a4 or a1')
      .sendText('a1')
      .expectText('Correct!')
      .expectText('Your score is 2')
      .expectText('Question 3')
      .expectText('Is it:')
      .expectText('a2 or a3 or a4 or a1')
      .sendText('a1')
      .expectText('Correct!')
      .expectText('Your score is 3')
      .expectText('Pick a trivia topic')
      .expectText(Object.keys(trivia).join(' or '))
      .run();
  });

  it('do 2 topic', function () {
    this.slow(800) // suporess slow test warning
    return tester.newTest()
      .checkForTrailingDialogs()
      .expectText('Welcome to trivia time!')
      .expectText('Pick a trivia topic')
      .expectText(Object.keys(trivia).join(' or '))
      .sendText('history')
      .expectText('Time to test you on history!')
      .expectText('Question 1')
      .expectText('Is it:')
      .expectText('a2 or a3 or a4 or a1')
      .sendText('a1')
      .expectText('Correct!')
      .expectText('Your score is 1')
      .expectText('Question 2')
      .expectText('Is it:')
      .expectText('a2 or a3 or a4 or a1')
      .sendText('a1')
      .expectText('Correct!')
      .expectText('Your score is 2')
      .expectText('Question 3')
      .expectText('Is it:')
      .expectText('a2 or a3 or a4 or a1')
      .sendText('a1')
      .expectText('Correct!')
      .expectText('Your score is 3')
      .expectText('Pick a trivia topic')
      .expectText(Object.keys(trivia).join(' or '))
      .sendText('sports')
      .expectText('Time to test you on sports!')
      .expectText('Question 1')
      .expectText('Is it:')
      .expectText('a2 or a3 or a4 or a1')
      .sendText('a1')
      .expectText('Correct!')
      .expectText('Your score is 4')
      .expectText('Question 2')
      .expectText('Is it:')
      .expectText('a2 or a3 or a4 or a1')
      .sendText('a1')
      .expectText('Correct!')
      .expectText('Your score is 5')
      .expectText('Question 3')
      .expectText('Is it:')
      .expectText('a2 or a3 or a4 or a1')
      .sendText('a1')
      .expectText('Correct!')
      .expectText('Your score is 6')
      .expectText('Pick a trivia topic')
      .expectText(Object.keys(trivia).join(' or '))
      .run();
  });

  it('intent test', function () {
    this.slow(500) // suporess slow test warning
    return tester.newTest()
      .checkForTrailingDialogs()
      .expectText('Welcome to trivia time!')
      .expectText('Pick a trivia topic')
      .expectText(Object.keys(trivia).join(' or '))
      .sendText('history')
      .expectText('Time to test you on history!')
      .expectText('Question 1')
      .expectText('Is it:')
      .expectText('a2 or a3 or a4 or a1')
      .sendText('a1')
      .expectText('Correct!')
      .expectText('Your score is 1')
      .expectText('Question 2')
      .expectText('Is it:')
      .expectText('a2 or a3 or a4 or a1')
      .sendText('help')
      .expectText('You are in the history section')
      .expectText('Question 2')
      .expectText('Is it:')
      .expectText('a2 or a3 or a4 or a1')
      .run();
  });
});

describe('button trivia', () => {
  const trivia = {
    'history': [ // this is a trivia topic
      { q: 'Question 1', // this is the question we will ask the user
        w: ['a2', 'a3', 'a4'], // these are wrong answers
        c: 'a1', // this is the correct answer
      },
      { q: 'Question 2', w: ['a2', 'a3', 'a4'], c: 'a1' },
      { q: 'Question 3', w: ['a2', 'a3', 'a4'], c: 'a1' },
    ],
    'sports': [
      { q: 'Question 1', w: ['a2', 'a3', 'a4'], c: 'a1' },
      { q: 'Question 2', w: ['a2', 'a3', 'a4'], c: 'a1' },
      { q: 'Question 3', w: ['a2', 'a3', 'a4'], c: 'a1' },
    ],
  };
  const bot = new Alana.default();
  const tester = new Alana.TestPlatform(bot);
  bot.addPlatform(tester);
  bot.start();

  bot.addGreeting((user, response) => {
    response.sendText('Welcome to trivia time!')
    user.score = 0; //set the user's score to 0
  });

  bot.newScript() // 
    .dialog('start', (session, response, stop) => {
      const buttons = response.sendButtons().text('Pick a trivia topic');
      const topics = Object.keys(trivia).forEach(topic => {
        buttons.addButton('postback', topic, topic);
      })
      buttons.send()
    })
    .expect.button((session, response, stop) => {
        response.startScript(session.message.payload);
      });

  Object.keys(trivia).forEach((topic) => { // iterate through each topic
    bot.newScript(topic) // a new script with the topic name
      /* 
      * begin dialogs are like greetings for scripts, they are only sent once
      */
      .begin((session, response, stop) => { 
        response.sendText(`Time to test you on ${topic}!`);
        session.user.question_number = 0; // Reset what question the user is on
      })
      .intent.always('general', 'help', (session, response) => {
        response.sendText(`You are in the ${topic} section`);
        response.goto('start');
      })
      /* 
      * If the dialog doesn't call stop() then the script will automatically flow 
      * to the next dialog. We can also use named dialogs to move around a script
      * we'll use this later to loop around the questions
      */
      .dialog('start', (session, response, stop) => {
        const question = trivia[topic][session.user.question_number];
        response.sendText(question.q)
        const buttons = response.sendButtons().text('Is it:');
        question.w.concat(question.c).forEach(answer => {
          buttons.addButton('postback', answer, answer);
        });
        buttons.send()
      })
      /* 
      * The script will stop here because the next dialog is an expect dialog, which tells
      * alana to wait for input from the user. We can even specialize the expect to only 
      * response to a text message.
      */
      .expect
        .button((session, response, stop) => {
          const question = trivia[topic][session.user.question_number];
          if (session.message.payload === question.c) {
            response.sendText('Correct!');
            session.user.score++;
          } else {
            response.sendText(`Wrong :( it was ${question.c}`);
            // session.user.score = Math.max(0, session.user.score - 1); //deduct a point ;)
          }
          response.sendText(`Your score is ${session.user.score}`);
          session.user.question_number++;
          if (session.user.question_number < trivia[topic].length) {
            // we still have questions, ask the next one
            response.goto('start');
          }
        })
        .text((session, response, stop) => {
          const question = trivia[topic][session.user.question_number];
          if (session.message.text === question.c) {
            response.sendText('Correct!');
            session.user.score++;
          } else {
            response.sendText(`Wrong :( it was ${question.c}`);
            // session.user.score = Math.max(0, session.user.score - 1); //deduct a point ;)
          }
          response.sendText(`Your score is ${session.user.score}`);
          session.user.question_number++;
          if (session.user.question_number < trivia[topic].length) {
            // we still have questions, ask the next one
            response.goto('start');
          }
        });
      /* 
      * At the end of script, alana will automatically move the user to the default
      * script, usually the main menu
      */
  });

  it('only button clicking', function () {
    return tester.newTest()
      .checkForTrailingDialogs()
      .expectText('Welcome to trivia time!')
      .expectButtons('Pick a trivia topic', [ 
        { type: 'postback', text: 'history', payload: 'history' },
        { type: 'postback', text: 'sports', payload: 'sports' }
      ])
      .sendButtonClick('history')
      .expectText('Time to test you on history!')
      .expectText('Question 1')
      .expectButtons('Is it:', [ 
        { type: 'postback', text: 'a2', payload: 'a2' },
        { type: 'postback', text: 'a3', payload: 'a3' },
        { type: 'postback', text: 'a4', payload: 'a4' },
        { type: 'postback', text: 'a1', payload: 'a1' },
      ])
      .sendButtonClick('a1')
      .expectText('Correct!')
      .expectText('Your score is 1')
      .expectText('Question 2')
      .expectButtons('Is it:', [ 
        { type: 'postback', text: 'a2', payload: 'a2' },
        { type: 'postback', text: 'a3', payload: 'a3' },
        { type: 'postback', text: 'a4', payload: 'a4' },
        { type: 'postback', text: 'a1', payload: 'a1' },
      ])
      .run();
  });

  it('button + text', function () {
    return tester.newTest()
      .checkForTrailingDialogs()
      .expectText('Welcome to trivia time!')
      .expectButtons('Pick a trivia topic', [ 
        { type: 'postback', text: 'history', payload: 'history' },
        { type: 'postback', text: 'sports', payload: 'sports' }
      ])
      .sendButtonClick('history')
      .expectText('Time to test you on history!')
      .expectText('Question 1')
      .expectButtons('Is it:', [ 
        { type: 'postback', text: 'a2', payload: 'a2' },
        { type: 'postback', text: 'a3', payload: 'a3' },
        { type: 'postback', text: 'a4', payload: 'a4' },
        { type: 'postback', text: 'a1', payload: 'a1' },
      ])
      .sendText('a1')
      .expectText('Correct!')
      .expectText('Your score is 1')
      .expectText('Question 2')
      .expectButtons('Is it:', [ 
        { type: 'postback', text: 'a2', payload: 'a2' },
        { type: 'postback', text: 'a3', payload: 'a3' },
        { type: 'postback', text: 'a4', payload: 'a4' },
        { type: 'postback', text: 'a1', payload: 'a1' },
      ])
      .run();
  });
});