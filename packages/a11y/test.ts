/* tslint:disable */
import path from 'path';
import serve from 'webpack-serve';
import HtmlWebpackPlugin from 'html-webpack-plugin';


const projectPath = process.cwd();
// const packagePath = path.resolve(__dirname, '..');
const projectName = path.basename(projectPath);

// tslint:disable-next-line
const webpackConfig = require(path.join(projectPath, 'packages/mock-repo/meta.webpack.config'));

webpackConfig.entry.meta.push(path.join(projectPath, 'packages/a11y/run'));

webpackConfig.output = {
  filename: '[name].js'
};

if (!webpackConfig.plugins) {
  webpackConfig.plugins = [];
}

webpackConfig.plugins.push(new HtmlWebpackPlugin({
  template: path.join(projectPath, 'packages/a11y/index.html'),
  title: `Eyes - ${projectName}`
}));

serve({
  host: '127.0.0.1',
  hot: false,
  config: webpackConfig
});
