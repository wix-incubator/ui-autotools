import { spawnSync } from 'child_process';
import { dirname } from 'path';
import { expect } from 'chai';

describe('autotools-sanity', function () {
  this.timeout(15_000);

  const packageRoot = dirname(require.resolve('../package.json'));

  const executeAutotoolsSanity = (cliArgs: string[] = []) =>
    spawnSync('yarn', ['autotools-sanity', ...cliArgs], {
      cwd: packageRoot,
      shell: true,
      encoding: 'utf8',
    });

  it('passes with ssr-ready component', () => {
    const { status, output } = executeAutotoolsSanity(['-f', require.resolve('./fixtures/passing-comp')]);

    expect(output.join('')).to.include('2 passing');
    expect(status, output.join('')).to.equal(0);
  });

  it('fails with not ssr-ready component', () => {
    const { status } = executeAutotoolsSanity(['-f', require.resolve('./fixtures/failing-comp')]);

    expect(status).to.not.equal(0);
  });
});
