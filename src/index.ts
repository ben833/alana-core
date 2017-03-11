try {
// tslint:disable-next-line:no-var-requires
  require('source-map-support').install();
// tslint:disable-next-line:no-empty
} catch (err) {}

import { GreetingFunction } from './types/bot';
export { Intent, Incoming, GreetingFunction } from './types/bot';
export { User } from './types/user';
export { PlatformMiddleware } from './types/platform';
export { MessageTypes } from './types/message'
import Script from './script';

import Alana from './bot';
export default Alana;

import TestPlatform from './testing/platform';
import Tester from './testing/tester';
export { TestPlatform };

// tslint:disable-next-line:no-namespace
declare global {
  const newScript: (name?: string) => Script;
  const newTest: (userId?: string) => Tester;
  const addGreeting: (greeting: GreetingFunction) => void;
}
