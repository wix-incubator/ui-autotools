import type webpack from 'webpack';

export class RawAssetWebpackPlugin {
  private filename: string;
  private data: string;

  public constructor(options: { filename: string; data: string }) {
    this.filename = options.filename;
    this.data = options.data;
  }

  public apply(compiler: webpack.Compiler): void {
    compiler.hooks.emit.tapAsync('RawAssetPlugin', (compilation, callback) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      compilation.assets[this.filename] = {
        source: () => this.data,
        size: () => this.data.length,
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      callback();
    });
  }
}
