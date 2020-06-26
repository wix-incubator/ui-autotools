import Mocha from 'mocha';

const autoSSRTest = () => {
  const mocha = new Mocha();
  mocha.addFile(require.resolve('./ssr-test.js'));
  mocha.run((failures: number) => {
    process.exitCode = failures ? -1 : 0;
  });
};

export default autoSSRTest;
