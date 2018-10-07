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
                loader: 'ts-loader',
                options: {
                    compilerOptions: {
                        declaration: false,
                        declarationMap: false,
                        module: 'esnext'
                    }
                }
            },
            // when parsing typescript, make sure webpack ignores the dynamic require() calls
            // and doesn't polyfill different node globals (__dirname, etc)
            // best way to get a typescript bundled without warnings
            {
                include: require.resolve('typescript/lib/typescript.js'),
                parser: {
                    commonjs: false,
                    node: false
                }
            },
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.mjs', '.js', '.json']
    },
    plugins: [
        new HtmlWebpackPlugin()
    ]
}
