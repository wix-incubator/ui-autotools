import Mocha from 'mocha';

const autoSSRTest = (): void => {
  const mocha = new Mocha();
  mocha.addFile(require.resolve('./run-ssr-test.js'));
  // Run the ssr-test file
  mocha.run((failures: number) => {
    process.exitCode = failures ? -1 : 0;
  });
};

export default autoSSRTest;
