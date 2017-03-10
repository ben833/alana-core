import { GreetingFunction } from './types/bot';
export { Intent, Incoming, GreetingFunction } from './types/bot';
export { User } from './types/user';
export { PlatformMiddleware } from './types/platform';
export { MessageTypes } from './types/message';
import Script from './script';
import Alana from './bot';
export default Alana;
import TestPlatform from './testing/platform';
import Tester from './testing/tester';
export { TestPlatform };
declare global  {
    const newScript: (name?: string) => Script;
    const newTest: (userId?: string) => Tester;
    const addGreeting: (greeting: GreetingFunction) => void;
}
