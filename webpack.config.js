const HtmlWebpackPlugin = require('html-webpack-plugin')
const schemaPath = `${__dirname}/packages/schema-extract`;
const testFiles = require('glob').sync(`${schemaPath}/test/**/*.spec.ts`);
const first = testFiles.shift();
const withMochaLoader = [`mocha-loader!${first}`].concat(testFiles);

module.exports = {
    mode: 'development',
    devtool: 'eval-source-map',
    entry: {
        tests: withMochaLoader
    },
    module: {
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
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    chunks: "all"
                }
            }
        }
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.mjs', '.js', '.json']
    },
    plugins: [
        new HtmlWebpackPlugin()

    ]
}
