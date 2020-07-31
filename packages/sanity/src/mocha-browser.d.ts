declare module 'mocha/mocha.js' {
  interface BrowserMocha extends Mocha {
    /**
     * Function to allow assertion libraries to throw errors directly into mocha.
     * This is useful when running tests in a browser because window.onerror will
     * only receive the 'message' attribute of the Error.
     */
    throwError(err: any): never;

    /**
     * Setup mocha with the given settings options.
     */
    setup(opts?: Mocha.Interface | Mocha.MochaOptions): this;
  }
  const browserMocha: BrowserMocha;
  export = browserMocha;
}
