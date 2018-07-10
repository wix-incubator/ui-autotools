const path = require('path');
const glob = require('glob');

const packagePath = __dirname;
const metaGlob = 'src/**/*.meta.ts?(x)';
const specPattern = 'test/*.spec.ts?(x)';
const metaFiles = glob.sync(path.join(packagePath, metaGlob));
const specFiles = glob.sync(path.join(packagePath, specPattern));
console.log('specFiles', specFiles);
module.exports = {
  context: packagePath,
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              declaration: false
            }
          }
        }
      },
      {
        test: /\.css$/,
        exclude: /\.st\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  },
  node: {
    fs: 'empty'
  }
};
