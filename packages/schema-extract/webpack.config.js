const {join, dirname} = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const testFiles = require('glob').sync(join(__dirname, 'test', '**', '*.spec.ts'));
const [firstTestFile, ...restTests] = testFiles

module.exports = {
    context: join(__dirname, '..', '..'),
    mode: 'development',
    devtool: 'source-map',
    entry: {
        tests: [`mocha-loader!${firstTestFile}`, ...restTests]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: '@ts-tools/webpack-loader'
            },
            {
                test: /\.d\.ts$/,
                include: /node_modules/,
                loader: 'raw-loader'
            }
        ],
        noParse: [
            require.resolve('typescript/lib/typescript.js')
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.mjs', '.js', '.json']
    },
    plugins: [
        new HtmlWebpackPlugin()
    ]
}
