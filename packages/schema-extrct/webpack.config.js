const testFiles = require('glob').sync("./tests/**/*.spec.ts");
const first = testFiles.shift();
const withMochaLoader = [`mocha-loader!${first}`].concat(testFiles);

const HtmlWebpackPlugin = require('html-webpack-plugin')
var HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');
exports.entry = {
    tests: withMochaLoader
}
exports.devtool = 'eval-source-map';
exports.mode = 'development'
exports.module = {
    rules: [
        {
            test: /\.tsx?$/,
            loader: 'ts-loader',
            options: {
                compilerOptions: {
                    declaration: false,
                    module: 'esnext'
                }
            }
        }
    ]
}
exports.optimization = {
    splitChunks: {
        cacheGroups: {
            commons: {
                test: /[\\/]node_modules[\\/]/,
                name: "vendors",
                chunks: "all"
            }
        }
    }
}
exports.resolve = {
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.json']
}

exports.plugins = [
    new HtmlWebpackPlugin()
    
]