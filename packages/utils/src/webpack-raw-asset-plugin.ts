import webpack from 'webpack';

export default class WebpackRawAssetPlugin {
  private filename: string;
  private data: string;

  public constructor(options: {filename: string, data: string}) {
    this.filename = options.filename;
    this.data = options.data;
  }

  public apply(compiler: webpack.Compiler) {
    compiler.hooks.emit.tapAsync('RawAssetPlugin', (compilation, callback) => {
      compilation.assets[this.filename] = {
        source: () => this.data,
        size: () => this.data.length
      };
      callback();
    });
  }
}
