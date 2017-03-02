export class MissingArguments extends Error {
  constructor(reason: string = 'Missing arguments') {
    super(reason);
    // Set the prototype explicitly.
    (<any> Object).setPrototypeOf(this, MissingArguments.prototype);
  }
}

export class BadArguments extends Error {
  constructor(reason: string = 'Bad arguments') {
    super(reason);
    // Set the prototype explicitly.
    (<any> Object).setPrototypeOf(this, BadArguments.prototype);
  }
}
